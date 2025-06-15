
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/StatusIndicator";
import { ServerStatus } from "@/lib/types";
import { UploadPDFDialog } from "@/components/UploadPDFDialog";
import { FileUp } from "lucide-react";

interface ControlPanelProps {
  onUploadPDF: (files: File[]) => void;
  onClearFields: () => void;
  ragEnabled: boolean;
  onToggleRAG: () => void;
  appStatus: string;
  serverStatus: ServerStatus;
  onWordExport: () => void;
  isExporting: boolean;
}

export function ControlPanel({
  onUploadPDF,
  onClearFields,
  ragEnabled,
  onToggleRAG,
  appStatus,
  serverStatus,
  onWordExport,
  isExporting
}: ControlPanelProps) {
  return (
    <div className="border-t border-border mt-4 pt-4 mb-4">
      <div className="flex flex-wrap items-center gap-3 mb-4 justify-between w-full">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onWordExport} disabled={isExporting}>
            {isExporting ? "Export läuft..." : "Word generieren"}
          </Button>
          <Button onClick={onClearFields} variant="outline">
            Alle Felder leeren
          </Button>
          <UploadPDFDialog 
            onUpload={onUploadPDF}
            trigger={
              <Button variant="outline">
                <FileUp className="mr-2 h-4 w-4" />
                PDF hochladen
              </Button>
            }
          />
          <Button 
            onClick={onToggleRAG} 
            variant={ragEnabled ? "default" : "outline"}
            
          >
            Beispielverwendung {ragEnabled ? "aktiviert" : "deaktiviert"}
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
