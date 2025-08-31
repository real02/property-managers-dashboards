const express = require("express");
const reviewsController = require("../controllers/reviewsController");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get("/public/:propertyId", reviewsController.getPublicReviews);
router.get("/hostaway", reviewsController.getHostawayReviews);
router.get(
  "/manager/:managerId",
  authMiddleware,
  reviewsController.getManagerReviews,
);
router.put("/:id/approval", authMiddleware, reviewsController.toggleApproval);

module.exports = router;
