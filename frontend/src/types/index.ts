export interface Review {
  id: number;
  hostaway_id: number;
  property_id: string;
  property_name: string;
  guest_name: string;
  review_text: string;
  overall_rating: number | null;
  cleanliness_rating: number | null;
  communication_rating: number | null;
  house_rules_rating: number | null;
  review_type: "guest-to-host" | "host-to-guest";
  channel: string;
  submitted_at: string;
  is_public: boolean;
  manager_approved: boolean;
  manager_notes?: string;
  sentiment: "positive" | "negative" | "neutral";
  created_at: string;
}

export interface Manager {
  id: number;
  email: string;
  name: string;
  properties: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  manager?: Manager;
  error?: string;
}

export interface ReviewsResponse {
  status: "success" | "error";
  reviews?: Review[];
  data?: Review[];
  total?: number;
  processed_at?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PublicReviewsResponse {
  status: "success" | "error";
  reviews: Review[];
  pagination: PaginationResponse;
}

export interface UpdateReviewData {
  is_public?: boolean;
  manager_approved?: boolean;
}

export interface PropertyData {
  id: string;
  title: string;
  description: string;
  amenities: AmenityItem[];
}

export interface AmenityItem {
  icon: any;
  name: string;
}

export interface Analytics {
  totalReviews: number;
  publicReviews: number;
  pendingReviews: number;
  avgRating: number;
  recentAvgRating: number;
  trend: "up" | "down";
  sentimentCounts: Record<string, number>;
  categoryAvgs: {
    cleanliness: number;
    communication: number;
    house_rules: number;
  };
  recentReviews: number;
}

export interface AuthContextType {
  user: Manager | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export interface UseReviewsResult {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleApproval: (
    reviewId: number,
    isPublic: boolean,
    managerApproved: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
}
