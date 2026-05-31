'use strict';
const db = require('./db');
const {
  ITEMS, PACKS, QUESTS, RARITY_COIN_VALUE, COINS_PER_MASTERED,
} = require('./catalog');

const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
const ITEMS_BY_RARITY = ITEMS.reduce((acc, it) => {
  if (it.in_packs === false) return acc;
  (acc[it.rarity] = acc[it.rarity] || []).push(it);
  return acc;
}, {});

// ─── Wallet ─────────────────────────────────────────────────────────────────────
async function ensureWallet(userId) {
  await db.query(
    `INSERT INTO user_wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

async function getWallet(userId) {
  await ensureWallet(userId);
  const { rows } = await db.query(
    'SELECT coins, gems FROM user_wallets WHERE user_id = $1',
    [userId]
  );
  return { coins: Number(rows[0]?.coins || 0), gems: Number(rows[0]?.gems || 0) };
}

/**
 * Single chokepoint for all currency changes. Writes wallet + ledger.
 * Pass a `client` to run inside an existing transaction; otherwise uses pool.
 */
async function grantRewards(userId, { coins = 0, gems = 0, reason, refId = null }, client = db) {
  if (!coins && !gems) return;
  await client.query(
    `INSERT INTO user_wallets (user_id, coins, gems) VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET
       coins = user_wallets.coins + $2,
       gems  = user_wallets.gems + $3,
       updated_at = NOW()`,
    [userId, coins, gems]
  );
  await client.query(
    `INSERT INTO currency_ledger (user_id, coins_delta, gems_delta, reason, ref_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, coins, gems, reason || 'unknown', refId]
  );
}

// ─── Gacha ──────────────────────────────────────────────────────────────────────
const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];

function rollRarity(weights) {
  const r = Math.random();
  let acc = 0;
  for (const tier of RARITY_ORDER) {
    acc += weights[tier] || 0;
    if (r < acc) return tier;
  }
  // fallback to highest defined
  const defined = RARITY_ORDER.filter((t) => weights[t]);
  return defined[defined.length - 1] || 'common';
}

function atLeastRare(tier) {
  return RARITY_ORDER.indexOf(tier) >= 1;
}

