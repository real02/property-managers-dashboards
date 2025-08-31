import React, { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useReviews } from "../hooks/useReviews";
import { Analytics } from "../types";
import {
  Star,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { reviews, loading, toggleApproval } = useReviews(user?.id);

  // Analytics calculations
  const analytics: Analytics | null = useMemo(() => {
    if (!reviews.length) return null;

    const totalReviews = reviews.length;
    const publicReviews = reviews.filter(
      (r) => r.is_public && r.manager_approved,
    ).length;
    const pendingReviews = reviews.filter((r) => !r.manager_approved).length;

    const avgRating =
      reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) /
      totalReviews;

    const sentimentCounts = reviews.reduce((acc: Record<string, number>, r) => {
      acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
      return acc;
    }, {});

    // Category performance
    const categoryAvgs = {
      cleanliness:
        reviews
          .filter((r) => r.cleanliness_rating)
          .reduce((sum, r) => sum + (r.cleanliness_rating || 0), 0) /
          reviews.filter((r) => r.cleanliness_rating).length || 0,
      communication:
        reviews
          .filter((r) => r.communication_rating)
          .reduce((sum, r) => sum + (r.communication_rating || 0), 0) /
          reviews.filter((r) => r.communication_rating).length || 0,
      house_rules:
        reviews
          .filter((r) => r.house_rules_rating)
          .reduce((sum, r) => sum + (r.house_rules_rating || 0), 0) /
          reviews.filter((r) => r.house_rules_rating).length || 0,
    };

    // Recent trends (last 30 days vs previous)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentReviews = reviews.filter(
      (r) => new Date(r.submitted_at) >= thirtyDaysAgo,
    );
    const recentAvgRating = recentReviews.length
      ? recentReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) /
        recentReviews.length
      : avgRating;

    const trend: "up" | "down" = recentAvgRating >= avgRating ? "up" : "down";

    return {
      totalReviews,
      publicReviews,
      pendingReviews,
      avgRating,
      recentAvgRating,
      trend,
      sentimentCounts,
      categoryAvgs,
      recentReviews: recentReviews.length,
    };
  }, [reviews]);

  const handleToggleApproval = async (
    reviewId: number,
    currentPublic: boolean,
    currentApproved: boolean,
  ): Promise<void> => {
    await toggleApproval(reviewId, !currentPublic, !currentApproved);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Reviews Dashboard
          </h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {analytics && (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Reviews
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.totalReviews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Rating
                        </dt>
                        <dd className="flex items-center">
                          <span className="text-lg font-medium text-gray-900">
                            {analytics.avgRating.toFixed(1)}
                          </span>
                          {analytics.trend === "up" ? (
                            <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="ml-2 h-4 w-4 text-red-500" />
                          )}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Public Reviews
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.publicReviews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Approval
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {analytics.pendingReviews}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sentiment Analysis */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sentiment Analysis
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.sentimentCounts).map(
                    ([sentiment, count]) => {
                      const percentage = (
                        (count / analytics.totalReviews) *
                        100
                      ).toFixed(1);
                      const color =
                        sentiment === "positive"
                          ? "bg-green-500"
                          : sentiment === "negative"
                            ? "bg-red-500"
                            : "bg-gray-500";

                      return (
                        <div key={sentiment} className="flex items-center">
                          <span className="capitalize text-sm font-medium text-gray-700 w-20">
                            {sentiment}
                          </span>
                          <div className="flex-1 mx-4">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Category Performance */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Category Performance
                </h3>
                <div className="space-y-3">
                  {Object.entries(analytics.categoryAvgs).map(
                    ([category, avg]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="capitalize text-sm font-medium text-gray-700">
                          {category.replace("_", " ")}
                        </span>
                        <div className="flex items-center">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= avg
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">
                            {avg.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Issues to Address */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Issues to Address
              </h3>
              <div className="space-y-2">
                {analytics.categoryAvgs.cleanliness < 8 && (
                  <div className="text-sm text-orange-600">
                    • Cleanliness ratings below 8.0 - consider reviewing
                    cleaning procedures
                  </div>
                )}
                {analytics.categoryAvgs.communication < 8 && (
                  <div className="text-sm text-orange-600">
                    • Communication scores need improvement - review response
                    times
                  </div>
                )}
                {analytics.sentimentCounts.negative >
                  analytics.totalReviews * 0.2 && (
                  <div className="text-sm text-orange-600">
                    • High negative sentiment detected - review recent guest
                    feedback
                  </div>
                )}
                {analytics.pendingReviews > 5 && (
                  <div className="text-sm text-orange-600">
                    • {analytics.pendingReviews} reviews pending approval
                  </div>
                )}
                {Object.values(analytics.categoryAvgs).every(
                  (avg) => avg >= 8,
                ) &&
                  (analytics.sentimentCounts.negative || 0) <=
                    analytics.totalReviews * 0.1 && (
                    <div className="text-sm text-green-600">
                      ✓ All performance metrics look good!
                    </div>
                  )}
              </div>
            </div>
          </>
        )}

        {/* Reviews Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Reviews
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Manage and moderate property reviews
            </p>
          </div>
          <ul className="divide-y divide-gray-200">
            {reviews.slice(0, 10).map((review) => (
              <li key={review.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-5 w-5 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {review.guest_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.property_name}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= (review.overall_rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          review.sentiment === "positive"
                            ? "bg-green-100 text-green-800"
                            : review.sentiment === "negative"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {review.sentiment}
                      </span>
                      <button
                        onClick={() =>
                          handleToggleApproval(
                            review.id,
                            review.is_public,
                            review.manager_approved,
                          )
                        }
                        className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                          review.is_public && review.manager_approved
                            ? "text-red-700 bg-red-100 hover:bg-red-200"
                            : "text-green-700 bg-green-100 hover:bg-green-200"
                        }`}
                      >
                        {review.is_public && review.manager_approved ? (
                          <>
                            <XCircle className="h-4 w-4 mr-1" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Make Public
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {review.review_text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
