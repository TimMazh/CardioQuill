
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ServerStatus } from "@/lib/types";
import { UploadPDFDialog } from "@/components/UploadPDFDialog";
import { FileUp } from "lucide-react";

interface ControlPanelProps {
  onGenerateReport: () => void;
  onUploadPDF: (file: File) => void;
  onClearFields: () => void;
  ragEnabled: boolean;
  onToggleRAG: () => void;
  appStatus: string;
  serverStatus: ServerStatus;
}

export function ControlPanel({
  onGenerateReport,
  onUploadPDF,
  onClearFields,
  ragEnabled,
  onToggleRAG,
  appStatus,
  serverStatus
}: ControlPanelProps) {
  return (
    <div className="border-t border-border mt-4 pt-4 mb-4">
      <div className="flex flex-wrap items-center gap-3 mb-4 justify-between w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onGenerateReport} variant="default">
            Bericht generieren
          </Button>
          <UploadPDFDialog 
            onUpload={onUploadPDF}
            trigger={
              <Button variant="secondary">
                <FileUp className="mr-2 h-4 w-4" />
                PDF hochladen
              </Button>
            }
          />
          <Button 
            onClick={onToggleRAG} 
            variant={ragEnabled ? "default" : "secondary"}
          >
            RAG {ragEnabled ? "aktiviert" : "deaktiviert"}
          </Button>
          <Button onClick={onClearFields} variant="outline">
            Alle Felder leeren
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-end md:items-center ml-auto">
          <StatusIndicator label="Anwendungsstatus" status={appStatus as "ready" | "processing" | "error"} />
          <StatusIndicator label="Serverstatus" status={serverStatus} />
        </div>
      </div>
    </div>
  );
}
