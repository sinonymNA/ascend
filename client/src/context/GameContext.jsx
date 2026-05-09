import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { zones, questions } from '../data/apWorldHistory.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

const XP_PER_CORRECT = 50;
const XP_BONUS_STREAK_3 = 25;
const XP_BONUS_STREAK_5 = 50;
const COINS_PER_CORRECT = 10;
const COINS_BONUS_PERFECT_LEVEL = 30;
const QUESTIONS_PER_LEVEL = 10;
const BOSS_QUESTIONS = 5;
const DIAGNOSTIC_QUESTIONS = 10;

const COSMETICS = [
  // Hats
  { id: 'crown', name: 'Champion Crown', description: 'Worn by champions', price: 150, type: 'hat', emoji: '👑' },
  { id: 'wizard_hat', name: 'Wizard Hat', description: 'Arcane knowledge made visible', price: 120, type: 'hat', emoji: '🎩' },
  { id: 'laurel', name: 'Laurel Wreath', description: 'Ancient symbol of victory', price: 80, type: 'hat', emoji: '🌿' },
  // Weapons
  { id: 'sword_fire', name: 'Flame Sword', description: 'Burns with ancient fire', price: 200, type: 'weapon', emoji: '🔥' },
  { id: 'lightning_staff', name: 'Lightning Staff', description: 'Channels raw power', price: 220, type: 'weapon', emoji: '⚡' },
  { id: 'shield_gold', name: 'Gold Shield', description: 'Unbreakable defense', price: 100, type: 'weapon', emoji: '🛡️' },
  // Capes
  { id: 'cape_purple', name: 'Purple Cape', description: 'Flows with mystery', price: 120, type: 'cape', emoji: '🟣' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', description: 'Darkness made wearable', price: 180, type: 'cape', emoji: '🌑' },
  // Badges
  { id: 'star_badge', name: 'Star Badge', description: 'Shows mastery', price: 80, type: 'badge', emoji: '⭐' },
  { id: 'diamond', name: 'Diamond', description: 'Precious and rare', price: 300, type: 'badge', emoji: '💎' },
  // Auras (CSS glow effects)
  { id: 'aura_gold', name: 'Gold Aura', description: 'Radiant golden glow', price: 250, type: 'aura', emoji: '✨' },
  { id: 'aura_crimson', name: 'Crimson Aura', description: 'Blazing red energy', price: 250, type: 'aura', emoji: '🔴' },
];

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  // Auth
  authToken: null,
  userId: null,
  username: null,
  syncStatus: 'idle',        // 'idle' | 'syncing' | 'ok' | 'error'

  // Onboarding
  screen: 'login',           // start at login screen
  examType: null,
  character: null,

  // Progress
  unlockedZones: [],
  completedLevels: {},
  currentZone: null,
  currentLevel: null,

  // Active session
  sessionMode: null,
  sessionQuestions: [],
  sessionIndex: 0,
  sessionAnswers: [],
  sessionComplete: false,

  // Stats
  xp: 0,
  xpToNextLevel: 100,
  playerLevel: 1,
  coins: 0,
  streak: 0,
  maxStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,

  // Spaced repetition
  wrongQueue: [],

  // Store / cosmetics — equippedCosmetics is now { hat, weapon, cape, badge, aura }
  ownedCosmetics: [],
  equippedCosmetics: { hat: null, weapon: null, cape: null, badge: null, aura: null },

  // Boss health
  bossHp: 100,
  playerHp: 100,
  bossDefeated: false,

  // Diagnostic results
  diagnosticResults: null,

  // UI flags
  showFeedback: false,
  lastAnswerCorrect: null,
  lastAnswerExplanation: null,
  showLevelUp: false,
  xpGainAmount: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getQuestionsForLevel(zoneId, levelId) {
  return questions.filter(q => q.zoneId === zoneId && q.levelId === levelId);
}

function selectSessionQuestions(pool, count) {
  return shuffleArray(pool).slice(0, count);
}

function calcXpForLevel(level) {
  return 100 + (level - 1) * 50;
}

function buildDiagnosticPool() {
  // 2 questions per zone, randomly selected
  const pool = [];
  for (const zone of zones) {
    const zoneQs = shuffleArray(questions.filter(q => q.zoneId === zone.id));
    pool.push(...zoneQs.slice(0, 2));
  }
  return shuffleArray(pool);
}

function computeDiagnosticResults(answers) {
  const byZone = {};
  for (const zone of zones) {
    const zoneAnswers = answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q && q.zoneId === zone.id;
    });
    byZone[zone.id] = {
      total: zoneAnswers.length,
      correct: zoneAnswers.filter(a => a.correct).length,
    };
  }
  const score = answers.filter(a => a.correct).length;
  const weakZones = Object.entries(byZone)
    .filter(([, v]) => v.total > 0 && v.correct / v.total < 0.5)
    .map(([id]) => id);
  const strongZones = Object.entries(byZone)
    .filter(([, v]) => v.total > 0 && v.correct / v.total >= 0.5)
    .map(([id]) => id);
  return { score, total: answers.length, byZone, weakZones, strongZones };
}

