
import { serverService } from "@/services/ServerService";
import { ServerStatus } from "@/lib/types";

// Check server status
export const checkServerStatus = async (): Promise<ServerStatus> => {
  return serverService.checkServerStatus();
};

// Start server
export const startServer = async (): Promise<ServerStatus> => {
  return serverService.startServer();
};

// Process query (with optional RAG support)
export const processQuery = async (query: string, useRag: boolean = false): Promise<string> => {
  return serverService.executePrompt(query, useRag);
};

// Upload and process PDF
export const uploadAndProcessPdf = async (file: File): Promise<boolean> => {
  return serverService.processPdf(file);
};
