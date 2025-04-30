import { ServerStatus, SSHResponse } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import serverconfig from "@/services/serverconfig.json";

// Default configuration for the server
const defaultConfig = serverconfig;

// Cache for responses
const responseCache = new Map<string, string>();

export class ServerService {
  private config: typeof serverconfig;
  
  constructor(config: typeof serverconfig = defaultConfig) {
    this.config = config;
    console.log("ServerService initialized with local Python backend");
  }
  
  // Helper function to handle API requests
  private async apiRequest<T>(
    url: string, 
    options: RequestInit = {}, 
    errorMessage: string = "API request failed"
  ): Promise<T> {
    try {
      // Sicherstellen, dass API-Endpunkte korrekt angesprochen werden
      const apiUrl = url.startsWith('/') ? url : `/${url}`;
      
      // Add timeout to fetch requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000000); // 3000 second timeout
      
      const fullOptions: RequestInit = {
        ...options,
        signal: controller.signal,
      };
      
      console.log(`Sending request to: ${apiUrl}`);
      const response = await fetch(apiUrl, fullOptions);
      clearTimeout(timeoutId);
      
      // Check if the response is OK
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.warn("Response is not JSON:", text);
        throw new Error(`Expected JSON response but got: ${contentType || 'unknown content type'}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      console.error(`${errorMessage}:`, error);
      
      // Handle abort errors specifically
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Request timeout: Server took too long to respond');
      }
      
      throw error;
    }
  }
  
  // Check if the server is running
  async checkServerStatus(): Promise<ServerStatus> {
    console.log("Checking server status...");
    
    try {
      const data = await this.apiRequest<{running: boolean, message: string}>(
        '/status',
        {},
        "Error checking server status"
      );
      
      return {
        status: data.running ? 'running' : 'not-running',
        message: data.message || 'Server status checked'
      };
    } catch (error) {
      console.error("Error checking server status:", error);
      return {
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  // Start the server if it's not running
  async startServer(): Promise<ServerStatus> {
    console.log("Starting server...");
    
    toast({
      title: "Server Operation",
      description: "Starting server...",
    });
    
    try {
      const data = await this.apiRequest<{success: boolean, message: string}>(
        '/start',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.config),
        },
        "Error starting server"
      );
      const status = data.success ? 'running' : 'error';
      toast({
        title: data.success ? "Server gestartet" : "Serverfehler",
        description: data.message || 'Server operation completed',
        variant: data.success ? "default" : "destructive",
      });
      return {
        status,
        message: data.message || 'Server operation completed'
      };
    } catch (error) {
      console.error("Error starting server:", error);
      
      toast({
        title: "Serverfehler",
        description: `Fehler beim Starten des Servers: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      
      return {
        status: 'error',
        message: `Connection error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
  
  // Cache the latest response for each query
  private cacheResponse(query: string, response: string) {
    const cacheKey = this.getCacheKey(query);
    responseCache.set(cacheKey, response);
  }
  
  // Get cache key for a query
  private getCacheKey(query: string): string {
    // Simple hash function for queries
    return `${query}_${this.config.instanceName}_${this.config.gpus}`;
  }
  
  // Execute a prompt against the server
  async executePrompt(query: string, useRag: boolean = false): Promise<string> {
    console.log(`Executing prompt: ${query} (RAG: ${useRag})`);
    
    toast({
      title: "Executing Query",
      description: "Verarbeite Anfrage...",
    });
    
    try {
      const data = await this.apiRequest<{success: boolean, response?: string, message?: string}>(
        '/query',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            use_rag: useRag,
            config: this.config
          }),
        },
        "Error executing prompt"
      );
      console.log(data);
      console.log(data.response);
      console.log(data.message);
      console.log(data.success);
      if (!data.success) {
        throw new Error(data.message || 'Unknown error');
      }
      
      const responseText = data.response || "Keine Antwort erhalten";
      
      // Cache the response
      this.cacheResponse(query, responseText);
      
      // Ensure we have a valid response
      if (responseText && responseText.trim().length > 0) {
        toast({
          title: "Anfrage verarbeitet",
          description: "Die Anfrage wurde erfolgreich verarbeitet.",
        });
        
        return responseText;
      } else {
        toast({
          title: "Unvollständige Antwort",
          description: "Die Antwort vom Server enthielt keinen Text.",
          variant: "destructive",
        });
        
        return "Keine Antwort erhalten";
      }
    } catch (error) {
      console.error("Error executing prompt:", error);
      
      toast({
        title: "Fehler bei der Verarbeitung",
        description: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      
      return `Fehler: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  // Poll for delayed responses
  async pollForResponse(query: string): Promise<string | null> {
    // Check if there's a new response in the cache
    const cacheKey = this.getCacheKey(query);
    const cachedResponse = responseCache.get(cacheKey);
    
    // If there's a cached response, use it
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Otherwise, try to get a fresh response from the server
    try {
      const data = await this.apiRequest<{success: boolean, response?: string, message?: string}>(
        '/poll-response',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            config: this.config
          }),
        },
        "Error polling for response"
      );
      
      if (!data.success) {
        return null;
      }
      
      const responseText = data.response || null;
      
      // Cache the response if it's valid
      if (responseText) {
        this.cacheResponse(query, responseText);
      }
      
      return responseText;
    } catch (error) {
      console.error("Error polling for response:", error);
      return null;
    }
  }
  
  // Process a PDF for RAG capabilities
  async processPdf(file: File): Promise<boolean> {
    console.log(`Processing PDF: ${file.name}`);
    
    toast({
      title: "Verarbeite PDF",
      description: `Verarbeite ${file.name}...`,
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(this.config));
      
      const data = await this.apiRequest<{success: boolean, message: string}>(
        '/process-pdf',
        {
          method: 'POST',
          body: formData,
        },
        "Error processing PDF"
      );
      
      if (!data.success) {
        throw new Error(data.message || 'Unknown error');
      }
      
      toast({
        title: "PDF verarbeitet",
        description: `${file.name} wurde erfolgreich verarbeitet`,
      });
      
      return true;
    } catch (error) {
      console.error("Error processing PDF:", error);
      
      toast({
        title: "PDF-Verarbeitung fehlgeschlagen",
        description: `Fehler: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
      
      return false;
    }
  }
}

export const serverService = new ServerService();
