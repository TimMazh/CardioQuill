
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DoctorsLetter } from "@/lib/types";

interface TextSectionProps {
  title: string;
  field: keyof DoctorsLetter;
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
  placeholder?: string;
}

export function TextSection({ 
  title, 
  field, 
  doctorsLetter, 
  updateDoctorsLetter,
  placeholder = "Text eingeben..." 
}: TextSectionProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDoctorsLetter({ [field]: e.target.value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea 
          className="min-h-[200px]"
          placeholder={placeholder} 
          value={doctorsLetter[field] as string || ""}
          onChange={handleChange}
        />
      </CardContent>
    </Card>
  );
}
