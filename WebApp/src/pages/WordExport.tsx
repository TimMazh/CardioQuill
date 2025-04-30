import React from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { generateWordDocument } from "@/lib/wordExportUtil";
import { DoctorsLetter } from "@/lib/types";

interface WordExportProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
  setAppStatus: (status: string) => void;
}

import { useState } from "react";

export default function WordExportPage({ doctorsLetter, updateDoctorsLetter, setAppStatus }: WordExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setAppStatus("processing");
    setIsExporting(true);
    try {
      const blob = await generateWordDocument(doctorsLetter);
      saveAs(blob, `Bericht_${doctorsLetter.patientLastName || "Patient"}.docx`);
    } finally {
      setAppStatus("ready");
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-">
      <h1 className="text-2xl font-bold mb-4">Word-Export</h1>
      <Button onClick={handleExport} disabled={isExporting}>
        {isExporting ? "Export läuft..." : "Word generieren"}
      </Button>
      {/* Vorschau oder weitere Infos könnten hier ergänzt werden */}
    </div>
  );
}
