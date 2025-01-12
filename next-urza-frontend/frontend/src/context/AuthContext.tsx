// next-urza-frontend/frontend/src/context/AuthContext.tsx

"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  username: string;
  full_name?: string;
  role: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Axios instance for API calls
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api",
    withCredentials: true,
  });

  // Request interceptor to attach access token
  apiClient.interceptors.request.use(
    async (config) => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refreshing
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/refresh/`, {
              refresh: refreshToken
            });
            const { access } = response.data;
            localStorage.setItem('access_token', access);
            originalRequest.headers['Authorization'] = `Bearer ${access}`;
            return apiClient(originalRequest);
          } catch (err) {
            logout();
            router.push("/login");
            return Promise.reject(err);
          }
        } else {
          logout();
          router.push("/login");
        }
      }
      return Promise.reject(error);
    }
  );

  const login = async (username: string, password: string) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token/`, {
        username,
        password
      }, {
        withCredentials: true,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      const decoded: any = jwtDecode(access);
      
      console.log("Decoded JWT:", decoded); // Debugging: Log decoded token
      
      setUser({
        id: decoded.id,
        username: decoded.username,
        full_name: decoded.full_name,
        role: decoded.role,
      });
      setError(null);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || "Login failed.");
      setUser(null);
      throw err; // Ensure the error is propagated
    }
  };

  // In AuthContext or wherever you handle logout:
const logout = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  const accessToken = localStorage.getItem("access_token");

  try {
    // 1) Send logout request with Authorization header
    // (Note: This only works if your endpoint is protected and
    //  your interceptors still attach the Bearer token automatically)
    await apiClient.post("/users/logout", {
      refresh_token: refreshToken
    });

    // 2) If success, remove tokens from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // 3) Do any other cleanup and redirect
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    // handle error
  }
};

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem('access_token');
      if (access) {
        try {
          const decoded: any = jwtDecode(access);
          console.log("Decoded JWT on init:", decoded); // Debugging: Log decoded token on initialization
          setUser({
            id: decoded.id,
            username: decoded.username,
            full_name: decoded.full_name,
            role: decoded.role,
          });
        } catch (err) {
          console.error("Error decoding token on init:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
