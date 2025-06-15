import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { serverService } from "@/services/ServerService";
import { toast } from "@/components/ui/use-toast";  

interface UploadPDFDialogProps {
  onUpload: (files: File[]) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UploadPDFDialog({ onUpload, trigger, open: openProp, onOpenChange }: UploadPDFDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localOpen, setLocalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dialogOpen = openProp !== undefined ? openProp : localOpen;
  const handleOpenChange = (next: boolean) => onOpenChange ? onOpenChange(next) : setLocalOpen(next);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || uploading) return;
    setUploading(true);
    let allSuccess = true;
    for (const file of selectedFiles) {
      const result = await serverService.processPdf(file);
      if (!result) {
        allSuccess = false;
        toast({
          title: `Fehler beim Verarbeiten von ${file.name}`,
          description: typeof result === 'string' ? result : undefined,
          variant: "destructive",
        });
      }
    }
    if (allSuccess) {
      toast({
        title: "Alle PDFs erfolgreich verarbeitet",
        description: "Alle PDF-Uploads wurden erfolgreich verarbeitet.",
      });
      onUpload(selectedFiles);
      setSelectedFiles([]);
      handleOpenChange(false);
    }
    setUploading(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>PDF hochladen</DialogTitle>
          <DialogDescription>
            Wählen Sie eine PDF-Datei aus, um sie für die RAG-Verarbeitung hochzuladen. Die Texte werden als Hilfsmittel zur Zusammenfassungsgenerierung verwendet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="pdf-file">PDF-Datei</Label>
            <Input
              id="pdf-file"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!selectedFiles.length || uploading}
          >
            {uploading ? "Lädt..." : `Hochladen (${selectedFiles.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
