
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorsLetter } from "@/lib/types";

interface MasterDataSectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export function MasterDataSection({ doctorsLetter, updateDoctorsLetter }: MasterDataSectionProps) {
  const handleChange = (field: keyof DoctorsLetter, value: string) => {
    
    updateDoctorsLetter({ [field]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stammdaten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Patienten Information</h3>
            <Label htmlFor="patientGender">Geschlecht</Label>
              <Select 
                value={doctorsLetter.patientGender || ""}
                onValueChange={(value) => handleChange("patientGender", value)}
              >
                <SelectTrigger id="patientGender">
                  <SelectValue placeholder="Geschlecht auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Männlich</SelectItem>
                  <SelectItem value="female">Weiblich</SelectItem>
                  <SelectItem value="diverse">Divers</SelectItem>
                </SelectContent>
              </Select>
            <div className="grid grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="patientFirstName">Vorname</Label>
                <Input 
                  id="patientFirstName"
                  value={doctorsLetter.patientFirstName || ""}
                  onChange={(e) => handleChange("patientFirstName", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patientLastName">Nachname</Label>
                <Input 
                  id="patientLastName"
                  value={doctorsLetter.patientLastName || ""}
                  onChange={(e) => handleChange("patientLastName", e.target.value)}
                />
              </div>
            </div>
                       
            <div className="space-y-2">
              <Label htmlFor="patientDateOfBirth">Geburtsdatum</Label>
              <Input 
                id="patientDateOfBirth"
                type="date"
                value={doctorsLetter.patientDateOfBirth || ""}
                onChange={(e) => handleChange("patientDateOfBirth", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientAddress">Adresse</Label>
              <Input 
                id="patientAddress"
                value={doctorsLetter.patientAddress || ""}
                onChange={(e) => handleChange("patientAddress", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="patientControlDate">Kontrolltermin</Label>
              <Input 
                id="patientControlDate"
                type="date"
                value={doctorsLetter.patientControlDate || ""}
                onChange={(e) => handleChange("patientControlDate", e.target.value)}
              />
            </div>
          </div>
          
          {/* Doctor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Arzt Information</h3>
            <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">

            <Label htmlFor="doctorGender">Geschlecht</Label>
                <Select 
                  value={doctorsLetter.doctorGender || ""}
                  onValueChange={(value) => handleChange("doctorGender", value)}
                >
                  <SelectTrigger id="doctorGender">
                    <SelectValue placeholder="Geschlecht auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Männlich</SelectItem>
                    <SelectItem value="female">Weiblich</SelectItem>
                    <SelectItem value="diverse">Divers</SelectItem>
                  </SelectContent>
                </Select>
                </div>
                <div className="space-y-2">

                <Label htmlFor="doctorTitle">Titel</Label>
                <Input 
                  id="doctorTitle"
                  value={doctorsLetter.doctorTitle || ""}
                  onChange={(e) => handleChange("doctorTitle", e.target.value)}
                />
              </div>
              
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorFirstName">Vorname</Label>
                <Input 
                  id="doctorFirstName"
                  value={doctorsLetter.doctorFirstName || ""}
                  onChange={(e) => handleChange("doctorFirstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctorLastName">Nachname</Label>
                <Input 
                  id="doctorLastName"
                  value={doctorsLetter.doctorLastName || ""}
                  onChange={(e) => handleChange("doctorLastName", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorClinic">Klinik</Label>
              <Input 
                id="doctorClinic"
                value={doctorsLetter.doctorClinic || ""}
                onChange={(e) => handleChange("doctorClinic", e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doctorAddress">Adresse</Label>
              <Input 
                id="doctorAddress"
                value={doctorsLetter.doctorAddress || ""}
                onChange={(e) => handleChange("doctorAddress", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
