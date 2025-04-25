
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorsLetter } from "@/lib/types";

interface ECGAnalysisSectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export function ECGAnalysisSection({ doctorsLetter, updateDoctorsLetter }: ECGAnalysisSectionProps) {
  // ECG Analysis state
  const [sinusRate, setSinusRate] = useState(doctorsLetter.sinusRate || "");
  const [lagetyp, setLagetyp] = useState(doctorsLetter.lagetyp || "Indifferenztyp");
  const [pq, setPQ] = useState(doctorsLetter.pq || "");
  const [qrs, setQRS] = useState(doctorsLetter.qrs || "");
  const [qtc, setQTC] = useState(doctorsLetter.qtc || "");
  const [hasPathologicalQ, setHasPathologicalQ] = useState(doctorsLetter.hasPathologicalQ || false);
  const [qWaveLeads, setQWaveLeads] = useState<string[]>(doctorsLetter.qWaveLeads || []);
  const [hasSTChanges, setHasSTChanges] = useState(doctorsLetter.hasSTChanges || false);
  const [stChangesText, setSTChangesText] = useState(doctorsLetter.stChangesText || "");
  const [hasRegularRProgression, setHasRegularRProgression] = useState(
      typeof doctorsLetter.hasRegularRProgression === "boolean" ? doctorsLetter.hasRegularRProgression : true
    );
  const [rProgressionText, setRProgressionText] = useState(doctorsLetter.rProgressionText || "");
  const [rhythmContinuity, setRhythmContinuity] = useState(doctorsLetter.rhythmContinuity || "durchgehend");  
  const [rhythmContinuityText, setRhythmContinuityText] = useState(doctorsLetter.rhythmContinuityText || "");
  const [rhythmFrequency, setRhythmFrequency] = useState(doctorsLetter.rhythmFrequency || "normofrequent");  
  const [extrasystole, setExtrasystole] = useState(doctorsLetter.extrasystole || "no");
  const [extrasystoleFrequency, setExtrasystoleFrequency] = useState(doctorsLetter.extrasystoleFrequency || "vereinzelt");
  const [extrasystoleTypes, setExtrasystoleTypes] = useState<string[]>(doctorsLetter.extrasystoleTypes || []);
  
  // Output text
  const [outputText, setOutputText] = useState("");
  
  // Update output text on any change
  useEffect(() => {
    updateECGAnalysisText();
  }, [
    sinusRate, lagetyp, pq, qrs, qtc, hasPathologicalQ, qWaveLeads, 
    hasSTChanges, stChangesText, hasRegularRProgression, rProgressionText,
    rhythmContinuity, rhythmFrequency, extrasystole, 
    extrasystoleFrequency, extrasystoleTypes, rhythmContinuityText
  ]);
  
  // Toggle leads selection for pathological Q
  const toggleQWaveLead = (lead: string) => {
    setQWaveLeads(prev => 
      prev.includes(lead) 
        ? prev.filter(l => l !== lead)
        : [...prev, lead]
    );
  };
  
