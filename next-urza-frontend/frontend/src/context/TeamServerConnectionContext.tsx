// frontend/src/context/TeamServerConnectionContext.tsx

"use client"

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { apiClient } from "@/lib/api";
import { toast } from "react-toastify";

// Define the shape of the connection configuration
interface ConnectionConfig {
  protocol: string;
  host: string;
  port: string;
  username: string;
  password: string;
}

// Define the context type
interface TeamServerConnectionContextType {
  isConnected: boolean;
  connectedConfig: ConnectionConfig | null;
  connect: (config: ConnectionConfig) => Promise<void>;
  disconnect: () => Promise<void>;
}

// Create the context
const TeamServerConnectionContext = createContext<TeamServerConnectionContextType | undefined>(undefined);

// Custom hook for easy consumption
export const useTeamServerConnection = () => {
  const context = useContext(TeamServerConnectionContext);
  if (!context) {
    throw new Error("useTeamServerConnection must be used within a TeamServerConnectionProvider");
  }
  return context;
};

// Provider component
export const TeamServerConnectionProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedConfig, setConnectedConfig] = useState<ConnectionConfig | null>(null);

  // Connect to TeamServer
  const connect = async (config: ConnectionConfig) => {
    const { protocol, host, port, username, password } = config;
    const connectionURL = `${protocol}://${username}:${password}@${host}:${port}`;
    try {
      toast.info("Connecting to TeamServer: Attempting to establish connection...");
      const response = await apiClient.post("/st_client/connect/", {
        connection_url: connectionURL
      });
      if (response.status === 200) {
        setIsConnected(true);
        setConnectedConfig(config);
        toast.success("Connection Established: Successfully connected to TeamServer");
      } else {
        toast.error("Failed to connect to TeamServer");
      }
    } catch (error: any) {
      console.error("Connection Error:", error);
      toast.error(error.response?.data?.detail || "Failed to connect to TeamServer.");
    }
  };

  // Disconnect from TeamServer
  const disconnect = async () => {
    try {
      toast.info("Disconnecting from TeamServer...");
      const response = await apiClient.post("/st_client/disconnect/");
      if (response.status === 200) {
        setIsConnected(false);
        setConnectedConfig(null);
        toast.success("Disconnected: Successfully disconnected from TeamServer");
      } else {
        toast.error("Failed to disconnect from TeamServer.");
      }
    } catch (error: any) {
      console.error("Disconnect Error:", error);
      toast.error(error.response?.data?.detail || "Failed to disconnect from TeamServer.");
    }
  };

  return (
    <TeamServerConnectionContext.Provider value={{
      isConnected,
      connectedConfig,
      connect,
      disconnect
    }}>
      {children}
    </TeamServerConnectionContext.Provider>
  );
};
