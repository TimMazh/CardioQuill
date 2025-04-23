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
  const [cancellingReason, setCancellingReason] = useState(doctorsLetter.cancellingReason || "Erschöpfung");
  const [shouldWatt, setShouldWatt] = useState(doctorsLetter.shouldWatt || "");
  const [shouldHF, setShouldHF] = useState(doctorsLetter.shouldHF || "");
  const [isBdRegular, setIsBdRegular] = useState(
    typeof doctorsLetter.isBdRegular === "boolean" ? doctorsLetter.isBdRegular : true
  );
  const [bdText, setBdText] = useState(doctorsLetter.bdText || "");
  const [isHfRegular, setIsHfRegular] = useState(
    typeof doctorsLetter.isHfRegular === "boolean" ? doctorsLetter.isHfRegular : true
  );
  const [hfText, setHfText] = useState(doctorsLetter.hfText || "");
  const [hasPektanginoesComplaints, setHasPektanginoesComplaints] = useState(doctorsLetter.hasPektanginoesComplaints || false);
  const [pektanginoesComplaintsWatt, setPektanginoesComplaintsWatt] = useState(doctorsLetter.pektanginoesComplaintsWatt || "");
  const [hasDesaturation, setHasDesaturation] = useState(doctorsLetter.hasDesaturation || false);
  const [desaturationText, setDesaturationText] = useState(doctorsLetter.desaturationText || "");
  const [hasDyspnoe, setHasDyspnoe] = useState(doctorsLetter.hasDyspnoe || false);
  const [dyspnoeWatt, setDyspnoeWatt] = useState(doctorsLetter.dyspnoeWatt || "");
  const [hasRhythmDisturbance, setHasRhythmDisturbance] = useState(doctorsLetter.hasRhythmDisturbance || false);
  const [rhythmDisturbanceText, setRhythmDisturbanceText] = useState(doctorsLetter.rhythmDisturbanceText || "");
  const [hasStChangesErgo, setHasStChangesErgo] = useState(doctorsLetter.hasStChangesErgo || false);
  const [stLeadsErgo, setStLeadsErgo] = useState<string[]>(doctorsLetter.stLeadsErgo || []);

  const [outputText, setOutputText] = useState("");

  useEffect(() => {
    updateErgometryText();
    // eslint-disable-next-line
  }, [
    cancellingReason,
    shouldWatt,
    shouldHF,
    isBdRegular,
    bdText,
    isHfRegular,
    hfText,
    hasPektanginoesComplaints,
    pektanginoesComplaintsWatt,
    hasDesaturation,
    desaturationText,
    hasDyspnoe,
    dyspnoeWatt,
    hasRhythmDisturbance,
    rhythmDisturbanceText,
    hasStChangesErgo,
    stLeadsErgo
  ]);

  const toggleStLead = (lead: string) => {
    setStLeadsErgo(prev => 
      prev.includes(lead) 
        ? prev.filter(l => l !== lead)
        : [...prev, lead]
    );
  };

  const updateErgometryText = () => {
    const sortedLeads = stLeadsErgo.sort((a, b) => {
      const leadOrder = ["I", "II", "III", "aVF", "aVR", "aVL", "V1", "V2", "V3", "V4", "V5", "V6"];
      return leadOrder.indexOf(a) - leadOrder.indexOf(b);
    });
    let text = "Belastung nach Stufenprotokoll beginnend mit 50 W dann inkrementell mit 25 W alle 2 Minuten. Abbruch der Untersuchung wegen peripherer muskulärer " + cancellingReason + ". ";
    text += `Insgesamt wurden ${shouldWatt ? shouldWatt : ""}% der Soll-Wattzahl und ${shouldHF ? shouldHF : ""}% der Soll-Herzfrequenz erreicht. `;
    text += isBdRegular ? "Regelrechte BD-Regulation. " : bdText ? bdText + ". " : "";
    text += isHfRegular ? "Regelrechte HF-Regulation. " : hfText ? hfText + ". " : "";
    text += hasPektanginoesComplaints ? `Pektanginöse Beschwerden ab ${pektanginoesComplaintsWatt} Watt. ` : "Keine pektanginösen Beschwerden. ";
    text += hasDesaturation ? desaturationText + ". " : "Keine relevante Desaturation. ";
    text += hasDyspnoe ? `Inadäquate Dyspnoe ab ${dyspnoeWatt} Watt. ` : "Keine inadäquate Dyspnoe. ";
    text += hasRhythmDisturbance ? rhythmDisturbanceText + ". " : "Keine prognostisch relevanten Rhythmstörungen. ";
   
    if (hasStChangesErgo && stLeadsErgo.length > 0) {

      const sortedLeads = stLeadsErgo.sort((a, b) => {
        const leadOrder = ["I", "II", "III", "aVF", "aVR", "aVL", "V1", "V2", "V3", "V4", "V5", "V6"];
        return leadOrder.indexOf(a) - leadOrder.indexOf(b);
      });

      text += `Ischämietypische ST-Veränderungen in ${sortedLeads.join(", ")}.`;
    } else {
      text += "Keine ischämietypischen ST-Veränderungen. ";
    }
    
    setOutputText(text);
    updateDoctorsLetter({ 
      cancellingReason,
      shouldWatt,
      shouldHF,
      isBdRegular,
      bdText,
      isHfRegular,
      hfText,
      hasPektanginoesComplaints,
      pektanginoesComplaintsWatt,
      hasDesaturation,
      desaturationText,
      hasDyspnoe,
      dyspnoeWatt,
      hasRhythmDisturbance,
      rhythmDisturbanceText,
      hasStChangesErgo,
      stLeadsErgo
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ergometrie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Linke Spalte */}
    <div className="space-y-6">
      {/* Abbruchgrund */}
      <div className="bg-background p-4 rounded-md border space-y-2">
        <h3 className="text-lg font-medium mb-2">Abbruchgrund</h3>
        <RadioGroup value={cancellingReason} onValueChange={setCancellingReason} className="flex flex-col space-y-2 w-full">
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
      <div className="bg-background p-4 rounded-md border space-y-2">
        <h3 className="text-lg font-medium mb-2">Sollwerte</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="sollWatt">Soll-Wattzahl</Label>
            <Input id="sollWatt" className="w-full" type="number" min="0" max="200" value={shouldWatt} onChange={e => setShouldWatt(e.target.value)} placeholder="%" />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="sollHF">Soll-Herzfrequenz</Label>
            <Input id="sollHF" className="w-full" type="number" min="0" max="200" value={shouldHF} onChange={e => setShouldHF(e.target.value)} placeholder="%" />
          </div>
        </div>
      </div>
      {/* BD/HF-Regulation */}
      <div className="bg-background p-4 rounded-md border space-y-4">
        <h3 className="text-lg font-medium mb-2">BD- und HF-Regulation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Regelrechte BD-Regulation?</Label>
            <RadioGroup value={isBdRegular ? "yes" : "no"} onValueChange={value => setIsBdRegular(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="bd-yes" />
                <Label htmlFor="bd-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="bd-no" />
                <Label htmlFor="bd-no">Nein</Label>
              </div>
            </RadioGroup>
            {isBdRegular === false && (
              <Textarea className="w-full" value={bdText} onChange={e => setBdText(e.target.value)} placeholder="Beschreibung der BD-Regulation..." />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Regelrechte HF-Regulation?</Label>
            <RadioGroup value={isHfRegular ? "yes" : "no"} onValueChange={value => setIsHfRegular(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="hf-yes" />
                <Label htmlFor="hf-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="hf-no" />
                <Label htmlFor="hf-no">Nein</Label>
              </div>
            </RadioGroup>
            {isHfRegular === false && (
              <Textarea className="w-full" value={hfText} onChange={e => setHfText(e.target.value)} placeholder="Beschreibung der HF-Regulation..." />
            )}
          </div>
        </div>
      </div>
    </div>
    {/* Rechte Spalte */}
    <div className="space-y-6">
      {/* Belastungssymptome */}
      <div className="bg-background p-4 rounded-md border space-y-4">
        <h3 className="text-lg font-medium mb-2">Belastungssymptome</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Pektanginöse Beschwerden?</Label>
            <RadioGroup value={hasPektanginoesComplaints ? "yes" : "no"} onValueChange={value => setHasPektanginoesComplaints(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="pekt-no" />
                <Label htmlFor="pekt-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="pekt-yes" />
                <Label htmlFor="pekt-yes">Ja</Label>
              </div>
            </RadioGroup>
            {hasPektanginoesComplaints && (
              <Input className="w-full" value={pektanginoesComplaintsWatt} onChange={e => setPektanginoesComplaintsWatt(e.target.value)} placeholder="ab Wattzahl" />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Desaturation?</Label>
            <RadioGroup value={hasDesaturation ? "yes" : "no"} onValueChange={value => setHasDesaturation(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="desat-no" />
                <Label htmlFor="desat-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="desat-yes" />
                <Label htmlFor="desat-yes">Ja</Label>
              </div>
            </RadioGroup>
            {hasDesaturation && (
              <Textarea className="w-full" value={desaturationText} onChange={e => setDesaturationText(e.target.value)} placeholder="Beschreibung der Desaturation..." />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Dyspnoe?</Label>
            <RadioGroup value={hasDyspnoe ? "yes" : "no"} onValueChange={value => setHasDyspnoe(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="dyspnoe-no" />
                <Label htmlFor="dyspnoe-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="dyspnoe-yes" />
                <Label htmlFor="dyspnoe-yes">Ja</Label>
              </div>
            </RadioGroup>
            {hasDyspnoe && (
              <Input className="w-full" value={dyspnoeWatt} onChange={e => setDyspnoeWatt(e.target.value)} placeholder="ab Wattzahl" />
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Rhythmusstörungen?</Label>
            <RadioGroup value={hasRhythmDisturbance ? "yes" : "no"} onValueChange={value => setHasRhythmDisturbance(value === "yes")} className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="rhythmDisturbance-no" />
                <Label htmlFor="rhythmDisturbance-no">Nein</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="rhythmDisturbance-yes" />
                <Label htmlFor="rhythmDisturbance-yes">Ja</Label>
              </div>
            </RadioGroup>
            {hasRhythmDisturbance && (
              <Textarea className="w-full" value={rhythmDisturbanceText} onChange={e => setRhythmDisturbanceText(e.target.value)} placeholder="Beschreibung der Rhythmusstörungen..." />
            )}
          </div>
        </div>
      </div>
      {/* ST-Veränderungen */}
      <div className="bg-background p-4 rounded-md border space-y-2">
        <h3 className="text-lg font-medium mb-2">ST-Veränderungen</h3>
        <Label>ST-Veränderungen?</Label>
        <RadioGroup value={hasStChangesErgo ? "yes" : "no"} onValueChange={value => setHasStChangesErgo(value === "yes")} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="st-no" />
            <Label htmlFor="st-no">Nein</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="st-yes" />
            <Label htmlFor="st-yes">Ja</Label>
          </div>
        </RadioGroup>
        {hasStChangesErgo && (
          <div className="flex flex-row gap-4 mt-2">
            {/* Gruppe 1: I, II, III */}
            <div className="flex flex-col space-y-2">
              {["I", "II", "III"].map((lead) => (
                <div key={lead} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`lead-${lead}`} 
                    checked={stLeadsErgo.includes(lead)}
                    onCheckedChange={() => toggleStLead(lead)} 
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
                    checked={stLeadsErgo.includes(lead)}
                    onCheckedChange={() => toggleStLead(lead)} 
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
                    checked={stLeadsErgo.includes(lead)}
                    onCheckedChange={() => toggleStLead(lead)} 
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
                    checked={stLeadsErgo.includes(lead)}
                    onCheckedChange={() => toggleStLead(lead)} 
                  />
                  <Label htmlFor={`lead-${lead}`}>{lead}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  {/* Generierter Text */}
  <div className="bg-background p-4 rounded-md border">
    <h3 className="text-lg font-medium mb-4">Ergometrie Text</h3>
    <Textarea className="min-h-[120px]" value={outputText} readOnly />
  </div>
</CardContent>
</Card>);
}
