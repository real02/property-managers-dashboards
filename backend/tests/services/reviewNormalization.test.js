const { expect } = require("chai");
const {
  normalizeHostawayReview,
  calculateOverallRating,
  extractPropertyId,
  determineSentiment,
  validateReviewData,
} = require("../../src/services/reviewNormalizationService.js");

describe("Review Normalization Service", () => {
  describe("normalizeHostawayReview()", () => {
    it("should normalize a complete Hostaway review correctly", () => {
      const hostawayData = {
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
      };

      const result = normalizeHostawayReview(hostawayData);

      expect(result).to.deep.equal({
        hostaway_id: 7453,
        property_id: "2B-N1-A-29-Shoreditch-Heights",
        property_name: "2B N1 A - 29 Shoreditch Heights",
        guest_name: "Shane Finkelstein",
        review_text:
          "Shane and family are wonderful! Would definitely host again :)",
        overall_rating: 10,
        cleanliness_rating: 10,
        communication_rating: 10,
        house_rules_rating: 10,
        review_type: "host-to-guest",
        channel: "airbnb",
        submitted_at: new Date("2020-08-21 22:45:14"),
        is_public: false,
        manager_approved: false,
        sentiment: "positive",
      });
    });

    it("should handle missing overall rating by calculating from categories", () => {
      const hostawayData = {
        id: 123,
        rating: null, // Missing overall rating
        reviewCategory: [
          { category: "cleanliness", rating: 8 },
          { category: "communication", rating: 9 },
        ],
      };

      const result = normalizeHostawayReview(hostawayData);
      expect(result.overall_rating).to.equal(8.5);
    });

    it("should handle missing categories gracefully", () => {
      const hostawayData = {
        id: 123,
        rating: 9,
        reviewCategory: [], // No categories
      };

      const result = normalizeHostawayReview(hostawayData);
      expect(result.overall_rating).to.equal(9); // Uses provided rating
      expect(result.cleanliness_rating).to.be.null;
      expect(result.communication_rating).to.be.null;
    });

    it("should handle malformed date strings", () => {
      const hostawayData = {
        id: 123,
        submittedAt: "invalid-date",
      };

      const result = normalizeHostawayReview(hostawayData);
      expect(result.submitted_at).to.be.a("date");
      expect(result.submitted_at.toString()).not.to.equal("Invalid Date");
    });
  });

  describe("calculateOverallRating()", () => {
    it("should calculate average from valid category ratings", () => {
      const categories = [
        { category: "cleanliness", rating: 8 },
        { category: "communication", rating: 10 },
        { category: "respect_house_rules", rating: 9 },
      ];

      expect(calculateOverallRating(categories)).to.equal(9);
    });

    it("should ignore null ratings in calculation", () => {
      const categories = [
        { category: "cleanliness", rating: 8 },
        { category: "communication", rating: null },
        { category: "respect_house_rules", rating: 10 },
      ];

      expect(calculateOverallRating(categories)).to.equal(9);
    });

    it("should return null for empty or invalid categories", () => {
      expect(calculateOverallRating([])).to.be.null;
      expect(calculateOverallRating(null)).to.be.null;
      expect(calculateOverallRating(undefined)).to.be.null;
    });
  });

  describe("extractPropertyId", () => {
    it("should convert listing name to propery ID", () => {
      expect(extractPropertyId("2B N1 A - 29 Shoreditch Heights")).to.equal(
        "2B-N1-A-29-Shoreditch-Heights",
      );
      expect(extractPropertyId("Studio 1A - Central London")).to.equal(
        "Studio-1A-Central-London",
      );
    });

    it("should handle special characters and spaces", () => {
      expect(extractPropertyId("Apt #5 - King's Cross & Camden")).to.equal(
        "Apt-5-Kings-Cross-Camden",
      );
    });
  });

  describe("determineSentiment()", () => {
    it("should detect positive sentiment", () => {
      expect(determineSentiment("wonderful! amazing experience!")).to.equal(
        "positive",
      );
      expect(determineSentiment("great stay, highly recommend")).to.equal(
        "positive",
      );
    });

    it("should detect negative sentiment", () => {
      expect(
        determineSentiment("terrible experience, very disappointed"),
      ).to.equal("negative");
      expect(determineSentiment("awful, dirty, would not recommend")).to.equal(
        "negative",
      );
    });

    it("should default to neutral for unclear sentiment", () => {
      expect(determineSentiment("It was okay")).to.equal("neutral");
      expect(determineSentiment("")).to.equal("neutral");
    });
  });

  describe("validateReviewData()", () => {
    it("should validate complete review data", () => {
      const validReview = {
        hostaway_id: 123,
        guest_name: "John Doe",
        review_text: "Great stay!",
        property_name: "Test Property",
      };

      expect(validateReviewData(validReview)).to.be.true;
    });

    it("should reject incomplete review data", () => {
      const incompleteReview = {
        hostaway_id: 123,
      };

      expect(validateReviewData(incompleteReview)).to.be.false;
    });
  });

  describe("Edge Cases", () => {
    it("should handle extremely long review text", () => {
      const longText = "A".repeat(10000);
      const hostawayData = {
        id: 123,
        publicReview: longText,
      };

      const result = normalizeHostawayReview(hostawayData);
      expect(result.review_text.length).to.be.at.most(5000); // Truncates it
    });

    it("should handle special characters in guest names", () => {
      const hostawayData = {
        id: 123,
        guestName: "José María Azñar-González",
      };

      const result = normalizeHostawayReview(hostawayData);
      expect(result.guest_name).to.equal("José María Azñar-González");
    });
  });
});
