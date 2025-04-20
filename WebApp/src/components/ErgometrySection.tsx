import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorsLetter } from "@/lib/types";

interface ErgometrySectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

const stLeads = ["I", "II", "III", "aVF", "aVR", "aVL", "V1", "V2", "V3", "V4", "V5", "V6"];

export function ErgometrySection({ doctorsLetter, updateDoctorsLetter }: ErgometrySectionProps) {
  // States
  const [abbruchgrund, setAbbruchgrund] = useState("Erschöpfung");
  const [sollWatt, setSollWatt] = useState("");
  const [sollHF, setSollHF] = useState("");

  const [bdRegelrecht, setBdRegelrecht] = useState("yes");
  const [bdText, setBdText] = useState("");
  const [hfRegelrecht, setHfRegelrecht] = useState("yes");
  const [hfText, setHfText] = useState("");

  const [pektanginoes, setPektanginoes] = useState("no");
  const [pektanginoesWatt, setPektanginoesWatt] = useState("");
  
  const [desaturation, setDesaturation] = useState("no");
  const [desaturationText, setDesaturationText] = useState("");

  const [dyspnoe, setDyspnoe] = useState("no");
  const [dyspnoeWatt, setDyspnoeWatt] = useState("");

  const [rhythmusstoerungen, setRhythmusstoerungen] = useState("no");
  const [rhythmusText, setRhythmusText] = useState("");

  const [stVeraenderungen, setStVeraenderungen] = useState("no");
  const [stLeadsSelected, setStLeadsSelected] = useState<string[]>([]);

  const [outputText, setOutputText] = useState("");

  useEffect(() => {
    updateErgometryText();
    // eslint-disable-next-line
  }, [abbruchgrund, sollWatt, sollHF, bdRegelrecht, bdText, hfRegelrecht, hfText, pektanginoes, pektanginoesWatt, desaturation, desaturationText, dyspnoe, dyspnoeWatt, rhythmusstoerungen, rhythmusText, stVeraenderungen, stLeadsSelected]);

  const toggleStLead = (lead: string) => {
    setStLeadsSelected(prev => prev.includes(lead) ? prev.filter(l => l !== lead) : [...prev, lead]);
  };

  const updateErgometryText = () => {
    let text = "Belastung nach Stufenprotokoll beginnend mit 50 W dann inkrementell mit 25 W alle 2 Minuten. Abbruch der Untersuchung wegen peripherer muskulärer " + abbruchgrund + ". ";
    text += `Insgesamt wurden ${sollWatt ? sollWatt : ""}% der Soll-Wattzahl und ${sollHF ? sollHF : ""}% der Soll-Herzfrequenz erreicht. `;
    text += bdRegelrecht === "yes" ? "Regelrechte BD-Regulation. " : bdText ? bdText + ". " : "";
    text += hfRegelrecht === "yes" ? "Regelrechte HF-Regulation. " : hfText ? hfText + ". " : "";
    text += pektanginoes === "no" ? "Keine pektanginösen Beschwerden. " : pektanginoesWatt ? `Pektanginöse Beschwerden ab ${pektanginoesWatt} Watt. ` : "";
    text += desaturation === "no" ? "Keine relevante Desaturation. " : desaturationText ? desaturationText + ". " : "";
    text += dyspnoe === "no" ? "Keine inadäquate Dyspnoe. " : dyspnoeWatt ? `Inadäquate Dyspnoe ab ${dyspnoeWatt} Watt. ` : "";
    text += rhythmusstoerungen === "no" ? "Keine prognostisch relevanten Rhythmusstörungen. " : rhythmusText ? rhythmusText + ". " : "";
    text += stVeraenderungen === "no" ? "Keine ischämietypischen ST-Veränderungen." : stLeadsSelected.length > 0 ? `Ischämietypische ST-Veränderungen in ${stLeadsSelected.join(", ")}.` : "";
    setOutputText(text);
    updateDoctorsLetter({ ergometry: text });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ergometrie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Abbruchgrund */}
          <div className="space-y-2">
            <Label>Abbruchgrund</Label>
            <RadioGroup value={abbruchgrund} onValueChange={setAbbruchgrund} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Erschöpfung" id="erschöpfung" />
                <Label htmlFor="erschöpfung">Erschöpfung</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Ausbelastung" id="ausbelastung" />
                <Label htmlFor="ausbelastung">Ausbelastung</Label>
              </div>
            </RadioGroup>
          </div>
          {/* Sollwerte */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="sollWatt">Soll-Wattzahl (%)</Label>
            <Input id="sollWatt" type="number" min="0" max="200" value={sollWatt} onChange={e => setSollWatt(e.target.value)} placeholder="z.B. 95" />
            <Label htmlFor="sollHF">Soll-Herzfrequenz (%)</Label>
            <Input id="sollHF" type="number" min="0" max="200" value={sollHF} onChange={e => setSollHF(e.target.value)} placeholder="z.B. 98" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BD-Regulation */}
          <div className="space-y-2">
            <Label>Regelrechte BD-Regulation?</Label>
            <RadioGroup value={bdRegelrecht} onValueChange={setBdRegelrecht} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="bd-yes" />
                <Label htmlFor="bd-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bd-no" />
                <Label htmlFor="bd-no">Nein</Label>
              </div>
            </RadioGroup>
            {bdRegelrecht === "no" && (
              <Input value={bdText} onChange={e => setBdText(e.target.value)} placeholder="Freitext..." />
            )}
          </div>
          {/* HF-Regulation */}
          <div className="space-y-2">
            <Label>Regelrechte HF-Regulation?</Label>
            <RadioGroup value={hfRegelrecht} onValueChange={setHfRegelrecht} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hf-yes" />
                <Label htmlFor="hf-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hf-no" />
                <Label htmlFor="hf-no">Nein</Label>
              </div>
            </RadioGroup>
            {hfRegelrecht === "no" && (
              <Input value={hfText} onChange={e => setHfText(e.target.value)} placeholder="Freitext..." />
            )}
          </div>
        </div>

        {/* Pektanginöse Beschwerden, Desaturation, Dyspnoe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pektanginöse Beschwerden */}
          <div className="space-y-2">
            <Label>Pektanginöse Beschwerden?</Label>
            <RadioGroup value={pektanginoes} onValueChange={setPektanginoes} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pekt-no" />
                <Label htmlFor="pekt-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pekt-yes" />
                <Label htmlFor="pekt-yes">Ja</Label>
              </div>
            </RadioGroup>
            {pektanginoes === "yes" && (
              <Input value={pektanginoesWatt} onChange={e => setPektanginoesWatt(e.target.value)} placeholder="Wattzahl..." />
            )}
          </div>
          {/* Desaturation */}
          <div className="space-y-2">
            <Label>Desaturation?</Label>
            <RadioGroup value={desaturation} onValueChange={setDesaturation} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="desat-no" />
                <Label htmlFor="desat-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="desat-yes" />
                <Label htmlFor="desat-yes">Ja</Label>
              </div>
            </RadioGroup>
            {desaturation === "yes" && (
              <Input value={desaturationText} onChange={e => setDesaturationText(e.target.value)} placeholder="Freitext..." />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dyspnoe */}
          <div className="space-y-2">
            <Label>Dyspnoe?</Label>
            <RadioGroup value={dyspnoe} onValueChange={setDyspnoe} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="dyspnoe-no" />
                <Label htmlFor="dyspnoe-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="dyspnoe-yes" />
                <Label htmlFor="dyspnoe-yes">Ja</Label>
              </div>
            </RadioGroup>
            {dyspnoe === "yes" && (
              <Input value={dyspnoeWatt} onChange={e => setDyspnoeWatt(e.target.value)} placeholder="Wattzahl..." />
            )}
          </div>
          {/* Rhythmusstörungen */}
          <div className="space-y-2">
            <Label>Rhythmusstörungen?</Label>
            <RadioGroup value={rhythmusstoerungen} onValueChange={setRhythmusstoerungen} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="rhythmus-no" />
                <Label htmlFor="rhythmus-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="rhythmus-yes" />
                <Label htmlFor="rhythmus-yes">Ja</Label>
              </div>
            </RadioGroup>
            {rhythmusstoerungen === "yes" && (
              <Input value={rhythmusText} onChange={e => setRhythmusText(e.target.value)} placeholder="Freitext..." />
            )}
          </div>
        </div>

        {/* ST-Veränderungen */}
        <div className="space-y-2">
          <Label>ST-Veränderungen?</Label>
          <RadioGroup value={stVeraenderungen} onValueChange={setStVeraenderungen} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="st-no" />
              <Label htmlFor="st-no">Nein</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="st-yes" />
              <Label htmlFor="st-yes">Ja</Label>
            </div>
          </RadioGroup>
          {stVeraenderungen === "yes" && (
            <div className="flex flex-wrap gap-2 mt-2">
              {stLeads.map(lead => (
                <div key={lead} className="flex items-center space-x-1">
                  <Checkbox id={lead} checked={stLeadsSelected.includes(lead)} onCheckedChange={() => toggleStLead(lead)} />
                  <Label htmlFor={lead}>{lead}</Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generierter Text */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Generierter Text</h3>
          <Textarea className="min-h-[120px]" value={outputText} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
