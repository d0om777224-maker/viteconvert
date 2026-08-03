/**
 * Simple API Key authorization middleware
 */
function authorize(req, res, next) {
  // Use a default for local dev, but enforce strictly in production
  const providedKey = req.headers['x-api-key'] || req.query['x-api-key'];
  const secretKey = process.env.API_KEY || 'dev-local-key';

  console.log("Auth Attempt. Provided:", providedKey, "Expected:", secretKey);

  if (!providedKey || providedKey !== secretKey) {
    return res.status(403).json({ error: `Unauthorized. Provided: ${providedKey}` });
  }
  next();
}

module.exports = { authorize };
