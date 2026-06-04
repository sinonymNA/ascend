'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensurePlayerProgress(userId, gameId, client = db) {
  await client.query(
    `INSERT INTO em_player_progress (user_id, game_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, game_id) DO NOTHING`,
    [userId, gameId]
  );
  const { rows } = await client.query(
    `SELECT * FROM em_player_progress WHERE user_id = $1 AND game_id = $2 LIMIT 1`,
    [userId, gameId]
  );
  return rows[0];
}

async function ensurePlayerInventory(userId, client = db) {
  await client.query(
    `INSERT INTO em_player_inventory (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
  const { rows } = await client.query(
    `SELECT * FROM em_player_inventory WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return rows[0];
}

function hasSubscription(user) {
  return user && (user.subscription === 'premium' || user.subscription === 'admin');
}

function canAccessChapter(chapterNumber, user) {
  const game = { free_chapters: 1 }; // chapter 1 is always free
  if (chapterNumber <= game.free_chapters) return true;
  return hasSubscription(user);
}

// ─── GET /games ───────────────────────────────────────────────────────────────
// List all available EduMissions games with high-level player progress
router.get('/games', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    const { rows: games } = await db.query(
      `SELECT id, slug, title, subtitle, tagline, subject, status, box_art_config, color_scheme,
              total_chapters, total_encounters, estimated_hours, free_chapters
       FROM em_games
       WHERE status = 'available'
       ORDER BY created_at`
    );

    if (!userId || !games.length) return res.json({ games });

    // Attach player progress for each game
    const { rows: progRows } = await db.query(
      `SELECT game_id, total_xp_earned, total_runes_earned,
              array_length(chapters_completed, 1) AS chapters_done,
              array_length(encounters_completed, 1) AS encounters_done,
              completed_at, last_played
       FROM em_player_progress
       WHERE user_id = $1`,
      [userId]
    );
    const progByGame = Object.fromEntries(progRows.map((p) => [p.game_id, p]));

    return res.json({
      games: games.map((g) => ({
        ...g,
        player: progByGame[g.id] || null,
        is_subscribed: hasSubscription(req.dbUser),
      })),
    });
  } catch (err) {
    console.error('GET /edumissions/games:', err.message);
    res.status(500).json({ error: 'Failed to load games' });
  }
});

// ─── GET /games/:gameId ───────────────────────────────────────────────────────
// Full game structure: game + districts + chapters + player progress
router.get('/games/:gameId', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    const { gameId } = req.params;

    const { rows: gameRows } = await db.query(
      `SELECT * FROM em_games WHERE id = $1 LIMIT 1`, [gameId]
    );
    if (!gameRows.length) return res.status(404).json({ error: 'Game not found' });
    const game = gameRows[0];

    const { rows: districts } = await db.query(
      `SELECT id, slug, name, subtitle, lore, aesthetic, color_primary, color_secondary,
              order_index, chapter_count, unlock_requires
       FROM em_districts WHERE game_id = $1 ORDER BY order_index`,
      [gameId]
    );

    const { rows: chapters } = await db.query(
      `SELECT id, district_id, chapter_number, title, concept, is_boss_chapter,
              order_index, xp_reward, rune_reward, encounter_count, opening_narrative
       FROM em_chapters WHERE game_id = $1 ORDER BY chapter_number`,
      [gameId]
    );

    let progress = null;
    let inventory = null;
    if (userId) {
      progress = await ensurePlayerProgress(userId, gameId);
      inventory = await ensurePlayerInventory(userId);
    }

    const completedChapterIds = new Set(progress?.chapters_completed || []);
    const completedDistrictIds = new Set(progress?.districts_completed || []);
    const isSubscribed = hasSubscription(req.dbUser);

    // Attach chapters to districts and compute unlock/lock status
    const chapsByDistrict = {};
    for (const ch of chapters) {
      if (!chapsByDistrict[ch.district_id]) chapsByDistrict[ch.district_id] = [];
      chapsByDistrict[ch.district_id].push({
        ...ch,
        completed: completedChapterIds.has(ch.id),
        locked: !canAccessChapter(ch.chapter_number, req.dbUser),
      });
    }

    const enrichedDistricts = districts.map((d) => ({
      ...d,
      completed: completedDistrictIds.has(d.id),
      unlocked: !d.unlock_requires || completedDistrictIds.has(d.unlock_requires),
      chapters: chapsByDistrict[d.id] || [],
    }));

    res.json({
      game: { ...game, is_subscribed: isSubscribed },
      districts: enrichedDistricts,
      progress,
      runes: inventory?.total_runes ?? 0,
    });
  } catch (err) {
    console.error('GET /edumissions/games/:id:', err.message);
    res.status(500).json({ error: 'Failed to load game' });
  }
});

