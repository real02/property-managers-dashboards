/**
 * Normalizes a Hostaway review into our standard format
 * @param {Object} hostawayData
 * returns {Object}
 */
function normalizeHostawayReview(hostawayData) {
  if (!hostawayData || !hostawayData.id) {
    throw new Error("Invalid hostaway data: missing id");
  }

  let overallRating = hostawayData.rating;
  if (overallRating == null || overallRating === undefined) {
    overallRating = calculateOverallRating(hostawayData.reviewCategory);
  }

  const cleanlinessRating = findCategoryRating(
    hostawayData.reviewCategory,
    "cleanliness",
  );
  const communicationRating = findCategoryRating(
    hostawayData.reviewCategory,
    "communication",
  );
  const houseRulesRating = findCategoryRating(
    hostawayData.reviewCategory,
    "respect_house_rules",
  );

  let reviewText = hostawayData.publicReview || "";
  if (reviewText.length > 5000) {
    reviewText = reviewText.substring(0, 5000);
  }

  const submittedAt = parseDate(hostawayData.submittedAt);

  return {
    hostaway_id: hostawayData.id,
    property_id: extractPropertyId(hostawayData.listingName || ""),
    property_name: hostawayData.listingName || "",
    guest_name: hostawayData.guestName || "",
    review_text: reviewText,
    overall_rating: overallRating,
    cleanliness_rating: cleanlinessRating,
    communication_rating: communicationRating,
    house_rules_rating: houseRulesRating,
    review_type: hostawayData.type || "guest-to-host",
    channel: "airbnb", // Default
    submitted_at: submittedAt,
    is_public: false, // Default to private until manager approves
    manager_approved: false, // Default to not approved
    sentiment: determineSentiment(reviewText),
  };
}

/**
 * Calculates overall rating from category ratings
 * @param {Array} categories - Array of category rating objects
 * @returns {number|null} - Average rating or null if no valid ratings
 */
function calculateOverallRating(categories) {
  if (!categories || !Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const validRatings = categories
    .filter(
      (cat) =>
        cat &&
        cat.rating !== null &&
        cat.rating !== undefined &&
        !isNaN(cat.rating),
    )
    .map((cat) => cat.rating);

  if (validRatings.length === 0) {
    return null;
  }

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
}

/**
 * Helper function to find rating for a specific category
 * @param {Array} categories
 * @param {string} categoryName
 * @returns {number|null}
 */
function findCategoryRating(categories, categoryName) {
  if (!categories || !Array.isArray(categories)) {
    return null;
  }

  const category = categories.find(
    (cat) => cat && cat.category === categoryName,
  );
  return category && category.rating !== null ? category.rating : null;
}

/**
 * Extracts property ID from listing name
 * @param {string} listingName - Full listing name
 * @returns {string} - Clean property ID
 */
function extractPropertyId(listingName) {
  if (!listingName) return "";

  return listingName
    .replace(/[#&']/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Determines sentiment from review text
 * @param {string} reviewText - text to review
 * @returns {string} - 'positive', 'negative', or 'neutral'
 */
function determineSentiment(reviewText) {
  if (!reviewText || typeof reviewText !== "string") {
    return "neutral";
  }

  const text = reviewText.toLowerCase();

  const positiveWords = [
    "wonderful",
    "amazing",
    "excellent",
    "great",
    "fantastic",
    "perfect",
    "awesome",
    "love",
    "beautiful",
    "clean",
    "recommend",
    "outstanding",
    "superb",
    "brilliant",
  ];

  const negativeWords = [
    "terrible",
    "awful",
    "horrible",
    "bad",
    "worst",
    "dirty",
    "disgusting",
    "disappointed",
    "never again",
    "not recommend",
    "poor",
    "rude",
    "uncomfortable",
  ];

  const positiveCount = positiveWords.filter((word) =>
    text.includes(word),
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    text.includes(word),
  ).length;

  if (positiveCount > negativeCount) {
    return "positive";
  } else if (negativeCount > positiveCount) {
    return "negative";
  }

  return "neutral";
}

/**
 * Validates normalized review data
 * @param {Object} reviewData
 * @returns {boolean} - True if valid, false otherwise
 */
function validateReviewData(reviewData) {
  if (!reviewData || typeof reviewData !== "object") {
    return false;
  }

  const requiredFields = [
    "hostaway_id",
    "guest_name",
    "review_text",
    "property_name",
  ];

  return requiredFields.every((field) => {
    const value = reviewData[field];
    return value !== null && value !== undefined && value !== "";
  });
}

/**
 * Helper function to parse date strings safely
 * @param {string} dateString
 * @returns {Date}
 */
function parseDate(dateString) {
  if (!dateString) {
    return new Date();
  }

  const parsed = new Date(dateString);

  if (isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

module.exports = {
  normalizeHostawayReview,
  calculateOverallRating,
  extractPropertyId,
  determineSentiment,
  validateReviewData,
};