function pickItemOfRarity(rarity) {
  const pool = ITEMS_BY_RARITY[rarity] || ITEMS_BY_RARITY.common || ITEMS;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Open a pack. Validates+deducts currency (unless granted), runs gacha,
 * dedupes cosmetics → coins, stacks boosts. All in one transaction.
 * Returns { results, wallet }.
 */
async function openPack(userId, packType, { granted = false } = {}) {
  const pack = PACKS[packType];
  if (!pack) throw Object.assign(new Error('Unknown pack type'), { status: 400 });

  const client = await db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO user_wallets (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    );

    // Lock wallet row
    const wRes = await client.query('SELECT coins, gems FROM user_wallets WHERE user_id = $1 FOR UPDATE', [userId]);
    let coins = Number(wRes.rows[0].coins);
    let gems = Number(wRes.rows[0].gems);

    if (!granted && pack.currency !== 'grant') {
      if (pack.currency === 'coins') {
        if (coins < pack.cost) throw Object.assign(new Error('Not enough coins'), { status: 400 });
        coins -= pack.cost;
      } else if (pack.currency === 'gems') {
        if (gems < pack.cost) throw Object.assign(new Error('Not enough gems'), { status: 400 });
        gems -= pack.cost;
      }
      await client.query(
        `UPDATE user_wallets SET coins = $2, gems = $3, updated_at = NOW() WHERE user_id = $1`,
        [userId, coins, gems]
      );
      await client.query(
        `INSERT INTO currency_ledger (user_id, coins_delta, gems_delta, reason, ref_id)
         VALUES ($1, $2, $3, 'pack_purchase', $4)`,
        [userId, pack.currency === 'coins' ? -pack.cost : 0, pack.currency === 'gems' ? -pack.cost : 0, packType]
      );
    }

    // Load owned cosmetics for dedupe
    const ownedRes = await client.query(
      `SELECT item_id FROM user_inventory WHERE user_id = $1`, [userId]
    );
    const owned = new Set(ownedRes.rows.map((r) => r.item_id));

    const results = [];
    let coinRefundTotal = 0;
    let priorAllCommon = true;

    for (let slot = 0; slot < pack.slots; slot++) {
      let rarity = rollRarity(pack.weights);

      // Guarantees
      if (pack.guaranteedFirstRare && slot === 0 && !atLeastRare(rarity)) rarity = 'rare';
      if (pack.softPity && slot === pack.slots - 1 && priorAllCommon && !atLeastRare(rarity)) rarity = 'rare';
      if (atLeastRare(rarity)) priorAllCommon = false;

      const item = pickItemOfRarity(rarity);
      const isBoost = item.kind === 'boost';

      if (isBoost) {
        await client.query(
          `INSERT INTO user_inventory (user_id, item_id, quantity, equipped)
           VALUES ($1, $2, 1, FALSE)
           ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + 1`,
          [userId, item.id]
        );
        results.push({ item_id: item.id, name: item.name, category: item.category, kind: item.kind, rarity: item.rarity, payload: item.payload, isNew: !owned.has(item.id), coinRefund: 0 });
      } else if (owned.has(item.id)) {
        // Duplicate cosmetic → convert to coins
        const refund = RARITY_COIN_VALUE[item.rarity] || 25;
        coinRefundTotal += refund;
        results.push({ item_id: item.id, name: item.name, category: item.category, kind: item.kind, rarity: item.rarity, payload: item.payload, isNew: false, coinRefund: refund });
      } else {
        await client.query(
          `INSERT INTO user_inventory (user_id, item_id, quantity, equipped)
           VALUES ($1, $2, 1, FALSE)
           ON CONFLICT (user_id, item_id) DO NOTHING`,
          [userId, item.id]
        );
        owned.add(item.id);
        results.push({ item_id: item.id, name: item.name, category: item.category, kind: item.kind, rarity: item.rarity, payload: item.payload, isNew: true, coinRefund: 0 });
      }
    }

    if (coinRefundTotal > 0) {
      coins += coinRefundTotal;
      await client.query(
        `UPDATE user_wallets SET coins = $2, updated_at = NOW() WHERE user_id = $1`,
        [userId, coins]
      );
      await client.query(
        `INSERT INTO currency_ledger (user_id, coins_delta, gems_delta, reason, ref_id)
         VALUES ($1, $2, 0, 'dupe_convert', $3)`,
        [userId, coinRefundTotal, packType]
      );
    }

    await client.query(
      `INSERT INTO currency_ledger (user_id, coins_delta, gems_delta, reason, ref_id)
       VALUES ($1, 0, 0, 'pack_open', $2)`,
      [userId, packType]
    );

    await client.query('COMMIT');
    return { results, wallet: { coins, gems } };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// ─── Daily quests ───────────────────────────────────────────────────────────────
function utcDate() {
  return new Date().toISOString().slice(0, 10);
}

const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

// Deterministic-ish daily assignment: pick 3 weighted-random quests for the day.
async function ensureDailyQuests(userId) {
  const today = utcDate();
  const { rows } = await db.query(
    `SELECT quest_id, progress, target, claimed FROM user_daily_quests
     WHERE user_id = $1 AND quest_date = $2`,
    [userId, today]
  );
  if (rows.length > 0) return rows;

  // Weighted sample of 3 distinct quests
  const pool = [];
  for (const q of QUESTS) for (let i = 0; i < (q.weight || 1); i++) pool.push(q.id);
  const chosen = [];
  const seen = new Set();
  let guard = 0;
  while (chosen.length < 3 && guard < 100) {
    guard++;
    const id = pool[Math.floor(Math.random() * pool.length)];
    if (seen.has(id)) continue;
    seen.add(id);
    chosen.push(id);
  }
  for (const id of chosen) {
    const def = QUEST_BY_ID[id];
    await db.query(
      `INSERT INTO user_daily_quests (user_id, quest_id, quest_date, progress, target, claimed)
       VALUES ($1, $2, $3, 0, $4, FALSE)
       ON CONFLICT (user_id, quest_id, quest_date) DO NOTHING`,
      [userId, id, today, def.target]
    );
  }
  const fresh = await db.query(
    `SELECT quest_id, progress, target, claimed FROM user_daily_quests
     WHERE user_id = $1 AND quest_date = $2`,
    [userId, today]
  );
  return fresh.rows;
}

/**
 * Advance today's quests from a session's validated stats.
 * stats: { answers, correct, mastered, bestStreak, summits }
 */
async function advanceQuests(userId, stats) {
  const today = utcDate();
  await ensureDailyQuests(userId);
  const { rows } = await db.query(
    `SELECT quest_id, progress, target, claimed FROM user_daily_quests
     WHERE user_id = $1 AND quest_date = $2`,
    [userId, today]
  );

  for (const row of rows) {
    if (row.claimed) continue;
    const def = QUEST_BY_ID[row.quest_id];
    if (!def) continue;
    let inc = 0;
    let absolute = null;
    switch (def.metric) {
      case 'answers':     inc = stats.answers || 0; break;
      case 'correct':     inc = stats.correct || 0; break;
      case 'mastered':    inc = stats.mastered || 0; break;
      case 'summits':     inc = stats.summits || 0; break;
      case 'best_streak': absolute = Math.max(row.progress, stats.bestStreak || 0); break;
      default: break;
    }
    const newProgress = absolute !== null ? absolute : Math.min(row.target, row.progress + inc);
    if (newProgress !== row.progress) {
      await db.query(
        `UPDATE user_daily_quests SET progress = $4
         WHERE user_id = $1 AND quest_id = $2 AND quest_date = $3`,
        [userId, row.quest_id, today, newProgress]
      );
    }
  }
}

module.exports = {
  ensureWallet,
  getWallet,
  grantRewards,
  openPack,
  ensureDailyQuests,
  advanceQuests,
  QUEST_BY_ID,
  ITEM_BY_ID,
  COINS_PER_MASTERED,
};
