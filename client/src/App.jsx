import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── AppContext ───────────────────────────────────────────────────────────────

export const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider (App.jsx)');
  return ctx;
}

// ─── Page imports ─────────────────────────────────────────────────────────────
// We use lazy() so that each screen's bundle chunk is loaded on demand.

const LandingPage          = React.lazy(() => import('./pages/LandingPage.jsx'));
const TeacherDashboard     = React.lazy(() => import('./pages/TeacherDashboard.jsx'));
const HostGame             = React.lazy(() => import('./pages/HostGame.jsx'));
const TeacherLive          = React.lazy(() => import('./pages/TeacherLive.jsx'));
const StudentJoin          = React.lazy(() => import('./pages/StudentJoin.jsx'));
const StudentGame          = React.lazy(() => import('./pages/StudentGame.jsx'));
const Results              = React.lazy(() => import('./pages/Results.jsx'));
const QuestionBuilder      = React.lazy(() => import('./pages/QuestionBuilder.jsx'));
const Library              = React.lazy(() => import('./pages/Library.jsx'));
const Settings             = React.lazy(() => import('./pages/Settings.jsx'));
const AuthPage             = React.lazy(() => import('./pages/AuthPage.jsx'));
const StudentDashboard     = React.lazy(() => import('./pages/StudentDashboard.jsx'));
const SoloGame             = React.lazy(() => import('./pages/SoloGame.jsx'));
const SessionResults       = React.lazy(() => import('./pages/SessionResults.jsx'));
const Leaderboard          = React.lazy(() => import('./pages/Leaderboard.jsx'));
const DiagnosticQuiz       = React.lazy(() => import('./pages/DiagnosticQuiz.jsx'));
const Shop                 = React.lazy(() => import('./pages/Shop.jsx'));
const PackOpening          = React.lazy(() => import('./pages/PackOpening.jsx'));
const Quests               = React.lazy(() => import('./pages/Quests.jsx'));
const Leagues              = React.lazy(() => import('./pages/Leagues.jsx'));
const SeasonPass           = React.lazy(() => import('./pages/SeasonPass.jsx'));
const BlitzGame            = React.lazy(() => import('./pages/BlitzGame.jsx'));
const BossClimb            = React.lazy(() => import('./pages/BossClimb.jsx'));
const BlockBlast           = React.lazy(() => import('./pages/BlockBlast.jsx'));
const SummitHome           = React.lazy(() => import('./pages/SummitHome.jsx'));
const ChroniclesMap        = React.lazy(() => import('./pages/ChroniclesMap.jsx'));
const ChroniclesBattle     = React.lazy(() => import('./pages/ChroniclesBattle.jsx'));
const ChroniclesPrologue   = React.lazy(() => import('./pages/ChroniclesPrologue.jsx'));
const CharacterProfile     = React.lazy(() => import('./pages/CharacterProfile.jsx'));
const WriteHome            = React.lazy(() => import('./pages/WriteHome.jsx'));
const WritingRoom          = React.lazy(() => import('./pages/WritingRoom.jsx'));
const WriteResults         = React.lazy(() => import('./pages/WriteResults.jsx'));
const WriteTeacher         = React.lazy(() => import('./pages/WriteTeacher.jsx'));

const SCREEN_MAP = {
  landing:           LandingPage,
  teacher_dashboard: TeacherDashboard,
  host_game:         HostGame,
  teacher_live:      TeacherLive,
  student_join:      StudentJoin,
  student_game:      StudentGame,
  results:           Results,
  question_builder:  QuestionBuilder,
  library:           Library,
  settings:          Settings,
  auth:              AuthPage,
  student_dashboard: StudentDashboard,
  solo_game:         SoloGame,
  session_results:   SessionResults,
  leaderboard:       Leaderboard,
  diagnostic:        DiagnosticQuiz,
  shop:              Shop,
  pack_open:         PackOpening,
  quests:            Quests,
  leagues:           Leagues,
  season:            SeasonPass,
  blitz_game:        BlitzGame,
  boss_game:         BossClimb,
  block_blast:       BlockBlast,
  summit_home:         SummitHome,
  chronicles_map:      ChroniclesMap,
  chronicles_battle:   ChroniclesBattle,
  chronicles_prologue: ChroniclesPrologue,
  character_profile:   CharacterProfile,
  write_home:          WriteHome,
  writing_room:        WritingRoom,
  write_results:       WriteResults,
  write_teacher:       WriteTeacher,
};

// ─── Page transition variants ─────────────────────────────────────────────────

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.18, ease: 'easeIn' },
  },
};

// ─── AppProvider ──────────────────────────────────────────────────────────────

function AppProvider({ children }) {
  // Auth
  const [token, setTokenState] = useState(
    () => localStorage.getItem('summit_token') || null
  );
  const [user, setUser] = useState(null);

  // Navigation
  const [screen, setScreen] = useState('landing');
  const [screenParams, setScreenParams] = useState({});

  // Live game state
  const [gameState, setGameState] = useState(null);

  // Economy wallet
  const [wallet, setWallet] = useState({ coins: 0, gems: 0 });
  const refreshWallet = useCallback(() => {
    const base = (import.meta.env.VITE_SERVER_URL || '');
    const t = localStorage.getItem('summit_token');
    if (!t) return;
    fetch(`${base}/api/economy/wallet`, { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((w) => { if (w) setWallet({ coins: w.coins || 0, gems: w.gems || 0 }); })
      .catch(() => {});
  }, []);

  // Persisted token to localStorage
  const setToken = useCallback((t) => {
    if (t) localStorage.setItem('summit_token', t);
    else localStorage.removeItem('summit_token');
    setTokenState(t);
  }, []);

  // navigate(screen, params?)
  const navigate = useCallback((nextScreen, params = {}) => {
    setScreenParams(params);
    setScreen(nextScreen);
  }, []);

  // Auth bootstrap — runs once on mount
  const bootstrapRun = useRef(false);
  useEffect(() => {
    if (bootstrapRun.current) return;
    bootstrapRun.current = true;

    const storedToken = localStorage.getItem('summit_token');
    if (!storedToken) return;

    const base = (import.meta.env.VITE_SERVER_URL || '');
    fetch(`${base}/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('unauthorized');
        return res.json();
      })
      .then((data) => {
        const u = data.user || data;
        setUser(u);
        if (data.streakUpdate?.isNewDay) {
          window.__summitStreakUpdate = data.streakUpdate;
        }
        if (u.role === 'teacher') {
          navigate('teacher_dashboard');
        } else {
          navigate('student_dashboard');
          refreshWallet();
        }
      })
      .catch(() => {
        localStorage.removeItem('summit_token');
        setTokenState(null);
      });
  }, [navigate, refreshWallet]);

  const value = {
    // auth
    token,
    setToken,
    user,
    setUser,
    // navigation
    screen,
    setScreen,
    navigate,
    screenParams,
    // game
    gameState,
    setGameState,
    // economy
    wallet,
    setWallet,
    refreshWallet,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  const { screen } = useApp();
  const Page = SCREEN_MAP[screen] || LandingPage;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh' }}
      >
        <React.Suspense
          fallback={
            <div
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg)',
                color: 'var(--text-muted)',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Loading…
            </div>
          }
        >
          <Page />
        </React.Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
