import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { serverService } from "@/services/ServerService";
import { toast } from "@/components/ui/use-toast";

interface QueryPanelProps {
  ragEnabled: boolean;
  onProcessingChange: (isProcessing: boolean) => void;
}

export function QueryPanel({ ragEnabled, onProcessingChange }: QueryPanelProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  const startPolling = (currentQueryId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    const pollInterval = 1000; // Poll every second
    let attempts = 0;
    const maxAttempts = 60; // Maximum 60 seconds of polling

    pollingIntervalRef.current = setInterval(async () => {
      if (queryIdRef.current !== currentQueryId || attempts >= maxAttempts) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        if (attempts >= maxAttempts) {
          setIsProcessing(false);
          onProcessingChange(false);
          toast({
            title: "Zeitüberschreitung",
            description: "Die Anfrage hat zu lange gedauert.",
            variant: "destructive",
          });
        }
        return;
      }

      try {
        const polledResult = await serverService.pollForResponse(query);
        
        if (polledResult && 
            typeof polledResult === 'string' && 
            polledResult.trim().length > 0 &&
            !polledResult.startsWith("Fehler:") &&
            polledResult !== response) {
          
          setResponse(polledResult);
          
          // If we get a valid response, we can stop polling
          if (!polledResult.includes("Verarbeitung läuft") && 
              !polledResult.includes("wird bearbeitet")) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            setIsProcessing(false);
            onProcessingChange(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }

      attempts++;
    }, pollInterval);
  };

  const handleSubmitQuery = async () => {
    if (!query.trim() || isProcessing) return;
    
    setIsProcessing(true);
    onProcessingChange(true);
    setResponse("Verarbeite Anfrage...");
    
    queryIdRef.current = Date.now().toString();
    const currentQueryId = queryIdRef.current;
    
    try {
      const serverStatus = await serverService.checkServerStatus();
      
      if (serverStatus.status !== 'running') {
        toast({
          title: "Server nicht bereit",
          description: "Der LLM-Server wird gestartet. Bitte warten Sie einen Moment und versuchen Sie es erneut.",
        });
        
        const startResult = await serverService.startServer();
        if (startResult.status !== 'running') {
          setResponse(`Server konnte nicht gestartet werden: ${startResult.message}`);
          return;
        }
      }
      
      const result = await serverService.executePrompt(query, ragEnabled);
      
      if (typeof result === 'string') {
        setResponse(result.startsWith("Fehler:") ? result : "Anfrage wird vom Modell verarbeitet, bitte warten...");
        startPolling(currentQueryId);
      }
    } catch (error) {
      console.error("Failed to execute query:", error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      setResponse(`Verbindungsfehler: ${errorMessage}`);
      
      toast({
        title: "Verbindungsfehler",
        description: "Der Server konnte nicht erreicht werden.",
        variant: "destructive",
      });
      
      setIsProcessing(false);
      onProcessingChange(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>LLM Abfrage {ragEnabled ? "(RAG aktiviert)" : ""}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Textarea
              placeholder="Stellen Sie eine Frage an das Sprachmodell..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[100px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmitQuery();
                }
              }}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitQuery}
                disabled={!query.trim() || isProcessing}
              >
                <Send className="mr-2 h-4 w-4" />
                Senden
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <h3 className="text-sm font-medium">Antwort:</h3>
            <div className="rounded-md border bg-muted p-4 text-sm">
              {response ? (
                <div className="whitespace-pre-wrap">{response}</div>
              ) : (
                <div className="text-muted-foreground">
                  LLM-Antworten werden hier angezeigt.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
