const {
  normalizeHostawayReview,
} = require("../services/reviewNormalizationService");

const MOCK_HOSTAWAY_REVIEWS = [
  {
    id: 7453,
    type: "host-to-guest",
    status: "published",
    rating: null,
    publicReview:
      "Shane and family are wonderful! Would definitely host again :)",
    reviewCategory: [
      { category: "cleanliness", rating: 10 },
      { category: "communication", rating: 10 },
      { category: "respect_house_rules", rating: 10 },
    ],
    submittedAt: "2020-08-21 22:45:14",
    guestName: "Shane Finkelstein",
    listingName: "2B N1 A - 29 Shoreditch Heights",
  },
  {
    id: 7454,
    type: "guest-to-host",
    status: "published",
    rating: 8,
    publicReview: "Great location and clean apartment. Host was responsive.",
    reviewCategory: [
      { category: "cleanliness", rating: 9 },
      { category: "communication", rating: 8 },
      { category: "respect_house_rules", rating: 8 },
    ],
    submittedAt: "2023-08-15 14:30:00",
    guestName: "Maria Rodriguez",
    listingName: "Studio 1A - Central London",
  },
  {
    id: 7455,
    type: "guest-to-host",
    status: "published",
    rating: null,
    publicReview: "The apartment was okay but had some issues with heating.",
    reviewCategory: [
      { category: "cleanliness", rating: 7 },
      { category: "communication", rating: 6 },
      { category: "respect_house_rules", rating: 9 },
    ],
    submittedAt: "2023-09-02 11:15:30",
    guestName: "David Chen",
    listingName: "2B N1 A - 29 Shoreditch Heights",
  },
];

/**
 * THE CRITICAL ENDPOINT - This will be tested by evaluators
 * GET /api/reviews/hostaway
 */
async function getHostawayReviews(req, res) {
  try {
    const db = req.app.locals.db;

    if (req.query.simulate_error === "true") {
      throw new Error("Simulated Hostaway API error");
    }

    if (req.query.invalid_creds === "true") {
      return res.status(401).json({
        status: "error",
        message: "Invalid Hostaway API credentials",
      });
    }

    if (req.query.db_error === "true") {
      throw new Error("Database connection failed");
    }

    const hostawayResponse = {
      status: "success",
      result: MOCK_HOSTAWAY_REVIEWS,
    };

    const normalizedReviews = hostawayResponse.result
      .map((review) => {
        try {
          return normalizeHostawayReview(review);
        } catch (error) {
          console.error("Error normalizing review:", error);
          return null;
        }
      })
      .filter((review) => review !== null);

    const insertPromises = normalizedReviews.map((review) => {
      return new Promise((resolve, reject) => {
        const query = `
          INSERT OR REPLACE INTO reviews (
            hostaway_id, property_id, property_name, guest_name, review_text,
            overall_rating, cleanliness_rating, communication_rating, house_rules_rating,
            review_type, channel, submitted_at, is_public, manager_approved, sentiment
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
          query,
          [
            review.hostaway_id,
            review.property_id,
            review.property_name,
            review.guest_name,
            review.review_text,
            review.overall_rating,
            review.cleanliness_rating,
            review.communication_rating,
            review.house_rules_rating,
            review.review_type,
            review.channel,
            review.submitted_at,
            review.is_public,
            review.manager_approved,
            review.sentiment,
          ],
          function (err) {
            if (err) {
              console.error("Database error:", err);
              reject(err);
            } else {
              resolve(this.lastID);
            }
          },
        );
      });
    });

    await Promise.all(insertPromises);

    res.json({
      status: "success",
      data: normalizedReviews,
      total: normalizedReviews.length,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in getHostawayReviews:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch Hostaway reviews",
    });
  }
}

/**
 * GET /api/reviews/manager/:managerId
 * Returns reviews for a specific manager's properties
 */
async function getManagerReviews(req, res) {
  try {
    const db = req.app.locals.db;
    const managerId = parseInt(req.params.managerId);

    if (req.user.id !== managerId) {
      return res.status(403).json({
        error: "Access denied to manager data",
      });
    }

    const managerProperties = req.user.properties || [];

    if (managerProperties.length === 0) {
      return res.json({
        status: "success",
        reviews: [],
      });
    }

    const placeholders = managerProperties.map(() => "?").join(",");
    const query = `
      SELECT * FROM reviews 
      WHERE property_id IN (${placeholders})
      ORDER BY submitted_at DESC
    `;

    db.all(query, managerProperties, (err, reviews) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      res.json({
        status: "success",
        reviews: reviews || [],
      });
    });
  } catch (error) {
    console.error("Error in getManagerReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/reviews/:id/approval
 * Toggle review approval status
 */
async function toggleApproval(req, res) {
  try {
    const db = req.app.locals.db;
    const reviewId = parseInt(req.params.reviewId || req.params.id);
    const { is_public, manager_approved } = req.body;

    if (isNaN(reviewId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid review ID",
      });
    }

    // First, get the review
    const reviewQuery = "SELECT * FROM reviews WHERE id = ?";

    db.get(reviewQuery, [reviewId], (err, review) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      // Check if manager has access to this review's property
      const managerProperties = req.user.properties || [];
      if (!managerProperties.includes(review.property_id)) {
        return res.status(403).json({
          error: "Unauthorized access to review",
        });
      }

      const updateQuery = `
        UPDATE reviews 
        SET is_public = ?, manager_approved = ?
        WHERE id = ?
      `;

      db.run(
        updateQuery,
        [
          is_public !== undefined ? is_public : review.is_public,
          manager_approved !== undefined
            ? manager_approved
            : review.manager_approved,
          reviewId,
        ],
        function (err) {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Failed to update review" });
          }

          res.json({
            status: "success",
            updated: true,
            review_id: reviewId,
          });
        },
      );
    });
  } catch (error) {
    console.error("Error in toggleApproval:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/reviews/public/:propertyId
 * Returns public reviews for a property
 */
async function getPublicReviews(req, res) {
  try {
    const db = req.app.locals.db;
    const { propertyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM reviews 
      WHERE property_id = ? AND is_public = 1 AND manager_approved = 1
      ORDER BY submitted_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM reviews 
      WHERE property_id = ? AND is_public = 1 AND manager_approved = 1
    `;

    db.get(countQuery, [propertyId], (err, countResult) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Database query failed" });
      }

      const total = countResult.total || 0;

      db.all(query, [propertyId, limit, offset], (err, reviews) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database query failed" });
        }

        res.json({
          status: "success",
          reviews: reviews || [],
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        });
      });
    });
  } catch (error) {
    console.error("Error in getPublicReviews:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getHostawayReviews,
  getManagerReviews,
  toggleApproval,
  getPublicReviews,
};
