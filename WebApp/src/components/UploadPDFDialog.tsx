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
  onUpload: (file: File) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UploadPDFDialog({ onUpload, trigger, open: openProp, onOpenChange }: UploadPDFDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dialogOpen = openProp !== undefined ? openProp : localOpen;
  const handleOpenChange = (next: boolean) => onOpenChange ? onOpenChange(next) : setLocalOpen(next);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;
    setUploading(true);
    const result = await serverService.processPdf(selectedFile);

    if (result) {
      toast({
        title: "PDF erfolgreich verarbeitet",
        description: "Der PDF-Upload wurde erfolgreich verarbeitet.",
      });
      onUpload(selectedFile);
      setSelectedFile(null);
      handleOpenChange(false);
    } else {
      toast({
        title: "Fehler beim Verarbeiten des PDF",
        description: result,
        variant: "destructive",
      });
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
              onChange={handleFileChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Lädt..." : "Hochladen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
