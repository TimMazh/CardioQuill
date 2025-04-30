
import React from "react";
import { ServerStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface StatusIndicatorProps {
  label: string;
  status: ServerStatus | "ready" | "error" | "processing" | "not-ready" | "checking";
  message?: string;
}

export function StatusIndicator({ label, status, message }: StatusIndicatorProps) {
  // Determine color based on status
  let variant: "default" | "secondary" | "destructive" | "outline";
  let text: string;
  
  if (typeof status === 'string') {
    // Handle string status
    switch (status) {
      case "ready":
        variant = "default";
        text = "Bereit";
        break;
      case "processing":
        variant = "secondary";
        text = "Verarbeite...";
        break;
      case "error":
        variant = "destructive";
        text = "Fehler";
        break;
      case "not-ready":
        variant = "destructive";
        text = "Nicht bereit";
        break;  
      case "checking":
        variant = "outline";
        text = "Prüfe...";
        break;
      default:
        variant = "outline";
        text = status;
    }
  } else {
    // Handle ServerStatus object
    switch (status.status) {
      case "running":
        variant = "default";
        text = "Läuft";
        break;
      case "not-running":
        variant = "destructive";
        text = "Gestoppt";
        break;
      case "starting":
        variant = "secondary";
        text = "Startet...";
        break;
      case "checking":
        variant = "outline";
        text = "Prüfe...";
        break;
      case "error":
        variant = "destructive";
        text = "Fehler";
        break;
      default:
        variant = "outline";
        text = "Unbekannt";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">{label}:</span>
      <Badge variant={variant}>{text}</Badge>
      {message && <span className="text-sm text-muted-foreground">{message}</span>}
    </div>
  );
}
