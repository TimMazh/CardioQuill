import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransthoracicEchocardiographySectionProps {
  doctorsLetter: any;
  updateDoctorsLetter: (data: any) => void;
}

export function TransthoracicEchocardiographySection({ doctorsLetter, updateDoctorsLetter }: TransthoracicEchocardiographySectionProps) {
  // State for all fields
  const [isLvNormal, setIsLvNormal] = useState(
    typeof doctorsLetter.isLvNormal === "boolean" ? doctorsLetter.isLvNormal : true
  );
  const [lvText, setLvText] = useState(doctorsLetter.lvText || "");
  const [ivsd, setIVSd] = useState(doctorsLetter.ivsd || "");
  const [lvedd, setLVEDd] = useState(doctorsLetter.lvedd || "");
  const [lvpwd, setLVPWd] = useState(doctorsLetter.lvpwd || "");  
  const [lvMassIndex, setLVMassIndex] = useState(doctorsLetter.lvMassIndex || "");
  const [rwt, setRWT] = useState(doctorsLetter.rwt || "");
  const [isLvSysNormal, setIsLvSysNormal] = useState(
    typeof doctorsLetter.isLvSysNormal === "boolean" ? doctorsLetter.isLvSysNormal : true
  );
  const [lvSysText, setLvSysText] = useState(doctorsLetter.lvSysText || "");
  const [lvef, setLVEF] = useState(doctorsLetter.lvef || "");
  const [glStrain, setGLStrain] = useState(doctorsLetter.glStrain || "");
  const [isRvNormal, setIsRvNormal] = useState(
    typeof doctorsLetter.isRvNormal === "boolean" ? doctorsLetter.isRvNormal : true
  );
  const [rvText, setRvText] = useState(doctorsLetter.rvText || "");
  const [rvBasal, setRVBasal] = useState(doctorsLetter.rvBasal || "");
  const [isRvSysNormal, setIsRvSysNormal] = useState(
    typeof doctorsLetter.isRvSysNormal === "boolean" ? doctorsLetter.isRvSysNormal : true
  );
  const [rvSysText, setRvSysText] = useState(doctorsLetter.rvSysText || "");
  const [tapse, setTAPSE] = useState(doctorsLetter.tapse || "");
  const [aortenanulus, setAortenanulus] = useState(doctorsLetter.aortenanulus || "");
  const [aortensinus, setAortensinus] = useState(doctorsLetter.aortensinus || "");
  const [aortaAsc, setAortaAsc] = useState(doctorsLetter.aortaAsc || "");
  const [vmax, setVmax] = useState(doctorsLetter.vmax || "");
  const [dpMax, setDPMax] = useState(doctorsLetter.dpMax || "");
  const [dpMean, setDPMean] = useState(doctorsLetter.dpMean || "");
  const [isAtriaNormal, setIsAtriaNormal] = useState(
    typeof doctorsLetter.isAtriaNormal === "boolean" ? doctorsLetter.isAtriaNormal : true
  );
  const [atriaText, setAtriaText] = useState(doctorsLetter.atriaText || "");
  const [lavi, setLAVI] = useState(doctorsLetter.lavi || "");
  const [ravi, setRAVI] = useState(doctorsLetter.ravi || "");
  const [hasRelaxationDisorder, setHasRelaxationDisorder] = useState(doctorsLetter.hasRelaxationDisorder || false);
  const [relaxationText, setRelaxationText] = useState(doctorsLetter.relaxationText || "");
  const [ee, setEE] = useState(doctorsLetter.ee || "");
  const [hasValvePathology, setHasValvePathology] = useState(doctorsLetter.hasValvePathology || false);
  const [mitralValve, setMitralValve] = useState(doctorsLetter.mitralValve || "");
  const [tricuspidValve, setTricuspidValve] = useState(doctorsLetter.tricuspidValve || "");
  const [pulmonalValve, setPulmonalValve] = useState(doctorsLetter.pulmonalValve || "");
  const [aorticValve, setAorticValve] = useState(doctorsLetter.aorticValve || "");
  const [hasPulmPressure, setHasPulmPressure] = useState(doctorsLetter.hasPulmPressure || false);
  const [pulmPressureText, setPulmPressureText] = useState(doctorsLetter.pulmPressureText || "");
  const [hasPericardEffusion, setHasPericardEffusion] = useState(doctorsLetter.hasPericardEffusion || false);
  const [pericardEffusionText, setPericardEffusionText] = useState(doctorsLetter.pericardEffusionText || "");
  const [hasPleuralEffusion, setHasPleuralEffusion] = useState(doctorsLetter.hasPleuralEffusion || false);
  const [pleuralEffusionText, setPleuralEffusionText] = useState(doctorsLetter.pleuralEffusionText || "");


  const [outputText, setOutputText] = useState("");

  useEffect(() => {
    updateECGAnalysisText();
  }, [
    isLvNormal,
    lvText,
    ivsd,
    lvedd,
    lvpwd,
    lvMassIndex,
    rwt,
    isLvSysNormal,
    lvSysText,
    lvef,
    glStrain,
    isRvNormal,
    rvText,
    rvBasal,
    isRvSysNormal,
    rvSysText,
    tapse,
    aortenanulus,
    aortensinus,
    aortaAsc,
    vmax,
    dpMax,
    dpMean,
    isAtriaNormal,
    atriaText,
    lavi,
    ravi,
    hasRelaxationDisorder,
    relaxationText,
    ee,
    hasValvePathology,
    mitralValve,
    tricuspidValve,
    pulmonalValve,
    aorticValve,
    hasPulmPressure,
    pulmPressureText,
    hasPericardEffusion,
    pericardEffusionText,
    hasPleuralEffusion,
    pleuralEffusionText
  ]);

  const updateECGAnalysisText = () => {
    let lvTextOut = isLvNormal
      ? "normal gross, konzentrisch nicht hypertrophiert"
      : lvText;
    let lvSysTextOut = isLvSysNormal
      ? "Normale linksventrikuläre systolische Funktion ohne regionale Wandbewegungsstörungen"
      : lvSysText;
    let rvTextOut = isRvNormal
      ? "normal gross, konzentrisch nicht hypertrophiert"
      : rvText;
    let rvSysTextOut = isRvSysNormal
      ? "Normale rechtsventrikuläre systolische Funktion"
      : rvSysText;
    let atriaTextOut = isAtriaNormal
      ? "Beide Vorhöfe normal gross"
      : atriaText;
    let relaxationTextOut = hasRelaxationDisorder
      ? relaxationText
      : "Keine relevante diastolische Dysfunktion (Relaxationsstörung)";
    let mitralValveOut = "";
    let tricuspidValveOut = "";
    let pulmonalValveOut = "";
    let aorticValveOut = "";
    if (hasValvePathology) {
      
      mitralValveOut = mitralValve === "" || mitralValve === "Keine" ? "Keine Mitralklappeninsuffizienz oder Stenose." : `Mitralklappen${mitralValve.toLowerCase()}.`;
      tricuspidValveOut = tricuspidValve === "" || tricuspidValve === "Keine" ? "Keine Trikuspidalklappeninsuffizienz oder Stenose." : `Trikuspidalklappe${tricuspidValve.toLowerCase()}.`;
      pulmonalValveOut = pulmonalValve === "" || pulmonalValve === "Keine" ? "Keine Pulmonalklappeninsuffizienz oder Stenose." : `Pulmonalklappe${pulmonalValve.toLowerCase()}.`;
      aorticValveOut = aorticValve === "" || aorticValve === "Keine" ? "Keine Aortenklappeninsuffizienz oder Stenose." : `Aortenklappe${aorticValve.toLowerCase()}.`;
    } else {
      mitralValveOut = "Keine Mitralklappeninsuffizienz oder Stenose.";
      tricuspidValveOut = "Keine Trikuspidalklappeninsuffizienz oder Stenose.";
      pulmonalValveOut = "Keine Pulmonalklappeninsuffizienz oder Stenose.";
      aorticValveOut = "Keine Aortenklappeninsuffizienz oder Stenose.";
    }
    let pulmPressureOut = hasPulmPressure ? pulmPressureText : "Kein Hinweis für erhöhte pulmonale Drücke";
    let pericardEffusionOut = hasPericardEffusion ? pericardEffusionText : "Kein Perikarderguss";
    let pleuralEffusionOut = hasPleuralEffusion ? pleuralEffusionText : "Keine Pleuraergüsse";
    let text =
      `Linker Ventrikel ${lvTextOut}. IVSd ${ivsd} mm, LVEDd ${lvedd} mm, LVPWd ${lvpwd} mm, LV-Massenindex ${lvMassIndex} g/m2, RWT ${rwt}. ` +
      `${lvSysTextOut}. LVEF ${lvef}%. GL Strain ${glStrain}%. Aortenanulus ${aortenanulus} mm, Aortensinus ${aortensinus} mm, Aorta ascendens ${aortaAsc} mm. ` +
      `Rechter Ventrikel ${rvTextOut}. RV basal ${rvBasal} mm. ${rvSysTextOut}. TAPSE ${tapse} mm. ` +
      `${atriaTextOut}. LAVI ${lavi} ml/m2, RAVI ${ravi} ml/m2. ${relaxationTextOut}. E/E' ${ee}. ` +
      `${mitralValveOut} ${tricuspidValveOut} ${pulmonalValveOut} ${aorticValveOut} ` +
      `${pulmPressureOut}. ${pericardEffusionOut}. ${pleuralEffusionOut}. Vmax ${vmax} m/s, DP max ${dpMax} mmHg, DP mean ${dpMean} mmHg.`;
    setOutputText(text);

    updateDoctorsLetter({
      isLvNormal,
      lvText,
      ivsd,
      lvedd,
      lvpwd,
      lvMassIndex,
      rwt,
      isLvSysNormal,
      lvSysText,
      lvef,
      glStrain,
      isRvNormal,
      rvText,
      rvBasal,
      isRvSysNormal,
      rvSysText,
      tapse,
      aortenanulus,
      aortensinus,
      aortaAsc,
      vmax,
      dpMax,
      dpMean,
      isAtriaNormal,
      atriaText,
      lavi,
      ravi,
      hasRelaxationDisorder,
      relaxationText,
      ee,
      hasValvePathology,
      mitralValve,
      tricuspidValve,
      pulmonalValve,
      aorticValve,
      hasPulmPressure,
      pulmPressureText,
      hasPericardEffusion,
      pericardEffusionText,
      hasPleuralEffusion,
      pleuralEffusionText
    })
  };
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Transthoracic Echocardiography</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Linker und Rechter Ventrikel nebeneinander */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Linker Ventrikel */}
          <div className="flex-1 bg-background p-4 rounded-md border ">
            <h3 className="text-lg font-medium mb-4">Linker Ventrikel</h3>
            <div className="space-y-2 mb-2">
              <Label>Linker Ventrikel normal?</Label>
              <RadioGroup value={isLvNormal ? "yes" : "no"} 
                          onValueChange={(v) => setIsLvNormal(v === "yes")} className="flex space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="lv-yes" />
                  <Label htmlFor="lv-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="lv-no" />
                <Label htmlFor="lv-no">Nein</Label>
              </div>
              </RadioGroup>
              {isLvNormal === false && (
                <Textarea value={lvText} onChange={e => setLvText(e.target.value)} placeholder="Beschreibung der Abnormalität..." />
              )}
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="ivsd">IVSd</Label>
                <Input 
                  id="ivsd" 
                  value={ivsd} 
                  onChange={(e) => setIVSd(e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="lvedd">LVEDd</Label>
                <Input 
                  id="lvedd" 
                  value={lvedd} 
                  onChange={(e) => setLVEDd(e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="lvpwd">LVPWd</Label>
                <Input 
                  id="lvpwd" 
                  value={lvpwd} 
                  onChange={(e) => setLVPWd(e.target.value)}
                  placeholder="mm"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="lvMassIndex">LV-Massenindex</Label>
                <Input 
                  id="lvMassIndex" 
                  value={lvMassIndex} 
                  onChange={(e) => setLVMassIndex(e.target.value)}
                  placeholder="g/m²"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="rwt">RWT:</Label>
                <Input 
                  id="rwt" 
                  value={rwt} 
                  onChange={(e) => setRWT(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
            <Label>Normale linksventrikuläre systolische Funktion?</Label>
            <RadioGroup value={isLvSysNormal ? "yes" : "no"} onValueChange={(v) => setIsLvSysNormal(v === "yes")} className="flex space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="lv-sys-yes" />
                <Label htmlFor="lv-sys-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="lv-sys-no" />
                <Label htmlFor="lv-sys-no">Nein</Label>
              </div>
            </RadioGroup>
            {isLvSysNormal === false && (
              <Textarea value={lvSysText} onChange={e => setLvSysText(e.target.value)} placeholder="Beschreibung der Abnormalität..." />
            )}
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="lvef">LVEF</Label>
                <Input id="lvef" value={lvef} onChange={e => setLVEF(e.target.value)} placeholder="%" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="glStrain">GL Strain</Label>
                <Input id="glStrain" value={glStrain} onChange={e => setGLStrain(e.target.value)} placeholder="%" />
              </div>
            </div>
          </div>
          {/* Rechter Ventrikel */}
          <div className="flex-1 bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Rechter Ventrikel</h3>
            <div className="space-y-2 mb-2">
            <Label>Rechter Ventrikel normal?</Label>
            <RadioGroup value={isRvNormal ? "yes" : "no"} onValueChange={(v) => setIsRvNormal(v === "yes")} className="flex space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="rv-yes" />
                <Label htmlFor="rv-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="rv-no" />
                <Label htmlFor="rv-no">Nein</Label>
              </div>
            </RadioGroup>
            {isRvNormal === false && (
              <Textarea value={rvText} onChange={e => setRvText(e.target.value)} placeholder="Beschreibung der Abnormalität..." />
            )}
            <div className="flex-1 space-y-2">
                <Label htmlFor="rvBasal">RV basal</Label>
                <Input id="rvBasal" value={rvBasal} onChange={e => setRVBasal(e.target.value)} placeholder="mm" />
              </div>
            </div>
            <div className="space-y-2 mb-2">
            <Label className="mt-4">Normale rechtsventrikuläre systolische Funktion?</Label>
            <RadioGroup value={isRvSysNormal ? "yes" : "no"} onValueChange={(v) => setIsRvSysNormal(v === "yes")} className="flex space-x-4 mb-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="rv-sys-yes" />
                <Label htmlFor="rv-sys-yes">Ja</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="rv-sys-no" />
                <Label htmlFor="rv-sys-no">Nein</Label>
              </div>
            </RadioGroup>
            {isRvSysNormal === false && (
              <Textarea value={rvSysText} onChange={e => setRvSysText(e.target.value)} placeholder="Beschreibung der Abnormalität..." />
            )}
</div>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="tapse">TAPSE</Label>
                <Input id="tapse" value={tapse} onChange={e => setTAPSE(e.target.value)} placeholder="mm" />
              </div>
            </div>
          </div>
        </div>
        {/* Ende Flex-Container für Ventrikel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Aorta */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Aorta</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="aortenanulus">Anulus</Label>
                <Input 
                  id="aortenanulus" 
                  value={aortenanulus} 
                  onChange={(e) => setAortenanulus(e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="aortensinus">Sinus</Label>  
                <Input 
                  id="aortensinus" 
                  value={aortensinus} 
                  onChange={(e) => setAortensinus(e.target.value)}
                  placeholder="mm"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="aortaAsc">Ascendens</Label>
                <Input 
                  id="aortaAsc" 
                  value={aortaAsc} 
                  onChange={(e) => setAortaAsc(e.target.value)}
                  placeholder="mm"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="vmax">Vmax</Label>
                <Input id="vmax" value={vmax} onChange={e => setVmax(e.target.value)} placeholder="m/s" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="dpmax">DP max</Label>
                <Input id="dpmax" value={dpMax} onChange={e => setDPMax(e.target.value)} placeholder="mmHg" />
              </div>
              <div className="flex flex-col space-y-1">
                <Label htmlFor="dpmean">DP mean</Label>
                <Input id="dpmean" value={dpMean} onChange={e => setDPMean(e.target.value)} placeholder="mmHg" />
              </div>
            </div>
          </div>
          {/* Vorhöfe */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Vorhöfe</h3>
            <div className="space-y-2 mb-2">
              <Label>Vorhöfe normal gross?</Label>
              <RadioGroup value={isAtriaNormal ? "yes" : "no"} 
                          onValueChange={(v) => setIsAtriaNormal(v === "yes")} className="flex space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="atria-yes" />
                  <Label htmlFor="atria-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="atria-no" />
                  <Label htmlFor="atria-no">Nein</Label>
                </div>
              </RadioGroup>
              {isAtriaNormal === false && (
                <Textarea value={atriaText} onChange={e => setAtriaText(e.target.value)} placeholder="Beschreibung der Abnormalität..." />
              )}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="lavi">LAVI</Label>
                  <Input id="lavi" value={lavi} onChange={e => setLAVI(e.target.value)} placeholder="ml/m²" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="ravi">RAVI</Label>
                   <Input id="ravi" value={ravi} onChange={e => setRAVI(e.target.value)} placeholder="ml/m²" />
                </div>
              </div>
            </div>
          </div>
          {/* Relaxation */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Relaxation</h3>
            <div className="space-y-2">
              <Label>Relaxationsstörung?</Label>
              <RadioGroup value={hasRelaxationDisorder ? "yes" : "no"} 
                          onValueChange={(v) => setHasRelaxationDisorder(v === "yes")} className="flex space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="relax-yes" />
                  <Label htmlFor="relax-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="relax-no" />
                  <Label htmlFor="relax-no">Nein</Label>
                </div>
              </RadioGroup>
              {hasRelaxationDisorder && (
                <Textarea value={relaxationText} onChange={e => setRelaxationText(e.target.value)} placeholder="Beschreibung der Relaxationsstörung..." />
              )}
              <div className="flex-1 space-y-2">
                  <Label htmlFor="ee">E/E':</Label>
                <Input id="ee" value={ee} onChange={e => setEE(e.target.value)} />
              </div>
            </div>
          </div>
          {/* Herzklappe */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Herzklappe</h3>
            <div className="space-y-2">
              <Label>Pathologische Herzklappe?</Label>
              <RadioGroup value={hasValvePathology ? "yes" : "no"} 
              onValueChange={(v) => setHasValvePathology(v === "yes")} className="flex space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="valve-yes" />
                  <Label htmlFor="valve-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="valve-no" />
                  <Label htmlFor="valve-no">Nein</Label>
                </div>
              </RadioGroup>
              {hasValvePathology && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Mitralklappe</Label>
                    <Select value={mitralValve} onValueChange={setMitralValve}>
                      <SelectTrigger id="mitral-valve">
                        <SelectValue placeholder="Keine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keine">Keine</SelectItem>
                        <SelectItem value="Stenose">Stenose</SelectItem>
                        <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                        <SelectItem value="Stenose und -insuffizienz">Stenose und Insuffizienz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Trikuspidalklappe</Label>
                    <Select value={tricuspidValve} onValueChange={setTricuspidValve}>
                      <SelectTrigger id="tricuspid-valve">
                        <SelectValue placeholder="Keine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keine">Keine</SelectItem>
                        <SelectItem value="Stenose">Stenose</SelectItem>
                        <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                        <SelectItem value="Stenose und -insuffizienz">Stenose und Insuffizienz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pulmonalklappe</Label>
                    <Select value={pulmonalValve} onValueChange={setPulmonalValve}>
                      <SelectTrigger id="pulmonal-valve">
                        <SelectValue placeholder="Keine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keine">Keine</SelectItem>
                        <SelectItem value="Stenose">Stenose</SelectItem>
                        <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                        <SelectItem value="Stenose und -insuffizienz">Stenose und Insuffizienz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Aortenklappe</Label>
                    <Select value={aorticValve} onValueChange={setAorticValve}>
                      <SelectTrigger id="aortic-valve">
                        <SelectValue placeholder="Keine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Keine">Keine</SelectItem>
                        <SelectItem value="Stenose">Stenose</SelectItem>
                        <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                        <SelectItem value="Stenose und -insuffizienz">Stenose und Insuffizienz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Pulmonale Drücke */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Pulmonale Drücke</h3>
            <div className="space-y-2">
              <Label>Erhöhte pulmonale Drücke?</Label>
              <RadioGroup value={hasPulmPressure ? "yes" : "no"} 
                      onValueChange={(v) => setHasPulmPressure(v === "yes")} className="flex space-x-4 mb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pulm-yes" />
                  <Label htmlFor="pulm-yes">Ja</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pulm-no" />
                  <Label htmlFor="pulm-no">Nein</Label>
                </div>
              </RadioGroup>
              {hasPulmPressure && (
                <Textarea value={pulmPressureText} onChange={e => setPulmPressureText(e.target.value)} placeholder="Beschreibung der pulmonalen Drücke..." />
              )}
            </div>
          </div>
          {/* Ergüsse */}
          <div className="bg-background p-4 rounded-md border">
            <h3 className="text-lg font-medium mb-4">Ergüsse</h3>
            <div className="space-y-2">
              <div>
                <div className="flex-1 space-y-2">
                <Label>Perikarderguss?</Label>
                <RadioGroup value={hasPericardEffusion ? "yes" : "no"} 
                      onValueChange={(v) => setHasPericardEffusion(v === "yes")} className="flex space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="peri-yes" />
                    <Label htmlFor="peri-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="peri-no" />
                    <Label htmlFor="peri-no">Nein</Label>
                  </div>
                </RadioGroup>
                {hasPericardEffusion && (
                  <Textarea value={pericardEffusionText} onChange={e => setPericardEffusionText(e.target.value)} placeholder="Beschreibung des Perikardergusses..." />
                )}
              </div>
              </div>
                <div className="flex-1 space-y-2">
                <Label>Pleuraergüsse?</Label>
                <RadioGroup value={hasPleuralEffusion ? "yes" : "no"} 
                      onValueChange={(v) => setHasPleuralEffusion(v === "yes")} className="flex space-x-4 mb-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="pleura-yes" />
                    <Label htmlFor="pleura-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="pleura-no" />
                    <Label htmlFor="pleura-no">Nein</Label>
                  </div>
                </RadioGroup>
                {hasPleuralEffusion && (
                  <Textarea value={pleuralEffusionText} onChange={e => setPleuralEffusionText(e.target.value)} placeholder="Beschreibung der Pleuraergüsse..." />
                )}
              </div>
            </div>
          </div>

        </div>
        {/* Generierter Text */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Generierter Text</h3>
          <Textarea className="min-h-[150px]" value={outputText} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
