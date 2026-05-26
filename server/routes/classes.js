const express = require('express');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../services/supabase');

const router = express.Router();

/** Generate a random alphanumeric class code (uppercase). */
function generateClassCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * GET /api/classes
 * List classes for the authenticated teacher.
 */
router.get('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('classes GET / error:', error);
    return res.status(500).json({ error: 'Failed to fetch classes' });
  }

  return res.json({ classes: data });
});

/**
 * POST /api/classes
 * Create a new class. Body: { name, subject?, description? }
 */
router.post('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  const { name, subject, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  // Generate a unique class code
  let classCode;
  let tries = 0;
  while (tries < 10) {
    classCode = generateClassCode(6);
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('class_code', classCode)
      .maybeSingle();
    if (!existing) break;
    tries++;
  }

  const { data, error } = await supabase
    .from('classes')
    .insert({
      teacher_id: teacherId,
      name,
      subject: subject || null,
      description: description || null,
      class_code: classCode,
    })
    .select()
    .single();

  if (error) {
    console.error('classes POST / error:', error);
    return res.status(500).json({ error: 'Failed to create class' });
  }

  return res.status(201).json({ class: data });
});

/**
 * GET /api/classes/:id
 * Get a single class with member count.
 */
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('*')
    .eq('id', id)
    .single();

  if (clsError || !cls) {
    return res.status(404).json({ error: 'Class not found' });
  }

  const { count, error: countError } = await supabase
    .from('class_members')
    .select('id', { count: 'exact', head: true })
    .eq('class_id', id);

  if (countError) {
    console.error('classes GET /:id count error:', countError);
  }

  return res.json({ class: { ...cls, memberCount: count || 0 } });
});

/**
 * POST /api/classes/:id/join
 * Student joins a class by providing the class_code.
 * Body: { class_code }
 */
router.post('/:id/join', requireAuth, async (req, res) => {
  const studentId = req.dbUser?.id;
  if (!studentId) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  const { id } = req.params;
  const { class_code } = req.body;

  if (!class_code) {
    return res.status(400).json({ error: 'class_code is required' });
  }

  // Verify the class exists and code matches
  const { data: cls, error: clsError } = await supabase
    .from('classes')
    .select('id, class_code')
    .eq('id', id)
    .single();

  if (clsError || !cls) {
    return res.status(404).json({ error: 'Class not found' });
  }

  if (cls.class_code !== class_code.toUpperCase()) {
    return res.status(403).json({ error: 'Invalid class code' });
  }

  // Upsert membership
  const { data, error } = await supabase
    .from('class_members')
    .upsert(
      { class_id: id, student_id: studentId, joined_at: new Date().toISOString() },
      { onConflict: 'class_id,student_id', returning: 'representation' }
    )
    .select()
    .single();

  if (error) {
    console.error('classes POST /:id/join error:', error);
    return res.status(500).json({ error: 'Failed to join class' });
  }

  return res.status(200).json({ membership: data });
});

/**
 * GET /api/classes/:id/members
 * List all members of a class.
 */
router.get('/:id/members', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('class_members')
    .select('*, users(id, name, email)')
    .eq('class_id', id)
    .order('joined_at', { ascending: true });

  if (error) {
    console.error('classes GET /:id/members error:', error);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }

  return res.json({ members: data });
});

module.exports = router;
