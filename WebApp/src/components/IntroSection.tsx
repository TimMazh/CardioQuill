
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DoctorsLetter } from "@/lib/types";

interface IntroSectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export function IntroSection({ doctorsLetter, updateDoctorsLetter }: IntroSectionProps) {
  const [greeting, setGreeting] = useState(doctorsLetter.greeting || "Sehr geehrte");
  const [mode, setMode] = useState(doctorsLetter.mode || 'regulaer');

  // Update intro text when greeting or mode changes or relevant patient/doctor data changes
  useEffect(() => {
    updateIntroText();
  }, [
    greeting, 
    mode,
    doctorsLetter.patientLastName, 
    doctorsLetter.patientGender, 
    doctorsLetter.patientDateOfBirth,
    doctorsLetter.doctorTitle,
    doctorsLetter.doctorGender,
    doctorsLetter.doctorFirstName,
    doctorsLetter.doctorLastName,
    doctorsLetter.patientControlDate
  ]);

  const updateIntroText = () => {
    const {
      patientLastName = "Patientnachname",
      patientGender = "",
      patientDateOfBirth = "",
      doctorTitle = "",
      doctorGender = "",
      doctorLastName = "Arztnachname",
      doctorFirstName = "Arztvorname",
      patientControlDate = "dem heutigen Datum",
    } = doctorsLetter;

    // Gender-based text
    const patientPronoun = patientGender === "female" ? "Frau" : "Herr";
    const commonPatient = patientGender === "female" 
      ? "unserer gemeinsamen Patientin" 
      : "unseres gemeinsamen Patienten";
    const patientArticle = patientGender === "female" ? "die" : "der";

    const doctorPronoun = doctorGender === "female" ? "Frau" : "Herr";

    // Greeting format
    let formattedGreeting: string = greeting;
    if (greeting === "Sehr geehrte" && doctorGender !== "female") {
      formattedGreeting = "Sehr geehrter";
    } else if (greeting === "Liebe" && doctorGender !== "female") {
      formattedGreeting = "Lieber";
    }

    // Doctor form of address
    const doctorAddress = greeting === "Liebe" 
      ? doctorFirstName.split(' ')[0] // First name for informal
      : `${doctorPronoun}${doctorTitle ? ' ' + doctorTitle : ''} ${doctorLastName}`;

    // Generate the text
    let modeText = '';
    if (mode === 'regulaer') {
      modeText = `Gerne berichte ich über die reguläre kardiologische Verlaufskontrolle`;
    } else {
      modeText = `Gerne berichte ich über die notfallmässige Vorstellung`;
    }
    const introText = 
      `${formattedGreeting} ${doctorAddress},\n\n` +
      `${modeText} ${commonPatient} ` +
      `${patientPronoun} ${patientLastName}, ${patientArticle} sich am ${patientControlDate} in meiner Praxis vorgestellt hatte.\n`;

    updateDoctorsLetter({ introText, greeting, mode });
  };

  const handleGreetingChange = (value: "Liebe" | "Sehr geehrte") => {
    setGreeting(value);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDoctorsLetter({ introText: e.target.value });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Anrede</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={greeting}
            onValueChange={handleGreetingChange as (value: string) => void}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Liebe" id="greeting-liebe" />
              <Label htmlFor="greeting-liebe">Liebe</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sehr geehrte" id="greeting-sehr-geehrte" />
              <Label htmlFor="greeting-sehr-geehrte">Sehr geehrte</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vorstellungsart</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as 'regulaer' | 'notfall')}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regulaer" id="mode-regulaer" />
              <Label htmlFor="mode-regulaer">Regulär</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="notfall" id="mode-notfall" />
              <Label htmlFor="mode-notfall">Notfallmässig</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Einleitungstext</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            className="min-h-[200px]"
            placeholder="Hier erscheint der generierte Einleitungstext..."
            readOnly
            value={doctorsLetter.introText}
          />
        </CardContent>
      </Card>
    </div>
  );
}
