
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DoctorsLetter } from "@/lib/types";

interface PhysicalExaminationSectionProps {
  doctorsLetter: DoctorsLetter;
  updateDoctorsLetter: (data: Partial<DoctorsLetter>) => void;
}

export function PhysicalExaminationSection({ 
  doctorsLetter, 
  updateDoctorsLetter 
}: PhysicalExaminationSectionProps) {
  // States for different parts of the examination
  const [az, setAZ] = useState(doctorsLetter.az || "Guter");
  const [ez, setEZ] = useState(doctorsLetter.ez || "normaler");
  const [height, setHeight] = useState(doctorsLetter.height || "");
  const [weight, setWeight] = useState(doctorsLetter.weight || "");
  const [bmi, setBMI] = useState(doctorsLetter.bmi || "");
  const [bpLeftSys, setBPLeftSys] = useState(doctorsLetter.bpLeftSys || "");
  const [bpLeftDia, setBPLeftDia] = useState(doctorsLetter.bpLeftDia || "");
  const [bpRightSys, setBPRightSys] = useState(doctorsLetter.bpRightSys || "");
  const [bpRightDia, setBPRightDia] = useState(doctorsLetter.bpRightDia || "");
  const [hasBPSideDifference, setHasBPSideDifference] = useState(doctorsLetter.hasBPSideDifference || false);
  const [pulse, setPulse] = useState(doctorsLetter.pulse || "");
  const [heartRhythm, setHeartRhythm] = useState(doctorsLetter.heartRhythm || "Cor rhythmisch");
  const [heartRhythmDetails, setHeartRhythmDetails] = useState(doctorsLetter.heartRhythmDetails || "" );
  const [heartPathology, setHeartPathology] = useState(doctorsLetter.heartPathology || "");
  const [hasHeartPathology, setHasHeartPathology] = useState(doctorsLetter.hasHeartPathology || false);
  const [hasLungAbnormality, setHasLungAbnormality] = useState(doctorsLetter.hasLungAbnormality || false);
  const [lungDetails, setLungDetails] = useState(doctorsLetter.lungDetails || "");
  const [pulseStatus, setPulseStatus] = useState(doctorsLetter.pulseStatus || "");
  const [hasGoodPulse, setHasGoodPulse] = useState(
  typeof doctorsLetter.hasGoodPulse === "boolean" ? doctorsLetter.hasGoodPulse : true
);
  const [flowNoiseDetails, setFlowNoiseDetails] = useState(doctorsLetter.flowNoiseDetails || "");
  const [hasFlowNoise, setHasFlowNoise] = useState(doctorsLetter.hasFlowNoise || false);
  const [edemaDetails, setEdemaDetails] = useState(doctorsLetter.edemaDetails || "");
  const [hasEdema, setHasEdema] = useState(doctorsLetter.hasEdema || false);

  // Update examination text when any input changes
  useEffect(() => {
    updateExaminationText();
  }, [
    az, ez, height, weight, bmi, bpLeftSys, bpLeftDia, bpRightSys, bpRightDia,
    hasBPSideDifference, pulse, heartRhythm, heartRhythmDetails, hasHeartPathology, heartPathology,
    hasLungAbnormality, lungDetails, pulseStatus, flowNoiseDetails,
    hasEdema, edemaDetails, hasGoodPulse, hasFlowNoise
  ]);

  // Generate the examination text
  const updateExaminationText = () => {
    // Basic measurements
    let examinationText = `${az} AZ und ${ez} EZ. `;
    
    if (height && weight) {
      let bmi = (parseFloat(weight) / (parseFloat(height) ** 2)*10000).toFixed(1).toString();
      setBMI(bmi);
      examinationText += `Körpergrösse ${height} cm, Körpergewicht ${weight} kg, BMI ${bmi} kg/m². `;
    }
    
    // Blood pressure
    if (bpLeftSys && bpLeftDia && bpRightSys && bpRightDia) {
      examinationText += `Blutdruck in Ruhe links ${bpLeftSys}/${bpLeftDia} mmHg, rechts ${bpRightSys}/${bpRightDia} mmHg. `;
      
      // Side difference
      if (hasBPSideDifference) {
        const sysDiff = Math.abs(parseInt(bpLeftSys) - parseInt(bpRightSys));
        const diaDiff = Math.abs(parseInt(bpLeftDia) - parseInt(bpRightDia));
        const sysHigherSide = parseInt(bpLeftSys) > parseInt(bpRightSys) ? "links höher" : "rechts höher";
        const diaHigherSide = parseInt(bpLeftDia) > parseInt(bpRightDia) ? "links höher" : "rechts höher";
        
        examinationText += `Seitendifferenz. Unterschied beträgt systolisch ${sysDiff} mmHg und diastolisch ${diaDiff} mmHg, systolisch ${sysHigherSide}, diastolisch ${diaHigherSide}. `;
      } else {
        examinationText += `Keine Seitendifferenz. `;
      }
    }
    
    // Pulse
    if (pulse) {
      examinationText += `Ruhepuls ${pulse}/min. `;
    }
    
    // Lung
    if (hasLungAbnormality) {
      examinationText += `${lungDetails}. `;
    } else {
      examinationText += `Pulmo mit VAG beidseits, keine Rasselgeräusche. `;
    }
    
    if (heartRhythm === "Arrhythmisch") {
      examinationText += `${heartRhythm}: ${heartRhythmDetails}. `;
    } else {
      examinationText += `${heartRhythm}. `;
    }
    
    if (hasHeartPathology) {
      examinationText += `${heartPathology}. `;
    } else {
      examinationText += `Keine pathologischen Nebentöne. `;
    }
    
    // Pulses
    if (hasGoodPulse) {
      examinationText += `Pulse allseits gut tastbar. `;
    } else {
      examinationText += `${pulseStatus}. `;
    }
    
    // Flow noises
    if (hasFlowNoise) {
      examinationText += `${flowNoiseDetails}. `;
    } else {
      examinationText += `Keine Strömungsgeräusche. `;
    }
    
    // Edema
    if (hasEdema) {
      examinationText += `${edemaDetails}. `;
    } else {
      examinationText += `Keine peripheren Ödeme. Kardinal kompensiert.`;
    }
    
    // Update the doctors letter
    updateDoctorsLetter({
      physicalExamination: examinationText,
      az,
      ez,
      height,
      weight,
      bmi,
      bpLeftSys,
      bpLeftDia,
      bpRightSys,
      bpRightDia,
      hasBPSideDifference,
      pulse,
      heartRhythm,
      heartRhythmDetails,
      hasLungAbnormality,
      lungDetails,
      hasHeartPathology,
      heartPathology,
      hasGoodPulse,
      pulseStatus,
      hasEdema,
      edemaDetails,
      hasFlowNoise,
      flowNoiseDetails,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Linke Spalte: Körpermasse und Blutdruck */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Körpermasse und Blutdruck</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label htmlFor="height">Körpergrösse (cm):</Label>
            <Input 
              id="height" 
              value={height} 
              onChange={(e) => setHeight(e.target.value)} 
            />
            <div className="space-y-4">
              <Label htmlFor="weight">Körpergewicht (kg):</Label>
              <Input 
                id="weight" 
                value={weight} 
                onChange={(e) => setWeight(e.target.value)} 
              />
            </div>
            <div className="space-y-4">
              <Label>Blutdruck links:</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Systolisch" 
                  value={bpLeftSys} 
                  onChange={(e) => setBPLeftSys(e.target.value)} 
                />
                <Input 
                  placeholder="Diastolisch" 
                  value={bpLeftDia} 
                  onChange={(e) => setBPLeftDia(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Blutdruck rechts:</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Systolisch" 
                  value={bpRightSys} 
                  onChange={(e) => setBPRightSys(e.target.value)} 
                />
                <Input 
                  placeholder="Diastolisch" 
                  value={bpRightDia} 
                  onChange={(e) => setBPRightDia(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Seitendifferenz:</Label>
              <RadioGroup 
                value={hasBPSideDifference ? "yes" : "no"}
                onValueChange={(v) => setHasBPSideDifference(v === "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="bp-diff-yes" />
                  <Label htmlFor="bp-diff-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="bp-diff-no" />
                  <Label htmlFor="bp-diff-no">Nein</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-4">
              <Label htmlFor="pulse">Ruhepuls (min):</Label>
              <Input 
                id="pulse" 
                value={pulse} 
                onChange={(e) => setPulse(e.target.value)} 
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Rechte Spalte: 2x2 Grid */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Obere Reihe */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Allgemein- und Ernährungszustand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="az">Allgemeinzustand:</Label>
              <Select value={az} onValueChange={setAZ}>
                <SelectTrigger>
                  <SelectValue placeholder="Allgemeinzustand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Guter">Guter</SelectItem>
                  <SelectItem value="Normaler">Normaler</SelectItem>
                  <SelectItem value="Schlechter">Schlechter</SelectItem>
                </SelectContent>
              </Select>
              <div className="space-y-4">
                <Label htmlFor="ez">Ernährungszustand:</Label>
                <Select value={ez} onValueChange={setEZ}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ernährungszustand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normaler">Normaler</SelectItem>
                    <SelectItem value="übergewichtiger">Übergewichtiger</SelectItem>
                    <SelectItem value="adipöser">Adipöser</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
          <CardHeader>
              <CardTitle>Auskultation Lunge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Auskultation Lunge abnormal?</Label>
              <RadioGroup 
                value={hasLungAbnormality ? "yes" : "no"}
                onValueChange={(v) => setHasLungAbnormality(v === "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="lung-abnormal-yes" />
                  <Label htmlFor="lung-abnormal-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="lung-abnormal-no" />
                  <Label htmlFor="lung-abnormal-no">Nein</Label>
                </div>
              </RadioGroup>
              {hasLungAbnormality && (
                <Textarea 
                  className="min-h-[40px] mt-2"
                  placeholder="Beschreibung der Auffälligkeiten" 
                  value={lungDetails} 
                  onChange={(e) => setLungDetails(e.target.value)} 
                />
              )}
            </CardContent>
          </Card>
          {/* Untere Reihe */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Auskultation Herz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Herzrhythmus:</Label>
              <RadioGroup 
                value={heartRhythm === "Cor rhythmisch" ? "Cor rhythmisch" : "Arrhythmisch"}
                onValueChange={setHeartRhythm}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cor rhythmisch" id="heart-rhythm-normal" />
                  <Label htmlFor="heart-rhythm-normal">Cor rhythmisch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Arrhythmisch" id="heart-rhythm-arrythmic" />
                  <Label htmlFor="heart-rhythm-arrythmic">Arrhythmisch</Label>
                </div>
              </RadioGroup>
              {heartRhythm === "Arrhythmisch" && (
                <Textarea 
                  className="min-h-[40px] mt-2"
                  placeholder="Beschreibung des Rhytmus" 
                  value={heartRhythmDetails} 
                  onChange={(e) => setHeartRhythmDetails(e.target.value)} 
                />
              )}
              <div className="space-y-4">
                <Label>Pathologische Nebentöne:</Label>
                <RadioGroup 
                  value={hasHeartPathology ? "yes" : "no"}
                  onValueChange={(v) => setHasHeartPathology(v === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="heart-pathology-yes" />
                    <Label htmlFor="heart-pathology-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="heart-pathology-no" />
                    <Label htmlFor="heart-pathology-no">Nein</Label>
                  </div>
                </RadioGroup>
                {hasHeartPathology && (
                  <Textarea 
                    className="min-h-[40px] mt-2"
                    placeholder="Beschreibung der Nebentöne" 
                    value={heartPathology} 
                    onChange={(e) => setHeartPathology(e.target.value)} 
                  />
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-1">
          <CardHeader>
              <CardTitle>Pulse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Pulse allseits gut tastbar:</Label>
              <RadioGroup 
                value={hasGoodPulse ? "yes" : "no"}
                onValueChange={(v) => setHasGoodPulse(v === "yes")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pulse-normal-yes" />
                  <Label htmlFor="pulse-normal-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pulse-normal-no" />
                  <Label htmlFor="pulse-normal-no">Nein</Label>
                </div>
              </RadioGroup>
              {!hasGoodPulse && (
                <Textarea 
                  className="min-h-[40px] mt-2" 
                  placeholder="Beschreibung der Pulse" 
                  value={pulseStatus} 
                  onChange={(e) => setPulseStatus(e.target.value)} 
                />
              )}
              <div className="space-y-4">
                <Label>Strömungsgeräusche:</Label>
                <RadioGroup 
                  value={hasFlowNoise ? "yes" : "no"}
                  onValueChange={(v) => setHasFlowNoise(v === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="flow-noise-yes" />
                    <Label htmlFor="flow-noise-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="flow-noise-no" />
                    <Label htmlFor="flow-noise-no">Nein</Label>
                  </div>
                </RadioGroup>
                {hasFlowNoise && (
                  <Textarea 
                  className="min-h-[40px] mt-2"
                    placeholder="Beschreibung der Strömungsgeräusche" 
                    value={flowNoiseDetails} 
                    onChange={(e) => setFlowNoiseDetails(e.target.value)} 
                  />
                )}
              </div>
              <div className="space-y-4">
                <Label>Ödeme:</Label>
                <RadioGroup 
                  value={hasEdema ? "yes" : "no"}
                  onValueChange={(v) => setHasEdema(v === "yes")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="edema-yes" />
                    <Label htmlFor="edema-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="edema-no" />
                    <Label htmlFor="edema-no">Nein</Label>
                  </div>
                </RadioGroup>
                {hasEdema && (
                  <Textarea 
                  className="min-h-[40px] mt-2"
                    placeholder="Beschreibung der Ödeme" 
                    value={edemaDetails} 
                    onChange={(e) => setEdemaDetails(e.target.value)} 
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Full width text output */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Generierter Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            className="min-h-[150px]" 
            readOnly 
            value={doctorsLetter.physicalExamination || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
