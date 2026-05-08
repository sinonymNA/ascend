import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider, useGame } from './context/GameContext.jsx';

import LandingPage from './pages/LandingPage.jsx';
import ExamSelectPage from './pages/ExamSelectPage.jsx';
import CharacterCreatePage from './pages/CharacterCreatePage.jsx';
import DiagnosticPage from './pages/DiagnosticPage.jsx';
import MapRevealPage from './pages/MapRevealPage.jsx';
import AdventureMapPage from './pages/AdventureMapPage.jsx';
import LevelPage from './pages/LevelPage.jsx';
import BossFightPage from './pages/BossFightPage.jsx';
import StorePage from './pages/StorePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import VictoryPage from './pages/VictoryPage.jsx';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2, ease: 'easeIn' } },
};

function Router() {
  const { screen } = useGame();

  const pages = {
    landing: LandingPage,
    exam_select: ExamSelectPage,
    character_create: CharacterCreatePage,
    diagnostic: DiagnosticPage,
    map_reveal: MapRevealPage,
    adventure_map: AdventureMapPage,
    level: LevelPage,
    boss_fight: BossFightPage,
    store: StorePage,
    profile: ProfilePage,
    victory: VictoryPage,
  };

  const Page = pages[screen] || LandingPage;

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
        <Page />
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Router />
    </GameProvider>
  );
}
