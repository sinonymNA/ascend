'use strict';

/**
 * Code-defined catalogs for the Summit economy.
 * These are seeded into the DB on boot (item_definitions, daily_quest_defs,
 * season_defs/season_tiers) via initDb.js, and consulted at runtime by
 * economy.js (gacha) and the quest/season routes.
 *
 * Cosmetic `payload` fields must match what the client renders:
 *   - color        → climber_customizations.color  (hex)
 *   - trail_effect → climber_customizations.trail_effect
 *   - flag_design  → climber_customizations.flag_design
 *   - silhouette   → climber_customizations.silhouette
 * Categories 'banner','badge','theme' are collectible-only for now.
 */

// ─── Rarity → dupe-conversion coin value ────────────────────────────────────────
const RARITY_COIN_VALUE = { common: 25, rare: 100, epic: 400, legendary: 1500 };

// ─── Item catalog ───────────────────────────────────────────────────────────────
// kind: 'cosmetic' | 'boost'
const ITEMS = [
  // ── Climber colors (cosmetic / color) ──
  { id: 'color_gold',     kind: 'cosmetic', category: 'color', name: 'Summit Gold',     rarity: 'common', payload: { color: '#F5A623' } },
  { id: 'color_pine',     kind: 'cosmetic', category: 'color', name: 'Pine Green',      rarity: 'common', payload: { color: '#52B788' } },
  { id: 'color_sky',      kind: 'cosmetic', category: 'color', name: 'Sky Blue',        rarity: 'common', payload: { color: '#4A90D9' } },
  { id: 'color_coral',    kind: 'cosmetic', category: 'color', name: 'Coral',           rarity: 'common', payload: { color: '#E85D4A' } },
  { id: 'color_violet',   kind: 'cosmetic', category: 'color', name: 'Violet',          rarity: 'rare',   payload: { color: '#A78BFA' } },
  { id: 'color_rose',     kind: 'cosmetic', category: 'color', name: 'Rose',            rarity: 'rare',   payload: { color: '#F472B6' } },
  { id: 'color_mint',     kind: 'cosmetic', category: 'color', name: 'Mint',            rarity: 'rare',   payload: { color: '#34D399' } },
  { id: 'color_amber',    kind: 'cosmetic', category: 'color', name: 'Amber',           rarity: 'rare',   payload: { color: '#FBBF24' } },
  { id: 'color_azure',    kind: 'cosmetic', category: 'color', name: 'Azure',           rarity: 'epic',   payload: { color: '#60A5FA' } },
  { id: 'color_ember',    kind: 'cosmetic', category: 'color', name: 'Ember',           rarity: 'epic',   payload: { color: '#FB923C' } },
  { id: 'color_orchid',   kind: 'cosmetic', category: 'color', name: 'Orchid',          rarity: 'epic',   payload: { color: '#C084FC' } },
  { id: 'color_pearl',    kind: 'cosmetic', category: 'color', name: 'Pearl White',     rarity: 'legendary', payload: { color: '#F0EDE6' } },
  { id: 'color_obsidian', kind: 'cosmetic', category: 'color', name: 'Obsidian',        rarity: 'legendary', payload: { color: '#1B1B2F' } },

  // ── Trail effects (cosmetic / trail) ──
  { id: 'trail_none',     kind: 'cosmetic', category: 'trail', name: 'No Trail',        rarity: 'common', payload: { trail_effect: 'none' } },
  { id: 'trail_gold',     kind: 'cosmetic', category: 'trail', name: 'Gold Sparkle',    rarity: 'rare',   payload: { trail_effect: 'gold' } },
  { id: 'trail_fire',     kind: 'cosmetic', category: 'trail', name: 'Fire Trail',      rarity: 'epic',   payload: { trail_effect: 'fire' } },
  { id: 'trail_rainbow',  kind: 'cosmetic', category: 'trail', name: 'Rainbow Trail',   rarity: 'legendary', payload: { trail_effect: 'rainbow' } },
  { id: 'trail_aurora',   kind: 'cosmetic', category: 'trail', name: 'Aurora Trail',    rarity: 'legendary', payload: { trail_effect: 'aurora' } },

  // ── Flag designs (cosmetic / flag) ──
  { id: 'flag_pennant',   kind: 'cosmetic', category: 'flag', name: 'Pennant',          rarity: 'common', payload: { flag_design: 'pennant' } },
  { id: 'flag_banner',    kind: 'cosmetic', category: 'flag', name: 'Banner',           rarity: 'rare',   payload: { flag_design: 'banner' } },
  { id: 'flag_cross',     kind: 'cosmetic', category: 'flag', name: 'Summit Cross',     rarity: 'epic',   payload: { flag_design: 'summit_cross' } },
  { id: 'flag_dragon',    kind: 'cosmetic', category: 'flag', name: 'Dragon Standard',  rarity: 'legendary', payload: { flag_design: 'dragon' } },

  // ── Silhouettes (cosmetic / skin) ──
  { id: 'skin_default',   kind: 'cosmetic', category: 'skin', name: 'Classic Climber',  rarity: 'common', payload: { silhouette: 'default' } },
  { id: 'skin_explorer',  kind: 'cosmetic', category: 'skin', name: 'Explorer',         rarity: 'rare',   payload: { silhouette: 'explorer' } },
  { id: 'skin_alpinist',  kind: 'cosmetic', category: 'skin', name: 'Alpinist',         rarity: 'epic',   payload: { silhouette: 'alpinist' } },
  { id: 'skin_yeti',      kind: 'cosmetic', category: 'skin', name: 'Yeti',             rarity: 'legendary', payload: { silhouette: 'yeti' } },

  // ── Badges (cosmetic / badge — collectible) ──
  { id: 'badge_compass',  kind: 'cosmetic', category: 'badge', name: 'Compass Badge',   rarity: 'common', payload: { badge: 'compass' } },
  { id: 'badge_iceaxe',   kind: 'cosmetic', category: 'badge', name: 'Ice Axe Badge',   rarity: 'rare',   payload: { badge: 'iceaxe' } },
  { id: 'badge_crampon',  kind: 'cosmetic', category: 'badge', name: 'Crampon Badge',   rarity: 'epic',   payload: { badge: 'crampon' } },

  // ── Boosts (consumable) ──
  { id: 'boost_xp2x',         kind: 'boost', category: 'xp2x',         name: '2× XP Boost',      rarity: 'rare',   payload: { duration_min: 30 } },
  { id: 'boost_fifty',        kind: 'boost', category: 'fifty',        name: '50/50 Hint',       rarity: 'common', payload: {} },
  { id: 'boost_timefreeze',   kind: 'boost', category: 'timefreeze',   name: 'Time Freeze',      rarity: 'common', payload: {} },
  { id: 'boost_streakshield', kind: 'boost', category: 'streak_shield', name: 'Streak Insurance', rarity: 'rare', payload: {} },
];

