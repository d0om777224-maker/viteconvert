/**
 * Simple API Key authorization middleware
 */
function authorize(req, res, next) {
  // Use a default for local dev, but enforce strictly in production
  const providedKey = req.headers['x-api-key'];
  const secretKey = process.env.API_KEY || 'dev-local-key';

  if (!providedKey || providedKey !== secretKey) {
    return res.status(403).json({ error: 'Unauthorized: Invalid or missing API key' });
  }
  next();
}

module.exports = { authorize };
