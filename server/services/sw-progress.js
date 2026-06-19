// Summit Write — shared student progress (XP/level/badges/streak) helpers.
// Used by routes/summitwrite.js (essay/guided-walk submissions) and
// routes/write-courses.js (lesson completions).

const db = require('./db');

const LEVEL_THRESHOLDS = [0, 300, 700, 1400, 2500, 4000, 6000, 8500, 11500, 15000];

function levelForXp(xp) {
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
  }
  return lvl;
}

const BADGES = [
  { id: 'trail_blazer', name: 'Trail Blazer', desc: 'First essay submitted', icon: '🥾' },
  { id: 'context_climber', name: 'Contextualization Climber', desc: 'Earned contextualization 5 times', icon: '🧗' },
  { id: 'sourcing_scout', name: 'Sourcing Scout', desc: 'Earned full document evidence on a DBQ', icon: '🔍' },
  { id: 'complexity_king', name: 'Complexity Crown', desc: 'Earned complexity 3 times', icon: '👑' },
  { id: 'revision_ranger', name: 'Revision Ranger', desc: 'Improved a score through revision', icon: '🔄' },
  { id: 'summit_writer', name: 'Summit Writer', desc: 'Earned 6+ on a DBQ', icon: '🏔' },
  { id: 'saq_mastery', name: 'SAQ Mastery', desc: 'Completed "The Craft of Three"', icon: '📜' },
  { id: 'leq_mastery', name: 'LEQ Mastery', desc: 'Completed "The Art of Argument"', icon: '⚖️' },
  { id: 'dbq_mastery', name: 'DBQ Mastery', desc: 'Completed "Reading the Room"', icon: '🗂️' },
  { id: 'thesis_champion', name: 'Thesis Champion', desc: 'Won a round of Thesis Throwdown', icon: '🥇' },
];

async function getProgress(studentId) {
  const { rows } = await db.query('SELECT * FROM sw_student_progress WHERE student_id=$1', [studentId]);
  if (rows[0]) return rows[0];
  const { rows: created } = await db.query(
    `INSERT INTO sw_student_progress (student_id) VALUES ($1)
     ON CONFLICT (student_id) DO UPDATE SET student_id=$1 RETURNING *`,
    [studentId]
  );
  return created[0];
}

async function awardProgress(studentId, { xpGain = 0, skillUpdates = {}, newBadges = [] }) {
  const prog = await getProgress(studentId);
  const xp = (prog.xp || 0) + xpGain;
  const level = levelForXp(xp);

  const skills = { ...(prog.skills || {}) };
  for (const [k, delta] of Object.entries(skillUpdates)) {
    skills[k] = Math.max(0, Math.min(100, (skills[k] || 30) + delta));
  }

  const badges = Array.isArray(prog.badges) ? [...prog.badges] : [];
  const earned = [];
  for (const b of newBadges) {
    if (!badges.includes(b)) { badges.push(b); earned.push(b); }
  }
  const badgeBonus = earned.length * 100;

  // Streak: one submission per day keeps it alive; gap of 1 day allowed once implicitly via date math
  const today = new Date().toISOString().slice(0, 10);
  let streak = prog.streak_days || 0;
  const last = prog.last_submission_date ? new Date(prog.last_submission_date).toISOString().slice(0, 10) : null;
  if (last !== today) {
    const gap = last ? Math.round((new Date(today) - new Date(last)) / 86400000) : Infinity;
    streak = gap <= 2 ? streak + 1 : 1;
  }

  await db.query(
    `UPDATE sw_student_progress
     SET xp=$2, level=$3, skills=$4, badges=$5, streak_days=$6, last_submission_date=$7, updated_at=NOW()
     WHERE student_id=$1`,
    [studentId, xp + badgeBonus, levelForXp(xp + badgeBonus), JSON.stringify(skills), JSON.stringify(badges), streak, today]
  );
  return { xp: xp + badgeBonus, level: levelForXp(xp + badgeBonus), xpGain: xpGain + badgeBonus, streak, newBadges: earned };
}

module.exports = { LEVEL_THRESHOLDS, levelForXp, BADGES, getProgress, awardProgress };
