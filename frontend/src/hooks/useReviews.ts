import { useState, useEffect } from "react";
import { reviewsAPI } from "../services/api";
import { Review, UseReviewsResult } from "../types";

export const useReviews = (managerId?: number): UseReviewsResult => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async (): Promise<void> => {
    if (!managerId) return;

    try {
      setLoading(true);
      const response = await reviewsAPI.getManagerReviews(managerId);
      setReviews(response.data.reviews || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (
    reviewId: number,
    isPublic: boolean,
    managerApproved: boolean,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await reviewsAPI.toggleApproval(reviewId, {
        is_public: isPublic,
        manager_approved: managerApproved,
      });
      // Refresh reviews
      await fetchReviews();
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.response?.data?.error || "Failed to update review",
      };
    }
  };

  useEffect(() => {
    if (managerId) {
      fetchReviews();
    }
  }, [managerId]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    toggleApproval,
  };
};