// ─── GET /chapters/:chapterId ─────────────────────────────────────────────────
// Chapter details + all encounters + player's attempt history for this chapter
router.get('/chapters/:chapterId', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    const { chapterId } = req.params;

    const { rows: chapRows } = await db.query(
      `SELECT * FROM em_chapters WHERE id = $1 LIMIT 1`, [chapterId]
    );
    if (!chapRows.length) return res.status(404).json({ error: 'Chapter not found' });
    const chapter = chapRows[0];

    // Paywall check
    if (!canAccessChapter(chapter.chapter_number, req.dbUser)) {
      return res.status(403).json({
        error: 'subscription_required',
        message: 'This chapter requires a Summit Premium subscription.',
        chapter_number: chapter.chapter_number,
      });
    }

    const { rows: encounters } = await db.query(
      `SELECT id, encounter_number, type, difficulty, enemy_name, enemy_type,
              pre_narrative, passage, question_stem, option_a, option_b, option_c, option_d,
              correct_answer, explanation, success_narrative, failure_narrative,
              xp_reward, rune_reward, concept_tag, difficulty_tag, act_skill_area, order_index
       FROM em_encounters
       WHERE chapter_id = $1
       ORDER BY encounter_number`,
      [chapterId]
    );

    // Get player's completed encounters for this chapter
    let completedEncounterIds = new Set();
    let progress = null;
    if (userId) {
      progress = await ensurePlayerProgress(userId, chapter.game_id);
      completedEncounterIds = new Set(progress?.encounters_completed || []);
    }

    const enrichedEncounters = encounters.map((enc) => ({
      ...enc,
      completed: completedEncounterIds.has(enc.id),
    }));

    // Find the first incomplete encounter (resume point)
    const nextEncounterIndex = enrichedEncounters.findIndex((e) => !e.completed);

    res.json({
      chapter,
      encounters: enrichedEncounters,
      next_encounter_index: nextEncounterIndex === -1 ? enrichedEncounters.length : nextEncounterIndex,
      chapter_complete: nextEncounterIndex === -1,
    });
  } catch (err) {
    console.error('GET /edumissions/chapters/:id:', err.message);
    res.status(500).json({ error: 'Failed to load chapter' });
  }
});

