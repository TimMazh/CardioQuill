import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DoctorsLetter } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import TextField from "@mui/material/TextField";

interface IntroSectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export function IntroSection({ doctorsLetter, updateDoctorsLetter }: IntroSectionProps) {
  const [greeting, setGreeting] = useState(doctorsLetter.greeting || "Sehr geehrte");
  const [mode, setMode] = useState(doctorsLetter.mode || 'regulaer');
  const [introSectionAdditions, setIntroSectionAdditions] = useState(doctorsLetter.introSectionAdditions || "");

  // Hilfsfunktion: Baut den Einleitungstext aus Parametern
  function buildIntroText({
    greeting,
    mode,
    introSectionAdditions,
    patientLastName = "Patientnachname",
    patientGender = "",
    patientDateOfBirth = "",
    doctorTitle = "",
    doctorGender = "",
    doctorLastName = "Arztnachname",
    doctorFirstName = "Arztvorname",
    patientControlDate = ""
  }: {
    greeting: string;
    mode: string;
    introSectionAdditions: string;
    patientLastName?: string;
    patientGender?: string;
    patientDateOfBirth?: string;
    doctorTitle?: string;
    doctorGender?: string;
    doctorLastName?: string;
    doctorFirstName?: string;
    patientControlDate?: string;
  }): string {
    const patientPronoun = patientGender === "female" ? "Frau" : "Herrn";
    const commonPatient = patientGender === "female"
      ? "unserer gemeinsamen Patientin,"
      : "unseres gemeinsamen Patienten,";
    const patientArticle = patientGender === "female" ? "die" : "der";
    const doctorPronoun = doctorGender === "female" ? "Frau" : "Herr";
    let formattedGreeting: string = greeting;
    if (greeting === "Sehr geehrte" && doctorGender !== "female") {
      formattedGreeting = "Sehr geehrter";
    } else if (greeting === "Liebe" && doctorGender !== "female") {
      formattedGreeting = "Lieber";
    }
    const doctorAddress = greeting === "Liebe"
      ? doctorFirstName.split(' ')[0]
      : `${doctorPronoun}${doctorTitle ? ' ' + doctorTitle : ''} ${doctorLastName}`;
    let modeText = '';
    if (mode === 'regulaer') {
      modeText = `Gerne berichte ich über die reguläre kardiologische Verlaufskontrolle`;
    } else {
      modeText = `Gerne berichte ich über die notfallmässige Vorstellung`;
    }

    return `${formattedGreeting} ${doctorAddress}\n\n` +
      `${modeText} ${commonPatient} ` +
      `${patientPronoun} ${patientLastName}, ${patientArticle} sich am ${formatDate(patientControlDate)} in meiner Praxis vorgestellt hatte.\n` +
      (introSectionAdditions.trim() ? `\nErgänzungen: ${introSectionAdditions.trim()}` : "");
  }

  useEffect(() => {
    updateDoctorsLetter({
      ...doctorsLetter,
      introText: buildIntroText({
        greeting,
        mode,
        introSectionAdditions,
        patientLastName: doctorsLetter.patientLastName,
        patientGender: doctorsLetter.patientGender,
        patientDateOfBirth: doctorsLetter.patientDateOfBirth,
        doctorTitle: doctorsLetter.doctorTitle,
        doctorGender: doctorsLetter.doctorGender,
        doctorLastName: doctorsLetter.doctorLastName,
        doctorFirstName: doctorsLetter.doctorFirstName,
        patientControlDate: doctorsLetter.patientControlDate,
      })
    });
  }, [greeting, mode, introSectionAdditions]);

  const handleAdditionsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setIntroSectionAdditions(value);
    updateDoctorsLetter({
      ...doctorsLetter,
      introSectionAdditions: value,
      introText: buildIntroText({
        greeting,
        mode,
        introSectionAdditions: value,
        patientLastName: doctorsLetter.patientLastName,
        patientGender: doctorsLetter.patientGender,
        patientDateOfBirth: doctorsLetter.patientDateOfBirth,
        doctorTitle: doctorsLetter.doctorTitle,
        doctorGender: doctorsLetter.doctorGender,
        doctorLastName: doctorsLetter.doctorLastName,
        doctorFirstName: doctorsLetter.doctorFirstName,
        patientControlDate: doctorsLetter.patientControlDate,
      })
    });
  };

  const handleGreetingChange = (value: "Liebe" | "Sehr geehrte") => {
    setGreeting(value);
    updateDoctorsLetter({
      ...doctorsLetter,
      greeting: value,
      introText: buildIntroText({
        greeting: value,
        mode,
        introSectionAdditions,
        patientLastName: doctorsLetter.patientLastName,
        patientGender: doctorsLetter.patientGender,
        patientDateOfBirth: doctorsLetter.patientDateOfBirth,
        doctorTitle: doctorsLetter.doctorTitle,
        doctorGender: doctorsLetter.doctorGender,
        doctorLastName: doctorsLetter.doctorLastName,
        doctorFirstName: doctorsLetter.doctorFirstName,
        patientControlDate: doctorsLetter.patientControlDate,
      })
    });
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
            onValueChange={(value) => {
              setMode(value as 'regulaer' | 'notfall');
              updateDoctorsLetter({
                ...doctorsLetter,
                mode: value as 'regulaer' | 'notfall',
                introText: buildIntroText({
                  greeting,
                  mode: value,
                  introSectionAdditions,
                  patientLastName: doctorsLetter.patientLastName,
                  patientGender: doctorsLetter.patientGender,
                  patientDateOfBirth: doctorsLetter.patientDateOfBirth,
                  doctorTitle: doctorsLetter.doctorTitle,
                  doctorGender: doctorsLetter.doctorGender,
                  doctorLastName: doctorsLetter.doctorLastName,
                  doctorFirstName: doctorsLetter.doctorFirstName,
                  patientControlDate: doctorsLetter.patientControlDate,
                })
              });
            }}
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
          <TextField
            label="Ergänzungen"
            multiline
            minRows={2}
            fullWidth
            value={introSectionAdditions}
            onChange={handleAdditionsChange}
            margin="normal"
          />
        </CardContent>
      </Card>
    </div>
  );
}
