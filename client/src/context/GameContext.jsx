import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { zones, questions } from '../data/apWorldHistory.js';

// ─── Constants ───────────────────────────────────────────────────────────────

const XP_PER_CORRECT = 50;
const XP_BONUS_STREAK_3 = 25;
const XP_BONUS_STREAK_5 = 50;
const COINS_PER_CORRECT = 10;
const COINS_BONUS_PERFECT_LEVEL = 30;
const QUESTIONS_PER_LEVEL = 10;
const BOSS_QUESTIONS = 5;
const DIAGNOSTIC_QUESTIONS = 10;

const COSMETICS = [
  { id: 'shield_gold', name: 'Gold Shield', description: 'A gleaming gold shield', price: 100, type: 'avatar', emoji: '🛡️' },
  { id: 'crown', name: 'Champion Crown', description: 'Worn by champions', price: 150, type: 'avatar', emoji: '👑' },
  { id: 'sword_fire', name: 'Flame Sword', description: 'Burns with ancient fire', price: 200, type: 'avatar', emoji: '🔥' },
  { id: 'cape_purple', name: 'Purple Cape', description: 'Flows with mystery', price: 120, type: 'avatar', emoji: '🧣' },
  { id: 'star_badge', name: 'Star Badge', description: 'Shows mastery', price: 80, type: 'badge', emoji: '⭐' },
  { id: 'lightning', name: 'Lightning Strike', description: 'Speed incarnate', price: 180, type: 'badge', emoji: '⚡' },
];

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  // Onboarding
  screen: 'landing',          // current top-level screen
  examType: null,             // 'ap_world_history' | null
  character: null,            // { name, class: 'warrior'|'scholar'|'rogue', avatar: emoji }

  // Progress
  unlockedZones: [],          // zone ids
  completedLevels: {},        // { zoneId: [levelId, ...] }
  currentZone: null,
  currentLevel: null,

  // Active session
  sessionMode: null,          // 'diagnostic' | 'level' | 'boss'
  sessionQuestions: [],       // question objects for current session
  sessionIndex: 0,            // which question we're on
  sessionAnswers: [],         // { questionId, chosen, correct } for each answered
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

  // Spaced repetition: track wrong answers for review
  wrongQueue: [],             // [{ questionId, nextReviewAt }]

  // Store / cosmetics
  ownedCosmetics: [],
  equippedCosmetics: [],

  // Boss health
  bossHp: 100,
  playerHp: 100,
  bossDefeated: false,

  // Diagnostic results
  diagnosticResults: null,    // { score, weakZones, strongZones }

  // UI flags
  showFeedback: false,
  lastAnswerCorrect: null,
  lastAnswerExplanation: null,
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
      };
    }

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
      // Remove other equipped cosmetics of same type
      const filtered = state.equippedCosmetics.filter(id => {
        const c = COSMETICS.find(x => x.id === id);
        return c && c.type !== cosmetic.type;
      });
      return { ...state, equippedCosmetics: [...filtered, cosmeticId] };
    }

    case 'UNEQUIP_COSMETIC': {
      return {
        ...state,
        equippedCosmetics: state.equippedCosmetics.filter(id => id !== action.cosmeticId),
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
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const GameContext = createContext(null);

const STORAGE_KEY = 'ascend_game_state';

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial to catch any new fields
        return { ...initial, ...parsed };
      }
    } catch (e) {
      // ignore
    }
    return initial;
  });

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  }, [state]);

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

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
    localStorage.removeItem(STORAGE_KEY);
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
