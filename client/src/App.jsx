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
