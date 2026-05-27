const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

function generateClassCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// GET /api/classes
router.get('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) return res.status(400).json({ error: 'User not synced' });
  try {
    const { rows } = await db.query(
      'SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC',
      [teacherId]
    );
    return res.json({ classes: rows });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /api/classes
router.post('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) return res.status(400).json({ error: 'User not synced' });

  const { name, subject } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  // Generate unique class code
  let classCode;
  for (let i = 0; i < 10; i++) {
    classCode = generateClassCode();
    const { rows } = await db.query('SELECT id FROM classes WHERE class_code = $1', [classCode]);
    if (!rows[0]) break;
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO classes (teacher_id, name, subject, class_code)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [teacherId, name, subject || null, classCode]
    );
    return res.status(201).json({ class: rows[0] });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create class' });
  }
});

// GET /api/classes/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows: cls } = await db.query('SELECT * FROM classes WHERE id = $1', [req.params.id]);
    if (!cls[0]) return res.status(404).json({ error: 'Class not found' });
    const { rows: cnt } = await db.query(
      'SELECT COUNT(*) FROM class_members WHERE class_id = $1', [req.params.id]
    );
    return res.json({ class: { ...cls[0], memberCount: parseInt(cnt[0].count, 10) } });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/classes/:id/join
router.post('/:id/join', requireAuth, async (req, res) => {
  const studentId = req.dbUser?.id;
  if (!studentId) return res.status(400).json({ error: 'User not synced' });

  const { class_code } = req.body;
  if (!class_code) return res.status(400).json({ error: 'class_code is required' });

  try {
    const { rows } = await db.query('SELECT id, class_code FROM classes WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Class not found' });
    if (rows[0].class_code !== class_code.toUpperCase()) {
      return res.status(403).json({ error: 'Invalid class code' });
    }
    await db.query(
      `INSERT INTO class_members (class_id, student_id)
       VALUES ($1, $2) ON CONFLICT (class_id, student_id) DO NOTHING`,
      [req.params.id, studentId]
    );
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to join class' });
  }
});

// GET /api/classes/:id/members
router.get('/:id/members', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT cm.*, u.id as user_id, u.name, u.email
       FROM class_members cm
       JOIN users u ON u.id = cm.student_id
       WHERE cm.class_id = $1
       ORDER BY cm.joined_at ASC`,
      [req.params.id]
    );
    return res.json({ members: rows });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
});

module.exports = router;