  // Toggle extrasystole types
  const toggleExtrasystoleType = (type: string) => {
    setExtrasystoleTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  // Generate ECG analysis text
  const updateECGAnalysisText = () => {
    // Sinusrhythmus und Lagetyp
    const sinus = sinusRate ? `Sinusrhythmus mit ${sinusRate}/Minute.` : "Sinusrhythmus.";
    let lage = `${lagetyp}.`;
    if (lagetyp == "Überdrehter Linkstyp") {
      lage = `Überdrehter Links Lagetyp.`;
    } else if(lagetyp == "Linkstyp") {
      lage = `Links Lagetyp.`;
    } else if(lagetyp == "Horizontaltyp") {
      lage = `Horizontal Lagetyp.`;
    } else if(lagetyp == "Indifferenztyp") {
      lage = `Indifferenz Lagetyp.`;
    } else if(lagetyp == "Steiltyp") {
      lage = `Steil Lagetyp.`;
    } else if(lagetyp == "Rechtstyp") {
      lage = `Rechts Lagetyp.`;
    } else if(lagetyp == "Überdrehter Rechtstyp") {
      lage = `Überdrehter Rechts Lagetyp.`;
    } else {
      lage = "Lagetyp nicht definiert.";
    }

    // Intervalle
    const intervals = `${pq ? `PQ ${pq}ms,` : ""} ${qrs ? `QRS ${qrs}ms,` : ""} ${qtc ? `QTc ${qtc}ms.` : ""}`;

    // Pathologisches Q
    let qWaveText = "";
    if (hasPathologicalQ && qWaveLeads.length > 0) {

      const sortedLeads = qWaveLeads.sort((a, b) => {
        const leadOrder = ["I", "II", "III", "aVF", "aVR", "aVL", "V1", "V2", "V3", "V4", "V5", "V6"];
        return leadOrder.indexOf(a) - leadOrder.indexOf(b);
      });

      qWaveText = `Pathologische Q-Welle in ${sortedLeads.join(", ")}.`;
    } else {
      qWaveText = "Kein pathologisches Q.";
    }

    // ST-Veränderungen
    let stText = "";
    if (hasSTChanges && stChangesText) {
      stText = `${stChangesText}.`;
    } else {
      stText = "Keine spezifischen ST-Veränderungen.";
    }

    // Regelrechte R-Progression
    let rProgressionText2 = "";
    if (!(hasRegularRProgression && rProgressionText)) {
      rProgressionText2 = `${rProgressionText}.`;
    } else {
      rProgressionText2 = "Regelrechte R-Progression.";
    }

    // Rhythmusstreifen
    let rhythmStripText = `Im Rhythmusstreifen ${rhythmContinuity} ${rhythmFrequency}er Sinusrhythmus.`;
    if (rhythmContinuity === "irregulär" && rhythmContinuityText) {
      rhythmStripText = rhythmStripText.replace(".", ":");
      rhythmStripText += ` ${rhythmContinuityText}.`;
    }

    // Extrasystolen
    let extrasystoleText = "";
    if (extrasystole === "yes") {
      const frequency = extrasystoleFrequency;
      const types = extrasystoleTypes.length > 0 
        ? extrasystoleTypes.join(" und ") 
        : "unbestimmter Typ";
      extrasystoleText = `${frequency === "vereinzelt" ? "Vereinzelt" : "Regelmässig"} ${types}e Extrasystolen.`;
    } else {
      extrasystoleText = "Keine Extrasystolen.";
    }

    // Combine all parts
    const ecgAnalysisText = [
      sinus, lage, intervals, qWaveText, stText, 
      rProgressionText2, rhythmStripText, extrasystoleText
    ].filter(Boolean).join(" ");
    
    setOutputText(ecgAnalysisText);
    updateDoctorsLetter({ 
      sinusRate,
      lagetyp,
      pq,
      qrs,
      qtc,
      hasPathologicalQ,
      qWaveLeads,
      hasSTChanges,
      stChangesText,
      hasRegularRProgression,
      rProgressionText,
      rhythmContinuity,
      rhythmContinuityText,
      rhythmFrequency,
      extrasystole,
      extrasystoleFrequency,
      extrasystoleTypes,
      ecgAnalysis: ecgAnalysisText
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>EKG-Analyse</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sinusrhythmus und Lagetyp */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Sinusrhythmus und Lagetyp</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sinusRate">Sinusrhythmus (Schläge/Minute):</Label>
              <Input 
                id="sinusRate" 
                value={sinusRate} 
                onChange={(e) => setSinusRate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lagetyp">Lagetyp:</Label>
              <Select value={lagetyp} onValueChange={setLagetyp}>
                <SelectTrigger id="lagetyp">
                  <SelectValue placeholder="Lagetyp auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Überdrehter Linkstyp">Überdrehter Linkstyp</SelectItem>
                  <SelectItem value="Linkstyp">Linkstyp</SelectItem>
                  <SelectItem value="Horizontaltyp">Horizontaltyp</SelectItem>
                  <SelectItem value="Indifferenztyp">Indifferenztyp</SelectItem>
                  <SelectItem value="Steiltyp">Steiltyp</SelectItem>
                  <SelectItem value="Rechtstyp">Rechtstyp</SelectItem>
                  <SelectItem value="Überdrehter Rechtstyp">Überdrehter Rechtstyp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        
      
      {/* Intervalle */}
      <div className="bg-background p-4 rounded-md border">
        <h3 className="text-lg font-medium mb-4">Intervalle</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pq">PQ (ms):</Label>
            <Input 
              id="pq" 
              value={pq} 
              onChange={(e) => setPQ(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="qrs">QRS (ms):</Label>
            <Input 
              id="qrs" 
              value={qrs} 
              onChange={(e) => setQRS(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="qtc">QTc (ms):</Label>
            <Input 
              id="qtc" 
              value={qtc} 
              onChange={(e) => setQTC(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Pathologisches Q */}
        <div className="bg-background p-4 rounded-md border flex-1 min-w-[270px]">
          <h3 className="text-lg font-medium mb-4">Pathologisches Q</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pathologisches Q?</Label>
              <RadioGroup 
                value={hasPathologicalQ ? "yes" : "no"} 
                onValueChange={(value) => setHasPathologicalQ(value === "yes")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="q-yes" />
                  <Label htmlFor="q-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="q-no" />
                  <Label htmlFor="q-no">Nein</Label>
                </div>
              </RadioGroup>
            </div>
            {hasPathologicalQ && (
              <div className="flex flex-row gap-4">
                {/* Gruppe 1: I, II, III */}
                <div className="flex flex-col space-y-2">
                  {["I", "II", "III"].map((lead) => (
                    <div key={lead} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lead-${lead}`} 
                        checked={qWaveLeads.includes(lead)}
                        onCheckedChange={() => toggleQWaveLead(lead)} 
                      />
                      <Label htmlFor={`lead-${lead}`}>{lead}</Label>
                    </div>
                  ))}
                </div>
                {/* Gruppe 2: aVF, aVR, aVL */}
                <div className="flex flex-col space-y-2">
                  {["aVF", "aVR", "aVL"].map((lead) => (
                    <div key={lead} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lead-${lead}`} 
                        checked={qWaveLeads.includes(lead)}
                        onCheckedChange={() => toggleQWaveLead(lead)} 
                      />
                      <Label htmlFor={`lead-${lead}`}>{lead}</Label>
                    </div>
                  ))}
                </div>
                {/* Gruppe 3: V1, V2, V3 */}
                <div className="flex flex-col space-y-2">
                  {["V1", "V2", "V3"].map((lead) => (
                    <div key={lead} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lead-${lead}`} 
                        checked={qWaveLeads.includes(lead)}
                        onCheckedChange={() => toggleQWaveLead(lead)} 
                      />
                      <Label htmlFor={`lead-${lead}`}>{lead}</Label>
                    </div>
                  ))}
                </div>
                {/* Gruppe 4: V4, V5, V6 */}
                <div className="flex flex-col space-y-2">
                  {["V4", "V5", "V6"].map((lead) => (
                    <div key={lead} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`lead-${lead}`} 
                        checked={qWaveLeads.includes(lead)}
                        onCheckedChange={() => toggleQWaveLead(lead)} 
                      />
                      <Label htmlFor={`lead-${lead}`}>{lead}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ST-Veränderungen */}
        <div className="bg-background p-4 rounded-md border flex-1 min-w-[270px]">
          <h3 className="text-lg font-medium mb-4">ST-Veränderungen</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ST-Veränderungen?</Label>
              <RadioGroup 
                value={hasSTChanges ? "yes" : "no"} 
                onValueChange={(value) => setHasSTChanges(value === "yes")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="st-yes" />
                  <Label htmlFor="st-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="st-no" />
                  <Label htmlFor="st-no">Nein</Label>
                </div>
              </RadioGroup>
            </div>
            {hasSTChanges && (
              <Textarea 
                className="min-h-[40px]"
                value={stChangesText}
                onChange={e => setSTChangesText(e.target.value)}
                placeholder="Beschreibung der ST-Veränderungen..."
              />
            )}
          </div>
        </div>
        {/* R-Progression */}
        <div className="bg-background p-4 rounded-md border flex-1 min-w-[270px]">
          <h3 className="text-lg font-medium mb-4">R-Progression</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Regelrechte R-Progression?</Label>
              <RadioGroup 
                value={hasRegularRProgression ? "yes" : "no"} 
                onValueChange={(value) => setHasRegularRProgression(value === "yes")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="rprog-yes" />
                  <Label htmlFor="rprog-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="rprog-no" />
                  <Label htmlFor="rprog-no">Nein</Label>
                </div>
              </RadioGroup>
            </div>
            {!hasRegularRProgression && (
              <Textarea 
                className="min-h-[40px]"
                value={rProgressionText}
                onChange={e => setRProgressionText(e.target.value)}
                placeholder="Beschreibung der R-Progression..."
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Rhythmusstreifen & Extrasystolen nebeneinander */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Rhythmusstreifen */}
        <div className="bg-background p-4 rounded-md border flex-1">
          <h3 className="text-lg font-medium mb-4">Rhythmusstreifen</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="rhythmContinuity">Kontinuität:</Label>
              <Select value={rhythmContinuity} onValueChange={setRhythmContinuity}>
                <SelectTrigger id="rhythmContinuity">
                  <SelectValue placeholder="Kontinuität auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="durchgehend">durchgehend</SelectItem>
                  <SelectItem value="irregulär">irregulär</SelectItem>
                </SelectContent>
              </Select>
              {rhythmContinuity === "irregulär" && (
                <Input
                  value={rhythmContinuityText}
                  onChange={e => setRhythmContinuityText(e.target.value)}
                  placeholder="Beschreibung der Irregulärität..."
                  className="mt-2"
                />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="rhythmFrequency">Frequenz:</Label>
              <Select value={rhythmFrequency} onValueChange={setRhythmFrequency}>
                <SelectTrigger id="rhythmFrequency">
                  <SelectValue placeholder="Frequenz auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normofrequent">normofrequent</SelectItem>
                  <SelectItem value="tachikard">tachikard</SelectItem>
                  <SelectItem value="bradikard">bradikard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* Extrasystolen */}
        <div className="bg-background p-4 rounded-md border flex-1">
          <h3 className="text-lg font-medium mb-4">Extrasystolen</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Extrasystolen?</Label>
              <RadioGroup 
                value={extrasystole} 
                onValueChange={setExtrasystole}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="extra-yes" />
                  <Label htmlFor="extra-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="extra-no" />
                  <Label htmlFor="extra-no">Nein</Label>
                </div>
              </RadioGroup>
            </div>
            
            {extrasystole === "yes" && (
              <>
                <div className="space-y-2">
                  <Label>Häufigkeit:</Label>
                  <RadioGroup 
                    value={extrasystoleFrequency} 
                    onValueChange={setExtrasystoleFrequency}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="vereinzelt" id="freq-vereinzelt" />
                      <Label htmlFor="freq-vereinzelt">Vereinzelt</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="regelmässig" id="freq-regelmässig" />
                      <Label htmlFor="freq-regelmässig">Regelmässig</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Typ:</Label>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-supra" 
                        checked={extrasystoleTypes.includes("supraventrikulär")}
                        onCheckedChange={() => toggleExtrasystoleType("supraventrikulär")} 
                      />
                      <Label htmlFor="type-supra">supraventrikulär</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="type-vent" 
                        checked={extrasystoleTypes.includes("ventrikulär")}
                        onCheckedChange={() => toggleExtrasystoleType("ventrikulär")} 
                      />
                      <Label htmlFor="type-vent">ventrikulär</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
        {/* Generierter Text */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">12-Kanal-Ruhe-EKG / Rhytmusstreifen Text</h3>
          <Textarea 
            className="min-h-[150px]" 
            value={doctorsLetter.ecgAnalysis || ""} 
            readOnly 
          />
        </div>
      </CardContent>
    </Card>
  );

}

