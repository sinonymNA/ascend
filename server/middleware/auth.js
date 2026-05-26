const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

/**
 * Middleware that verifies a Clerk JWT (or fallback JWT_SECRET) from the
 * Authorization: Bearer <token> header and attaches req.user.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  // Try Clerk secret first, then fall back to JWT_SECRET
  const secrets = [
    process.env.CLERK_SECRET_KEY,
    process.env.JWT_SECRET,
  ].filter(Boolean);

  let payload = null;
  for (const secret of secrets) {
    try {
      payload = jwt.verify(token, secret);
      break;
    } catch (err) {
      // Try next secret
    }
  }

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Attach decoded payload
  req.user = payload;

  // Try to load full user record from Supabase
  const userId = payload.sub || payload.id;
  if (userId) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (data) {
      req.dbUser = data;
    }
  }

  next();
}

module.exports = { requireAuth };