// Attach coin_value derived from rarity, and in_packs default true
for (const it of ITEMS) {
  it.coin_value = RARITY_COIN_VALUE[it.rarity] || 25;
  if (it.in_packs === undefined) it.in_packs = true;
}

// Map level → item granted at that level (mirrors LevelUp.jsx UNLOCKS)
const LEVEL_UNLOCK_ITEMS = {
  3:  'skin_explorer',
  5:  'trail_gold',
  8:  'flag_banner',
  10: 'trail_fire',
  12: 'skin_alpinist',
  15: 'trail_rainbow',
  20: 'flag_cross',
};

// ─── Pack definitions ───────────────────────────────────────────────────────────
const PACKS = {
  standard: {
    type: 'standard', currency: 'coins', cost: 250, slots: 3,
    weights: { common: 0.70, rare: 0.235, epic: 0.05, legendary: 0.015 },
    softPity: false,
  },
  premium: {
    type: 'premium', currency: 'gems', cost: 60, slots: 5,
    weights: { common: 0.40, rare: 0.40, epic: 0.15, legendary: 0.05 },
    softPity: true, // force last slot >= rare if all prior common
  },
  boss: {
    type: 'boss', currency: 'grant', cost: 0, slots: 3,
    weights: { rare: 0.65, epic: 0.28, legendary: 0.07 },
    guaranteedFirstRare: true,
  },
};

