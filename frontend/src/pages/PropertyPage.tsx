import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { reviewsAPI } from "../services/api";
import { Review, PropertyData, AmenityItem } from "../types";
import {
  Star,
  Tv,
  Wifi,
  ChefHat,
  Building2,
  Wind,
  Thermometer,
  ShieldCheck,
  User,
  Calendar,
  LucideIcon,
} from "lucide-react";

const PropertyPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Mocked data (same as on backend, in real app, this would come from API)
  const propertyData: PropertyData = {
    id: propertyId || "",
    title:
      propertyId === "2B-N1-A-29-Shoreditch-Heights"
        ? "2B N1 A - 29 Shoreditch Heights"
        : "Studio 1A - Central London",
    description: `Cet appartement lumineux et spacieux d'une chambre se trouve rue Championnet à Paris. Il est parfait pour tous les profils – que vous soyez seul, en couple ou en télétravail.

L'appartement comprend un grand salon, une chambre confortable, une cuisine et une salle de bain. Il est situé dans un quart...`,
    amenities: [
      { icon: Tv, name: "Cable TV" },
      { icon: User, name: "Internet" },
      { icon: Wifi, name: "Wireless" },
      { icon: ChefHat, name: "Kitchen" },
      { icon: Building2, name: "Elevator" },
      { icon: Wind, name: "Hair Dryer" },
      { icon: Thermometer, name: "Heating" },
      { icon: ShieldCheck, name: "Smoke Detector" },
    ],
  };

  const fetchReviews = async (page: number = 1): Promise<void> => {
    if (!propertyId) return;

    try {
      setLoading(true);
      const response = await reviewsAPI.getPublicReviews(propertyId, {
        page,
        limit: 5,
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number | null): React.ReactElement[] => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating || 0)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  if (!propertyId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Property not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {propertyData.title}
          </h1>
        </div>

        {/* About this property section - matching their design */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About this property
          </h2>
          <div className="text-gray-600 leading-relaxed">
            <p>{propertyData.description}</p>
            <button className="text-blue-600 hover:text-blue-700 font-medium mt-2">
              Read more
            </button>
          </div>
        </div>

        {/* Amenities section - matching their grid design */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
            <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
              View all amenities
              <svg
                className="ml-1 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {propertyData.amenities.map(
              (amenity: AmenityItem, index: number) => {
                const IconComponent = amenity.icon as LucideIcon;
                return (
                  <div key={index} className="flex items-center">
                    <IconComponent className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-700">{amenity.name}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* Guest Reviews section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Guest Reviews
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No reviews available for this property yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: Review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            {review.guest_name}
                          </h4>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-2">
                              {renderStars(review.overall_rating)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.overall_rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(review.submitted_at)}
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.review_text}
                      </p>

                      {/* Category ratings */}
                      {(review.cleanliness_rating ||
                        review.communication_rating ||
                        review.house_rules_rating) && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          {review.cleanliness_rating && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cleanliness</span>
                              <div className="flex">
                                {renderStars(review.cleanliness_rating)}
                              </div>
                            </div>
                          )}
                          {review.communication_rating && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Communication
                              </span>
                              <div className="flex">
                                {renderStars(review.communication_rating)}
                              </div>
                            </div>
                          )}
                          {review.house_rules_rating && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">House Rules</span>
                              <div className="flex">
                                {renderStars(review.house_rules_rating)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Sentiment indicator */}
                      <div className="mt-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.sentiment === "positive"
                              ? "bg-green-100 text-green-800"
                              : review.sentiment === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {review.sentiment} feedback
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <button
                    onClick={() => fetchReviews(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => fetchReviews(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
