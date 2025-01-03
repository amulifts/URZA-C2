// next-urza-frontend\frontend\src\context\AuthContext.tsx

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
      setUser({
        id: decoded.id,
        username: decoded.username,
        full_name: decoded.full_name,
        role: decoded.role,
      });
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Login failed.");
      setUser(null);
      throw err; // Ensure the error is propagated
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/logout`, {
          refresh_token: refreshToken
        }, {
          withCredentials: true,
        });
      } catch (err) {
        console.error(err);
        // Handle error if needed
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setUser(null);
    setError(null);
    router.push("/login");
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const access = localStorage.getItem('access_token');
      if (access) {
        try {
          const decoded: any = jwtDecode(access);
          setUser({
            id: decoded.id,
            username: decoded.username,
            full_name: decoded.full_name,
            role: decoded.role,
          });
        } catch (err) {
          console.error(err);
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