// ─── Daily quest definitions ────────────────────────────────────────────────────
// metric: 'answers' | 'correct' | 'best_streak' | 'mastered' | 'summits'
const QUESTS = [
  { id: 'answer_15',    description: 'Answer 15 questions',          metric: 'answers',     target: 15, reward_coins: 80,  reward_gems: 0, weight: 3 },
  { id: 'answer_30',    description: 'Answer 30 questions',          metric: 'answers',     target: 30, reward_coins: 150, reward_gems: 1, weight: 2 },
  { id: 'correct_20',   description: 'Get 20 correct answers',       metric: 'correct',     target: 20, reward_coins: 120, reward_gems: 0, weight: 2 },
  { id: 'master_5',     description: 'Master 5 new questions',       metric: 'mastered',    target: 5,  reward_coins: 100, reward_gems: 1, weight: 3 },
  { id: 'master_10',    description: 'Master 10 new questions',      metric: 'mastered',    target: 10, reward_coins: 200, reward_gems: 2, weight: 1 },
  { id: 'streak_8',     description: 'Hit an 8-answer streak',       metric: 'best_streak', target: 8,  reward_coins: 130, reward_gems: 1, weight: 2 },
  { id: 'streak_15',    description: 'Hit a 15-answer streak',       metric: 'best_streak', target: 15, reward_coins: 250, reward_gems: 2, weight: 1 },
  { id: 'summit_1',     description: 'Summit a subject',             metric: 'summits',     target: 1,  reward_coins: 200, reward_gems: 3, weight: 1 },
];

// ─── Season pass ────────────────────────────────────────────────────────────────
const SEASON = {
  id: 'season_1',
  name: 'Season 1: First Ascent',
  starts_at: '2026-05-01',
  ends_at: '2026-08-31',
  active: true,
  // tier_index, xp_required (cumulative season XP), rewards
  tiers: [
    { tier_index: 1,  xp_required: 250,   reward_coins: 100, reward_gems: 0, reward_item: null },
    { tier_index: 2,  xp_required: 600,   reward_coins: 150, reward_gems: 1, reward_item: null },
    { tier_index: 3,  xp_required: 1100,  reward_coins: 0,   reward_gems: 0, reward_item: 'color_violet' },
    { tier_index: 4,  xp_required: 1800,  reward_coins: 200, reward_gems: 2, reward_item: null },
    { tier_index: 5,  xp_required: 2700,  reward_coins: 0,   reward_gems: 0, reward_item: 'trail_gold' },
    { tier_index: 6,  xp_required: 3800,  reward_coins: 300, reward_gems: 2, reward_item: null },
    { tier_index: 7,  xp_required: 5200,  reward_coins: 0,   reward_gems: 5, reward_item: null },
    { tier_index: 8,  xp_required: 7000,  reward_coins: 0,   reward_gems: 0, reward_item: 'skin_alpinist' },
    { tier_index: 9,  xp_required: 9200,  reward_coins: 500, reward_gems: 3, reward_item: null },
    { tier_index: 10, xp_required: 12000, reward_coins: 0,   reward_gems: 0, reward_item: 'trail_aurora' },
  ],
};

// League tiers in promotion order
const LEAGUE_TIERS = ['bronze', 'silver', 'gold', 'sapphire', 'ruby', 'diamond'];
const LEAGUE_COHORT_SIZE = 30;
const LEAGUE_PROMOTE = 7;   // top N promote
const LEAGUE_RELEGATE = 7;  // bottom N relegate

// Gem reward amounts for server-detected events
const GEM_REWARDS = {
  summit: 3,
  achievement: 2,
  level_up: 1,
  streak_milestone: 2, // per milestone crossed (10/25/50/100)
};
const STREAK_MILESTONES = [10, 25, 50, 100];
const COINS_PER_MASTERED = 10;

module.exports = {
  ITEMS,
  PACKS,
  QUESTS,
  SEASON,
  RARITY_COIN_VALUE,
  LEVEL_UNLOCK_ITEMS,
  LEAGUE_TIERS,
  LEAGUE_COHORT_SIZE,
  LEAGUE_PROMOTE,
  LEAGUE_RELEGATE,
  GEM_REWARDS,
  STREAK_MILESTONES,
  COINS_PER_MASTERED,
};
