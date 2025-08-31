const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// routes
const reviewsRoutes = require("./routes/reviews");
const authRoutes = require("./routes/auth");

// middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

const dbPath = process.env.NODE_ENV === "test" ? ":memory" : "./reviews.db";
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      properties TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hostaway_id INTEGER UNIQUE,
      property_id TEXT NOT NULL,
      property_name TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      review_text TEXT NOT NULL,
      overall_rating REAL,
      cleanliness_rating INTEGER,
      communication_rating INTEGER,
      house_rules_rating INTEGER,
      review_type TEXT NOT NULL,
      channel TEXT DEFAULT 'airbnb',
      submitted_at DATETIME NOT NULL,
      is_public BOOLEAN DEFAULT 0,
      manager_approved BOOLEAN DEFAULT 0,
      manager_notes TEXT,
      sentiment TEXT DEFAULT 'neutral',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO managers (id, email, password, name, properties) 
    VALUES (1, 'demo22@hostaway.com', '$2a$10$dummy.hash.for.password123', 'Demo Hostaway22', '["2B-N1-A-29-Shoreditch-Heights", "Studio-1A-Central-London"]')
  `);
});

app.locals.db = db;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/reviews", reviewsRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;
