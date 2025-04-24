import React from "react";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import { generateWordDocument } from "@/lib/wordExportUtil";
import { DoctorsLetter } from "@/lib/types";

interface WordExportProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export default function WordExportPage({ doctorsLetter, updateDoctorsLetter }: WordExportProps) {
  const handleExport = async () => {
    const blob = await generateWordDocument(doctorsLetter);
    saveAs(blob, `Bericht_${doctorsLetter.patientLastName || "Patient"}.docx`);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Word-Export</h1>
      <Button onClick={handleExport}>Word generieren</Button>
      {/* Vorschau oder weitere Infos könnten hier ergänzt werden */}
    </div>
  );
}
