import React from 'react';
import {
  Coins, Gem, Gift, Package, Ticket, Backpack,
  Flame, Trophy, Medal, Crown, Star, Sparkles, Target, Zap, Shield, ShieldCheck, PartyPopper,
  Check, CheckCircle2, X, XCircle, AlertTriangle, Lock, Lightbulb,
  Mountain, MountainSnow, Flag,
  Settings, Bell, Volume2, VolumeX, Search, User, Users, BarChart3, TrendingUp,
  BookOpen, Pencil, FileText, ClipboardList, Share2, Smartphone, Ruler, Palette,
  Brain, FlaskConical, Wrench, Globe, Plus, ArrowUp, ArrowDown, Hand, Eye,
  Puzzle, Scissors, Timer, Skull, Swords, Diamond, ChevronRight, Compass,
} from 'lucide-react';

// ─── Semantic icon map ──────────────────────────────────────────────────────
// Maps app concepts → Lucide components. Keep names semantic (what it means,
// not what it looks like) so we can re-skin without touching call sites.
const ICONS = {
  // Currency & economy
  coins: Coins,
  money: Coins,
  gem: Gem,
  gems: Gem,
  diamond: Diamond,
  pack: Gift,
  gift: Gift,
  box: Package,
  ticket: Ticket,
  backpack: Backpack,

  // Progress & rewards
  streak: Flame,
  fire: Flame,
  trophy: Trophy,
  medal: Medal,
  crown: Crown,
  star: Star,
  sparkles: Sparkles,
  target: Target,
  boost: Zap,
  zap: Zap,
  shield: Shield,
  shieldCheck: ShieldCheck,
  celebrate: PartyPopper,

  // Status & feedback
  check: Check,
  checkCircle: CheckCircle2,
  close: X,
  x: X,
  xCircle: XCircle,
  warning: AlertTriangle,
  lock: Lock,
  bulb: Lightbulb,

  // Mountain / brand
  mountain: MountainSnow,
  peak: Mountain,
  flag: Flag,
  compass: Compass,

  // Navigation & UI
  settings: Settings,
  bell: Bell,
  sound: Volume2,
  mute: VolumeX,
  search: Search,
  user: User,
  users: Users,
  chart: BarChart3,
  trending: TrendingUp,
  library: BookOpen,
  book: BookOpen,
  edit: Pencil,
  doc: FileText,
  clipboard: ClipboardList,
  share: Share2,
  phone: Smartphone,
  ruler: Ruler,
  palette: Palette,
  brain: Brain,
  science: FlaskConical,
  wrench: Wrench,
  globe: Globe,
  plus: Plus,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  wave: Hand,
  eye: Eye,
  chevron: ChevronRight,

  // Game modes
  puzzle: Puzzle,
  fifty: Scissors,
  timer: Timer,
  boss: Skull,
  swords: Swords,
};

/**
 * Themed icon. Sits inline with text by default.
 *
 *   <Icon name="streak" size={16} color="#F5A623" />
 *
 * Props:
 *   name        — semantic key from ICONS (falls back to a sparkle if unknown)
 *   size        — px (default 16)
 *   color       — stroke color (default 'currentColor' so it inherits text color)
 *   strokeWidth — default 2.25 for a slightly bolder, friendlier look
 *   fill        — optional fill color (e.g. solid star/medal)
 */
export default function Icon({ name, size = 16, color = 'currentColor', strokeWidth = 2.25, fill = 'none', style, ...rest }) {
  const Cmp = ICONS[name] || Sparkles;
  return (
    <Cmp
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={fill}
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', ...style }}
      aria-hidden="true"
      {...rest}
    />
  );
}

export { ICONS };