// ─── POST /encounters/:encounterId/attempt ────────────────────────────────────
// Submit an answer. Returns result, narrative, XP/runes earned.
// If all encounters in chapter are now done, marks chapter complete.
router.post('/encounters/:encounterId/attempt', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { encounterId } = req.params;
    const { selected_answer, time_taken_ms } = req.body;

    if (!selected_answer || !['A', 'B', 'C', 'D'].includes(selected_answer)) {
      return res.status(400).json({ error: 'selected_answer must be A, B, C, or D' });
    }

    const { rows: encRows } = await db.query(
      `SELECT e.*, c.game_id, c.chapter_number, c.xp_reward AS chapter_xp,
              c.rune_reward AS chapter_runes, c.encounter_count, c.is_boss_chapter,
              c.closing_narrative, c.boss_victory_narrative
       FROM em_encounters e
       JOIN em_chapters c ON c.id = e.chapter_id
       WHERE e.id = $1 LIMIT 1`,
      [encounterId]
    );
    if (!encRows.length) return res.status(404).json({ error: 'Encounter not found' });
    const enc = encRows[0];

    // Paywall check
    if (!canAccessChapter(enc.chapter_number, req.dbUser)) {
      return res.status(403).json({ error: 'subscription_required' });
    }

    const correct = selected_answer === enc.correct_answer;

    // Check if already completed (idempotent — allow re-attempt on wrong, no double XP on correct)
    const progress = await ensurePlayerProgress(userId, enc.game_id);
    const alreadyCompleted = (progress.encounters_completed || []).includes(encounterId);

    // Always record the attempt (for analytics/review)
    const attemptNumber = alreadyCompleted ? 2 : 1;
    await db.query(
      `INSERT INTO em_encounter_attempts
         (user_id, encounter_id, selected_answer, correct, attempt_number, time_taken_ms, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, encounterId, selected_answer, correct, attemptNumber,
       time_taken_ms || null, correct && !alreadyCompleted ? enc.xp_reward : 0]
    );

    let xpEarned = 0;
    let runesEarned = 0;
    let chapterComplete = false;
    let districtComplete = false;
    let gameComplete = false;
    let completionNarrative = null;

    if (correct && !alreadyCompleted) {
      xpEarned = enc.xp_reward;
      runesEarned = enc.rune_reward;

      const client = await db.connect();
      try {
        await client.query('BEGIN');

        // Mark encounter as completed (idempotent array append)
        await client.query(
          `UPDATE em_player_progress
           SET encounters_completed =
                 CASE WHEN NOT ($2::uuid = ANY(encounters_completed))
                      THEN array_append(encounters_completed, $2::uuid)
                      ELSE encounters_completed
                 END,
               total_xp_earned = total_xp_earned + $3,
               total_runes_earned = total_runes_earned + $4,
               last_played = NOW()
           WHERE user_id = $1 AND game_id = $5`,
          [userId, encounterId, xpEarned, runesEarned, enc.game_id]
        );

        // Grant main-game XP
        await client.query(
          `UPDATE users SET xp = xp + $1, weekly_xp = weekly_xp + $1 WHERE id = $2`,
          [xpEarned, userId]
        );

        // Grant runes to EduMissions inventory
        if (runesEarned > 0) {
          await client.query(
            `INSERT INTO em_player_inventory (user_id, total_runes)
             VALUES ($1, $2)
             ON CONFLICT (user_id) DO UPDATE
             SET total_runes = em_player_inventory.total_runes + $2, updated_at = NOW()`,
            [userId, runesEarned]
          );
        }

        // Grant coins (EduMissions earns coins too — 2 coins per XP point, small reward)
        const coinsEarned = Math.floor(xpEarned / 5);
        if (coinsEarned > 0) {
          await economy.grantRewards(
            userId,
            { coins: coinsEarned, reason: 'edumissions_encounter', refId: encounterId },
            client
          );
        }

        // Check if chapter is now complete (all encounters done)
        const updatedProg = await client.query(
          `SELECT encounters_completed, chapters_completed, districts_completed
           FROM em_player_progress WHERE user_id = $1 AND game_id = $2`,
          [userId, enc.game_id]
        );
        const prog = updatedProg.rows[0];
        const doneSet = new Set(prog.encounters_completed || []);

        // Get all encounter IDs for this chapter
        const { rows: chEncounters } = await client.query(
          `SELECT id FROM em_encounters WHERE chapter_id = $1`,
          [enc.chapter_id]
        );
        const allDone = chEncounters.every((e) => doneSet.has(e.id));

        if (allDone && !(prog.chapters_completed || []).includes(enc.chapter_id)) {
          chapterComplete = true;
          completionNarrative = enc.is_boss_chapter
            ? enc.boss_victory_narrative
            : enc.closing_narrative;

          // Grant chapter XP/rune bonus
          await client.query(
            `UPDATE users SET xp = xp + $1 WHERE id = $2`,
            [enc.chapter_xp, userId]
          );
          await client.query(
            `UPDATE em_player_inventory SET total_runes = total_runes + $1, updated_at = NOW()
             WHERE user_id = $2`,
            [enc.chapter_runes, userId]
          );
          xpEarned += enc.chapter_xp;
          runesEarned += enc.chapter_runes;

          // Mark chapter complete
          await client.query(
            `UPDATE em_player_progress
             SET chapters_completed = array_append(chapters_completed, $2),
                 current_chapter_id = $2
             WHERE user_id = $1 AND game_id = $3`,
            [userId, enc.chapter_id, enc.game_id]
          );

          // Check if district is complete
          const { rows: distChapters } = await client.query(
            `SELECT id FROM em_chapters WHERE district_id = (
               SELECT district_id FROM em_chapters WHERE id = $1
             )`,
            [enc.chapter_id]
          );
          const chapDoneSet = new Set([...(prog.chapters_completed || []), enc.chapter_id]);
          const distAllDone = distChapters.every((c) => chapDoneSet.has(c.id));

          if (distAllDone) {
            const { rows: distRows } = await client.query(
              `SELECT district_id FROM em_chapters WHERE id = $1`, [enc.chapter_id]
            );
            const districtId = distRows[0]?.district_id;
            if (districtId && !(prog.districts_completed || []).includes(districtId)) {
              districtComplete = true;
              await client.query(
                `UPDATE em_player_progress
                 SET districts_completed = array_append(districts_completed, $2),
                     wardens_defeated = array_append(wardens_defeated, $2),
                     current_district_id = $2
                 WHERE user_id = $1 AND game_id = $3`,
                [userId, districtId, enc.game_id]
              );

              // Warden seal in EduMissions inventory (append UUID string to JSON array)
              await client.query(
                `UPDATE em_player_inventory
                 SET warden_seals = warden_seals || jsonb_build_array($2::text), updated_at = NOW()
                 WHERE user_id = $1`,
                [userId, districtId]
              );
            }

            // Check game complete (all 5 districts done)
            const updProg2 = await client.query(
              `SELECT districts_completed FROM em_player_progress WHERE user_id = $1 AND game_id = $2`,
              [userId, enc.game_id]
            );
            const { rows: allDists } = await client.query(
              `SELECT id FROM em_districts WHERE game_id = $1`, [enc.game_id]
            );
            const distDoneSet = new Set(updProg2.rows[0]?.districts_completed || []);
            if (allDists.every((d) => distDoneSet.has(d.id))) {
              gameComplete = true;
              await client.query(
                `UPDATE em_player_progress SET completed_at = NOW()
                 WHERE user_id = $1 AND game_id = $2`,
                [userId, enc.game_id]
              );
              // Gem bonus for completing the full game
              await economy.grantRewards(
                userId,
                { gems: 25, reason: 'edumissions_game_complete', refId: enc.game_id },
                client
              );
            }
          }
        }

        await client.query('COMMIT');
      } catch (txErr) {
        await client.query('ROLLBACK');
        throw txErr;
      } finally {
        client.release();
      }
    }

    // Read updated inventory for response
    const inv = await ensurePlayerInventory(userId);

    res.json({
      correct,
      selected_answer,
      correct_answer: enc.correct_answer,
      explanation: enc.explanation,
      narrative: correct ? enc.success_narrative : enc.failure_narrative,
      xp_earned: xpEarned,
      runes_earned: runesEarned,
      already_completed: alreadyCompleted,
      chapter_complete: chapterComplete,
      district_complete: districtComplete,
      game_complete: gameComplete,
      completion_narrative: completionNarrative,
      total_runes: inv.total_runes,
    });
  } catch (err) {
    console.error('POST /edumissions/encounters/:id/attempt:', err.message);
    res.status(500).json({ error: 'Failed to record attempt' });
  }
});

// ─── GET /inventory ───────────────────────────────────────────────────────────
// Player's EduMissions rune inventory + cosmetics
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const inv = await ensurePlayerInventory(userId);

    const { rows: allCosmetics } = await db.query(
      `SELECT * FROM em_cosmetics ORDER BY rune_cost`
    );
    const ownedIds = new Set(inv.cosmetics_owned || []);
    const activeCosmetics = inv.active_cosmetics || {};

    res.json({
      total_runes: inv.total_runes,
      warden_seals: inv.warden_seals || [],
      cosmetics: allCosmetics.map((c) => ({
        ...c,
        owned: ownedIds.has(c.id),
        equipped: activeCosmetics[c.type] === c.id,
      })),
    });
  } catch (err) {
    console.error('GET /edumissions/inventory:', err.message);
    res.status(500).json({ error: 'Failed to load inventory' });
  }
});

// ─── POST /inventory/purchase ─────────────────────────────────────────────────
// Spend runes to purchase a cosmetic
router.post('/inventory/purchase', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { cosmetic_id } = req.body;
    if (!cosmetic_id) return res.status(400).json({ error: 'cosmetic_id required' });

    const { rows: cosRows } = await db.query(
      `SELECT * FROM em_cosmetics WHERE id = $1 LIMIT 1`, [cosmetic_id]
    );
    if (!cosRows.length) return res.status(404).json({ error: 'Cosmetic not found' });
    const cosmetic = cosRows[0];

    const inv = await ensurePlayerInventory(userId);
    if ((inv.cosmetics_owned || []).includes(cosmetic_id)) {
      return res.status(409).json({ error: 'Already owned' });
    }
    if (inv.total_runes < cosmetic.rune_cost) {
      return res.status(402).json({ error: 'Insufficient runes', have: inv.total_runes, need: cosmetic.rune_cost });
    }

    await db.query(
      `UPDATE em_player_inventory
       SET total_runes = total_runes - $1,
           cosmetics_owned = cosmetics_owned || $2::jsonb,
           updated_at = NOW()
       WHERE user_id = $3`,
      [cosmetic.rune_cost, JSON.stringify(cosmetic_id), userId]
    );

    const updated = await ensurePlayerInventory(userId);
    res.json({ ok: true, total_runes: updated.total_runes, cosmetic });
  } catch (err) {
    console.error('POST /edumissions/inventory/purchase:', err.message);
    res.status(500).json({ error: 'Failed to purchase cosmetic' });
  }
});

// ─── POST /inventory/equip ────────────────────────────────────────────────────
// Equip an owned cosmetic
router.post('/inventory/equip', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const { cosmetic_id } = req.body;
    if (!cosmetic_id) return res.status(400).json({ error: 'cosmetic_id required' });

    const { rows: cosRows } = await db.query(
      `SELECT * FROM em_cosmetics WHERE id = $1 LIMIT 1`, [cosmetic_id]
    );
    if (!cosRows.length) return res.status(404).json({ error: 'Cosmetic not found' });
    const cosmetic = cosRows[0];

    const inv = await ensurePlayerInventory(userId);
    if (cosmetic.rune_cost > 0 && !(inv.cosmetics_owned || []).includes(cosmetic_id)) {
      return res.status(403).json({ error: 'Not owned' });
    }

    // Update active_cosmetics: set this type to this cosmetic_id
    const newActive = { ...(inv.active_cosmetics || {}), [cosmetic.type]: cosmetic_id };
    await db.query(
      `UPDATE em_player_inventory SET active_cosmetics = $1, updated_at = NOW() WHERE user_id = $2`,
      [JSON.stringify(newActive), userId]
    );

    res.json({ ok: true, active_cosmetics: newActive });
  } catch (err) {
    console.error('POST /edumissions/inventory/equip:', err.message);
    res.status(500).json({ error: 'Failed to equip cosmetic' });
  }
});

// ─── GET /progress/:gameId ────────────────────────────────────────────────────
// Full player progress summary for a game
router.get('/progress/:gameId', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });

    const progress = await ensurePlayerProgress(userId, req.params.gameId);
    const inv = await ensurePlayerInventory(userId);

    // Stats: attempts
    const { rows: stats } = await db.query(
      `SELECT COUNT(*) AS total_attempts,
              SUM(CASE WHEN correct THEN 1 ELSE 0 END) AS correct_count,
              ROUND(AVG(CASE WHEN correct THEN 100.0 ELSE 0 END), 1) AS accuracy
       FROM em_encounter_attempts ea
       JOIN em_encounters e ON e.id = ea.encounter_id
       JOIN em_chapters c ON c.id = e.chapter_id
       WHERE ea.user_id = $1 AND c.game_id = $2`,
      [userId, req.params.gameId]
    );

    res.json({
      progress,
      total_runes: inv.total_runes,
      warden_seals: inv.warden_seals || [],
      stats: stats[0],
    });
  } catch (err) {
    console.error('GET /edumissions/progress/:gameId:', err.message);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

module.exports = router;
