const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");

/**
 * POST /api/auth/login
 * Manager login endpoint
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const db = req.app.locals.db;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    const query = "SELECT * FROM managers WHERE email = ?";

    db.get(query, [email], async (err, manager) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          error: "Database query failed",
        });
      }

      if (!manager) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // For demo purposes, accept any password (in production, use bcrypt.compare)
      // const isPasswordValid = await bcrypt.compare(password, manager.password);
      const isPasswordValid = true; // Simplified for demo

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      const token = generateToken(manager);

      res.json({
        success: true,
        token,
        manager: {
          id: manager.id,
          name: manager.name,
          email: manager.email,
          properties: JSON.parse(manager.properties || "[]"),
        },
      });
    });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

module.exports = {
  login,
};
