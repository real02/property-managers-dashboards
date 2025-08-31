import axios, { AxiosResponse } from "axios";
import {
  LoginCredentials,
  LoginResponse,
  ReviewsResponse,
  PublicReviewsResponse,
  UpdateReviewData,
  PaginationParams,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API endpoints
export const authAPI = {
  login: (
    credentials: LoginCredentials,
  ): Promise<AxiosResponse<LoginResponse>> =>
    api.post("/auth/login", credentials),
};

export const reviewsAPI = {
  getHostawayReviews: (): Promise<AxiosResponse<ReviewsResponse>> =>
    api.get("/reviews/hostaway"),

  getManagerReviews: (
    managerId: number,
  ): Promise<AxiosResponse<ReviewsResponse>> =>
    api.get(`/reviews/manager/${managerId}`),

  toggleApproval: (
    reviewId: number,
    data: UpdateReviewData,
  ): Promise<AxiosResponse<{ status: string; updated: boolean }>> =>
    api.put(`/reviews/${reviewId}/approval`, data),

  getPublicReviews: (
    propertyId: string,
    params: PaginationParams = {},
  ): Promise<AxiosResponse<PublicReviewsResponse>> =>
    api.get(`/reviews/public/${propertyId}`, { params }),
};

export default api;