function buildMapFromDiagnostic(diagnosticResults) {
  // All zones unlocked at start; weak zones get priority
  return zones.map(z => z.id);
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    case 'LOGIN': {
      const { authToken, userId, username, gameState } = action;
      const merged = gameState ? { ...state, ...gameState } : state;
      return { ...merged, authToken, userId, username, screen: gameState?.screen || 'landing', syncStatus: 'ok' };
    }

    case 'LOGOUT':
      return { ...INITIAL_STATE, screen: 'login' };

    case 'SYNC_START':
      return { ...state, syncStatus: 'syncing' };

    case 'SYNC_OK':
      return { ...state, syncStatus: 'ok' };

    case 'SYNC_ERROR':
      return { ...state, syncStatus: 'error' };

    case 'SET_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_EXAM_TYPE':
      return { ...state, examType: action.examType };

    case 'SET_CHARACTER':
      return { ...state, character: action.character };

    // ── Diagnostic ──────────────────────────────────────────────────────────

    case 'START_DIAGNOSTIC': {
      const pool = buildDiagnosticPool();
      return {
        ...state,
        sessionMode: 'diagnostic',
        sessionQuestions: pool,
        sessionIndex: 0,
        sessionAnswers: [],
        sessionComplete: false,
        showFeedback: false,
        lastAnswerCorrect: null,
        lastAnswerExplanation: null,
        screen: 'diagnostic',
      };
    }

    case 'FINISH_DIAGNOSTIC': {
      const results = computeDiagnosticResults(state.sessionAnswers);
      const unlockedZones = buildMapFromDiagnostic(results);
      return {
        ...state,
        diagnosticResults: results,
        unlockedZones,
        completedLevels: {},
        sessionMode: null,
        screen: 'map_reveal',
      };
    }

    // ── Level Session ────────────────────────────────────────────────────────

    case 'START_LEVEL': {
      const { zoneId, levelId } = action;
      const pool = getQuestionsForLevel(zoneId, levelId);
      const sessionQs = selectSessionQuestions(pool, QUESTIONS_PER_LEVEL);
      return {
        ...state,
        currentZone: zoneId,
        currentLevel: levelId,
        sessionMode: 'level',
        sessionQuestions: sessionQs,
        sessionIndex: 0,
        sessionAnswers: [],
        sessionComplete: false,
        showFeedback: false,
        lastAnswerCorrect: null,
        lastAnswerExplanation: null,
        screen: 'level',
      };
    }

    // ── Boss Fight ───────────────────────────────────────────────────────────

    case 'START_BOSS': {
      const { zoneId } = action;
      const zone = zones.find(z => z.id === zoneId);
      // Boss uses harder questions from the entire zone
      const pool = questions.filter(q => q.zoneId === zoneId && q.difficulty >= 2);
      const sessionQs = selectSessionQuestions(pool, BOSS_QUESTIONS);
      return {
        ...state,
        currentZone: zoneId,
        sessionMode: 'boss',
        sessionQuestions: sessionQs,
        sessionIndex: 0,
        sessionAnswers: [],
        sessionComplete: false,
        showFeedback: false,
        bossHp: 100,
        playerHp: 100,
        bossDefeated: false,
        screen: 'boss_fight',
      };
    }

    // ── Answer ────────────────────────────────────────────────────────────────

    case 'ANSWER_QUESTION': {
      const { questionId, chosen } = action;
      const question = state.sessionQuestions[state.sessionIndex];
      const correct = question.correct === chosen;

      const newAnswer = { questionId, chosen, correct };
      const newAnswers = [...state.sessionAnswers, newAnswer];

      // XP and coins
      let xpGain = 0;
      let coinsGain = 0;
      let newStreak = state.streak;
      let newMaxStreak = state.maxStreak;
      let newBossHp = state.bossHp;
      let newPlayerHp = state.playerHp;

      if (correct) {
        xpGain += XP_PER_CORRECT;
        coinsGain += COINS_PER_CORRECT;
        newStreak += 1;
        if (newStreak > newMaxStreak) newMaxStreak = newStreak;
        if (newStreak >= 5) xpGain += XP_BONUS_STREAK_5;
        else if (newStreak >= 3) xpGain += XP_BONUS_STREAK_3;

        if (state.sessionMode === 'boss') {
          newBossHp = Math.max(0, newBossHp - 25);
        }
      } else {
        newStreak = 0;
        if (state.sessionMode === 'boss') {
          newPlayerHp = Math.max(0, newPlayerHp - 20);
        }
      }

      // XP leveling
      let newXp = state.xp + xpGain;
      let newPlayerLevel = state.playerLevel;
      let newXpToNext = state.xpToNextLevel;
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newPlayerLevel += 1;
        newXpToNext = calcXpForLevel(newPlayerLevel);
      }

      // Spaced repetition: add wrong answers to review queue
      let newWrongQueue = [...state.wrongQueue];
      if (!correct) {
        const existingIdx = newWrongQueue.findIndex(w => w.questionId === questionId);
        const reviewAt = Date.now() + 1000 * 60 * 5; // 5 min
        if (existingIdx >= 0) {
          newWrongQueue[existingIdx] = { questionId, nextReviewAt: reviewAt };
        } else {
          newWrongQueue.push({ questionId, nextReviewAt: reviewAt });
        }
      }

      const didLevelUp = newPlayerLevel > state.playerLevel;

      return {
        ...state,
        sessionAnswers: newAnswers,
        showFeedback: true,
        lastAnswerCorrect: correct,
        lastAnswerExplanation: question.explanation,
        streak: newStreak,
        maxStreak: newMaxStreak,
        xp: newXp,
        playerLevel: newPlayerLevel,
        xpToNextLevel: newXpToNext,
        coins: state.coins + coinsGain,
        totalCorrect: state.totalCorrect + (correct ? 1 : 0),
        totalAnswered: state.totalAnswered + 1,
        wrongQueue: newWrongQueue,
        bossHp: newBossHp,
        playerHp: newPlayerHp,
        showLevelUp: didLevelUp,
        xpGainAmount: xpGain,
      };
    }

    case 'DISMISS_LEVEL_UP':
      return { ...state, showLevelUp: false };

    case 'DISMISS_FEEDBACK': {
      const nextIndex = state.sessionIndex + 1;
      const isLastQuestion = nextIndex >= state.sessionQuestions.length;

      if (isLastQuestion) {
        // Check if boss is defeated
        const bossDefeated = state.sessionMode === 'boss' && state.bossHp <= 0;
        return {
          ...state,
          sessionIndex: nextIndex,
          showFeedback: false,
          sessionComplete: true,
          bossDefeated,
        };
      }

      return {
        ...state,
        sessionIndex: nextIndex,
        showFeedback: false,
        lastAnswerCorrect: null,
        lastAnswerExplanation: null,
      };
    }

    case 'COMPLETE_LEVEL': {
      const { zoneId, levelId } = action;
      const prevCompleted = state.completedLevels[zoneId] || [];
      if (prevCompleted.includes(levelId)) {
        return { ...state, screen: 'adventure_map' };
      }
      const newCompleted = { ...state.completedLevels, [zoneId]: [...prevCompleted, levelId] };
      const zone = zones.find(z => z.id === zoneId);
      const allLevelsCompleted = zone
        ? zone.levels.every(l => newCompleted[zoneId]?.includes(l.id))
        : false;

      // Perfect level bonus
      const perfectLevel = state.sessionAnswers.every(a => a.correct);
      const bonusCoins = perfectLevel ? COINS_BONUS_PERFECT_LEVEL : 0;

      return {
        ...state,
        completedLevels: newCompleted,
        coins: state.coins + bonusCoins,
        screen: allLevelsCompleted ? 'adventure_map' : 'adventure_map',
      };
    }

    case 'COMPLETE_BOSS': {
      const { zoneId } = action;
      const zoneIdx = zones.findIndex(z => z.id === zoneId);
      const nextZone = zones[zoneIdx + 1];
      const newUnlocked = nextZone
        ? [...new Set([...state.unlockedZones, nextZone.id])]
        : state.unlockedZones;

      const isLastZone = !nextZone;
      return {
        ...state,
        unlockedZones: newUnlocked,
        screen: isLastZone ? 'victory' : 'adventure_map',
      };
    }

    // ── Store ─────────────────────────────────────────────────────────────────

    case 'BUY_COSMETIC': {
      const { cosmeticId } = action;
      const cosmetic = COSMETICS.find(c => c.id === cosmeticId);
      if (!cosmetic || state.coins < cosmetic.price) return state;
      if (state.ownedCosmetics.includes(cosmeticId)) return state;
      return {
        ...state,
        coins: state.coins - cosmetic.price,
        ownedCosmetics: [...state.ownedCosmetics, cosmeticId],
      };
    }

    case 'EQUIP_COSMETIC': {
      const { cosmeticId } = action;
      if (!state.ownedCosmetics.includes(cosmeticId)) return state;
      const cosmetic = COSMETICS.find(c => c.id === cosmeticId);
      if (!cosmetic) return state;
      return {
        ...state,
        equippedCosmetics: { ...state.equippedCosmetics, [cosmetic.type]: cosmeticId },
      };
    }

    case 'UNEQUIP_COSMETIC': {
      const cosmetic = COSMETICS.find(c => c.id === action.cosmeticId);
      if (!cosmetic) return state;
      return {
        ...state,
        equippedCosmetics: { ...state.equippedCosmetics, [cosmetic.type]: null },
      };
    }

    case 'NAVIGATE':
      return { ...state, screen: action.screen };

    case 'RESET_SESSION':
      return {
        ...state,
        sessionMode: null,
        sessionQuestions: [],
        sessionIndex: 0,
        sessionAnswers: [],
        sessionComplete: false,
        showFeedback: false,
        lastAnswerCorrect: null,
        lastAnswerExplanation: null,
        bossHp: 100,
        playerHp: 100,
        bossDefeated: false,
      };

    case 'RESET_GAME':
      return { ...INITIAL_STATE, authToken: state.authToken, userId: state.userId, username: state.username, screen: 'landing' };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GameContext = createContext(null);

