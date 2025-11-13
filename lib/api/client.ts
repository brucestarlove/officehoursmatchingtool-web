import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Create axios instance for Next.js API routes
// NextAuth handles authentication via cookies, so no need for manual token handling
const apiClient: AxiosInstance = axios.create({
  baseURL: "/api", // Use relative URLs for Next.js API routes
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for NextAuth session
  timeout: 30000, // 30 seconds timeout for all requests
});

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Handle timeout errors specifically
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      error.message = "Request timed out. Please check your connection and try again.";
    }

    // NextAuth handles session refresh automatically via cookies
    // Just propagate errors for the calling code to handle
    return Promise.reject(error);
  }
);

export default apiClient;

