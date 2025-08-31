const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "flex-living-secret-key";

function authMiddleware(req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token." });
  }
}

function generateToken(manager) {
  return jwt.sign(
    {
      id: manager.id,
      email: manager.email,
      properties: JSON.parse(manager.properties || "[]"),
    },
    JWT_SECRET,
    { expiresIn: "24h" },
  );
}

module.exports = { authMiddleware, generateToken };