const STORAGE_KEY = 'ascend_game_state';
const TOKEN_KEY = 'ascend_auth_token';

// Fields to exclude from server sync (transient session state)
const SYNC_EXCLUDE = new Set(['showFeedback','lastAnswerCorrect','lastAnswerExplanation','syncStatus','sessionQuestions','sessionAnswers','sessionIndex','sessionComplete','bossHp','playerHp','bossDefeated','screen']);

function getSyncPayload(state) {
  return Object.fromEntries(Object.entries(state).filter(([k]) => !SYNC_EXCLUDE.has(k)));
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initial, ...parsed };
      }
    } catch (e) { /* ignore */ }
    return initial;
  });

  const syncTimerRef = useRef(null);

  // On mount — if we have a saved token, validate it and restore server state
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { dispatch({ type: 'LOGOUT' }); return; }
    fetch(`${SERVER_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        dispatch({ type: 'LOGIN', authToken: token, userId: data.userId, username: data.username, gameState: data.gameState });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        dispatch({ type: 'LOGOUT' });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage on every state change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    if (state.authToken) {
      try { localStorage.setItem(TOKEN_KEY, state.authToken); } catch (e) { /* ignore */ }
    }
  }, [state]);

  // Debounced server sync — 3s after last state change
  useEffect(() => {
    if (!state.authToken) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      dispatch({ type: 'SYNC_START' });
      fetch(`${SERVER_URL}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.authToken}` },
        body: JSON.stringify({ gameState: getSyncPayload(state) }),
      })
        .then(r => r.ok ? dispatch({ type: 'SYNC_OK' }) : dispatch({ type: 'SYNC_ERROR' }))
        .catch(() => dispatch({ type: 'SYNC_ERROR' }));
    }, 3000);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.completedLevels, state.unlockedZones, state.coins, state.playerLevel, state.ownedCosmetics, state.equippedCosmetics]);

  // ── Action creators ───────────────────────────────────────────────────────

  const navigate = useCallback((screen) => {
    dispatch({ type: 'NAVIGATE', screen });
  }, []);

  const setExamType = useCallback((examType) => {
    dispatch({ type: 'SET_EXAM_TYPE', examType });
  }, []);

  const setCharacter = useCallback((character) => {
    dispatch({ type: 'SET_CHARACTER', character });
  }, []);

  const startDiagnostic = useCallback(() => {
    dispatch({ type: 'START_DIAGNOSTIC' });
  }, []);

  const finishDiagnostic = useCallback(() => {
    dispatch({ type: 'FINISH_DIAGNOSTIC' });
  }, []);

  const startLevel = useCallback((zoneId, levelId) => {
    dispatch({ type: 'START_LEVEL', zoneId, levelId });
  }, []);

  const startBoss = useCallback((zoneId) => {
    dispatch({ type: 'START_BOSS', zoneId });
  }, []);

  const answerQuestion = useCallback((questionId, chosen) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId, chosen });
  }, []);

  const dismissFeedback = useCallback(() => {
    dispatch({ type: 'DISMISS_FEEDBACK' });
  }, []);

  const completeLevel = useCallback((zoneId, levelId) => {
    dispatch({ type: 'COMPLETE_LEVEL', zoneId, levelId });
  }, []);

  const completeBoss = useCallback((zoneId) => {
    dispatch({ type: 'COMPLETE_BOSS', zoneId });
  }, []);

  const buyCosmetic = useCallback((cosmeticId) => {
    dispatch({ type: 'BUY_COSMETIC', cosmeticId });
  }, []);

  const equipCosmetic = useCallback((cosmeticId) => {
    dispatch({ type: 'EQUIP_COSMETIC', cosmeticId });
  }, []);

  const unequipCosmetic = useCallback((cosmeticId) => {
    dispatch({ type: 'UNEQUIP_COSMETIC', cosmeticId });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  const dismissLevelUp = useCallback(() => {
    dispatch({ type: 'DISMISS_LEVEL_UP' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loginUser = useCallback(({ authToken, userId, username, gameState }) => {
    localStorage.setItem(TOKEN_KEY, authToken);
    dispatch({ type: 'LOGIN', authToken, userId, username, gameState });
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────

  const currentQuestion = state.sessionQuestions[state.sessionIndex] || null;

  const sessionScore = state.sessionAnswers.length > 0
    ? Math.round((state.sessionAnswers.filter(a => a.correct).length / state.sessionAnswers.length) * 100)
    : 0;

  const xpPercent = Math.round((state.xp / state.xpToNextLevel) * 100);

  const getZone = useCallback((zoneId) => zones.find(z => z.id === zoneId), []);

  const isZoneUnlocked = useCallback((zoneId) => {
    return zoneId === zones[0].id || state.unlockedZones.includes(zoneId);
  }, [state.unlockedZones]);

  const isLevelCompleted = useCallback((zoneId, levelId) => {
    return (state.completedLevels[zoneId] || []).includes(levelId);
  }, [state.completedLevels]);

  const isZoneCompleted = useCallback((zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return false;
    return zone.levels.every(l => isLevelCompleted(zoneId, l.id));
  }, [isLevelCompleted]);

  const allZonesCompleted = zones.every(z => isZoneCompleted(z.id));

  const accuracy = state.totalAnswered > 0
    ? Math.round((state.totalCorrect / state.totalAnswered) * 100)
    : 0;

  const value = {
    // State
    ...state,
    // Derived
    currentQuestion,
    sessionScore,
    xpPercent,
    accuracy,
    allZonesCompleted,
    // Static data
    zones,
    questions,
    cosmetics: COSMETICS,
    // Helpers
    getZone,
    isZoneUnlocked,
    isLevelCompleted,
    isZoneCompleted,
    // Actions
    navigate,
    setExamType,
    setCharacter,
    startDiagnostic,
    finishDiagnostic,
    startLevel,
    startBoss,
    answerQuestion,
    dismissFeedback,
    completeLevel,
    completeBoss,
    buyCosmetic,
    equipCosmetic,
    unequipCosmetic,
    resetSession,
    resetGame,
    loginUser,
    logoutUser,
    dismissLevelUp,
    SERVER_URL,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export { zones, COSMETICS };
export default GameContext;
