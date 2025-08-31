import React, { useState, useMemo } from "react";
import { PropertyPerformance, Review } from "../../types";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Filter,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Building2,
  Calendar,
  BarChart3,
} from "lucide-react";

interface PerPropertyPerformanceProps {
  reviews: Review[];
}

const PerPropertyPerformanceSection: React.FC<PerPropertyPerformanceProps> = ({
  reviews,
}) => {
  const [sortBy, setSortBy] = useState<string>("avgRating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

  const propertyPerformance = useMemo((): PropertyPerformance[] => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Group reviews by property
    const propertiesMap = reviews.reduce(
      (acc: Record<string, Review[]>, review) => {
        if (!acc[review.property_id]) {
          acc[review.property_id] = [];
        }
        acc[review.property_id].push(review);
        return acc;
      },
      {},
    );

    return Object.entries(propertiesMap).map(
      ([propertyId, propertyReviews]) => {
        const totalReviews = propertyReviews.length;
        const avgRating =
          propertyReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) /
          totalReviews;

        // Recent reviews (last 30 days)
        const recentReviews = propertyReviews.filter(
          (r) => new Date(r.submitted_at) >= thirtyDaysAgo,
        );
        const recentAvgRating = recentReviews.length
          ? recentReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) /
            recentReviews.length
          : avgRating;

        const trend: "up" | "down" | "stable" =
          recentAvgRating > avgRating + 0.2
            ? "up"
            : recentAvgRating < avgRating - 0.2
              ? "down"
              : "stable";

        const sentimentCounts = propertyReviews.reduce(
          (acc: Record<string, number>, r) => {
            acc[r.sentiment] = (acc[r.sentiment] || 0) + 1;
            return acc;
          },
          {},
        );

        const categoryAvgs = {
          cleanliness:
            propertyReviews
              .filter((r) => r.cleanliness_rating)
              .reduce((sum, r) => sum + (r.cleanliness_rating || 0), 0) /
              propertyReviews.filter((r) => r.cleanliness_rating).length || 0,
          communication:
            propertyReviews
              .filter((r) => r.communication_rating)
              .reduce((sum, r) => sum + (r.communication_rating || 0), 0) /
              propertyReviews.filter((r) => r.communication_rating).length || 0,
          house_rules:
            propertyReviews
              .filter((r) => r.house_rules_rating)
              .reduce((sum, r) => sum + (r.house_rules_rating || 0), 0) /
              propertyReviews.filter((r) => r.house_rules_rating).length || 0,
        };

        const channelDistribution = propertyReviews.reduce(
          (acc: Record<string, number>, r) => {
            acc[r.channel] = (acc[r.channel] || 0) + 1;
            return acc;
          },
          {},
        );

        const issues: string[] = [];
        if (categoryAvgs.cleanliness < 7)
          issues.push("Low cleanliness ratings");
        if (categoryAvgs.communication < 7) issues.push("Communication issues");
        if (sentimentCounts.negative > totalReviews * 0.3)
          issues.push("High negative sentiment");
        if (avgRating < 7) issues.push("Below average overall rating");
        if (recentReviews.length === 0) issues.push("No recent reviews");

        return {
          propertyId,
          propertyName: propertyReviews[0].property_name,
          totalReviews,
          avgRating,
          recentAvgRating,
          trend,
          sentimentCounts,
          categoryAvgs,
          channelDistribution,
          issues,
          lastReviewDate: propertyReviews.sort(
            (a, b) =>
              new Date(b.submitted_at).getTime() -
              new Date(a.submitted_at).getTime(),
          )[0].submitted_at,
        };
      },
    );
  }, [reviews]);

  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...propertyPerformance];

    if (filterBy !== "all") {
      if (filterBy === "issues") {
        filtered = filtered.filter((p) => p.issues.length > 0);
      } else if (filterBy === "high_rating") {
        filtered = filtered.filter((p) => p.avgRating >= 8);
      } else if (filterBy === "low_rating") {
        filtered = filtered.filter((p) => p.avgRating < 7);
      }
    }

    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      if (timeFilter === "7days") {
        filterDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "30days") {
        filterDate.setDate(now.getDate() - 30);
      } else if (timeFilter === "90days") {
        filterDate.setDate(now.getDate() - 90);
      }

      filtered = filtered.filter(
        (p) => new Date(p.lastReviewDate) >= filterDate,
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: number, bVal: number;

      switch (sortBy) {
        case "avgRating":
          aVal = a.avgRating;
          bVal = b.avgRating;
          break;
        case "totalReviews":
          aVal = a.totalReviews;
          bVal = b.totalReviews;
          break;
        case "trend":
          aVal = a.trend === "up" ? 1 : a.trend === "down" ? -1 : 0;
          bVal = b.trend === "up" ? 1 : b.trend === "down" ? -1 : 0;
          break;
        case "issues":
          aVal = a.issues.length;
          bVal = b.issues.length;
          break;
        default:
          return 0;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [propertyPerformance, filterBy, timeFilter, sortBy, sortOrder]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md mt-8">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Per-Property Performance
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Analyze performance, trends, and issues by individual property
        </p>
      </div>

      {/* Filters and Sorting Controls */}
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Properties</option>
              <option value="issues">Properties with Issues</option>
              <option value="high_rating">High Rating (8+)</option>
              <option value="low_rating">Low Rating (&lt;7)</option>
            </select>
          </div>

          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center">
            {sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4 text-gray-400 mr-2" />
            ) : (
              <SortDesc className="h-4 w-4 text-gray-400 mr-2" />
            )}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="avgRating">Average Rating</option>
              <option value="totalReviews">Total Reviews</option>
              <option value="trend">Trend</option>
              <option value="issues">Issues Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600"
            >
              {sortOrder === "asc" ? (
                <SortDesc className="h-4 w-4" />
              ) : (
                <SortAsc className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Property Performance List */}
      <div className="divide-y divide-gray-200">
        {filteredAndSortedProperties.map((property) => (
          <div key={property.propertyId} className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {property.propertyName}
                </h4>
                <p className="text-sm text-gray-500">
                  {property.totalReviews} reviews • Last review:{" "}
                  {formatDate(property.lastReviewDate)}
                </p>
              </div>
              <div className="flex items-center">
                <div className="flex mr-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= property.avgRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-gray-900 mr-2">
                  {property.avgRating.toFixed(1)}
                </span>
                {property.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : property.trend === "down" ? (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                ) : (
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Performance */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Category Performance
                </h5>
                <div className="space-y-2">
                  {Object.entries(property.categoryAvgs).map(
                    ([category, avg]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-xs capitalize text-gray-600">
                          {category.replace("_", " ")}
                        </span>
                        <div className="flex items-center">
                          <div className="flex mr-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= avg
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {avg.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Sentiment Distribution */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Sentiment
                </h5>
                <div className="space-y-1">
                  {Object.entries(property.sentimentCounts).map(
                    ([sentiment, count]) => {
                      const percentage = (
                        (count / property.totalReviews) *
                        100
                      ).toFixed(0);
                      const color =
                        sentiment === "positive"
                          ? "bg-green-400"
                          : sentiment === "negative"
                            ? "bg-red-400"
                            : "bg-gray-400";

                      return (
                        <div key={sentiment} className="flex items-center">
                          <span className="text-xs capitalize text-gray-600 w-16">
                            {sentiment}
                          </span>
                          <div className="flex-1 mx-2">
                            <div className="bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${color}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {percentage}%
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Issues and Trends */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1 text-orange-500" />
                  Issues & Trends
                </h5>
                {property.issues.length > 0 ? (
                  <div className="space-y-1">
                    {property.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="text-xs text-orange-600 flex items-start"
                      >
                        <span className="mr-1">•</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-green-600">No issues detected</p>
                )}

                <div className="mt-3">
                  <div className="flex items-center text-xs">
                    <span className="text-gray-600">30-day trend:</span>
                    <span
                      className={`ml-2 font-medium ${
                        property.trend === "up"
                          ? "text-green-600"
                          : property.trend === "down"
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {property.recentAvgRating.toFixed(1)}(
                      {property.trend === "up"
                        ? "+"
                        : property.trend === "down"
                          ? ""
                          : "±"}
                      {Math.abs(
                        property.recentAvgRating - property.avgRating,
                      ).toFixed(1)}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProperties.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-gray-500">
            No properties match the selected filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default PerPropertyPerformanceSection;
