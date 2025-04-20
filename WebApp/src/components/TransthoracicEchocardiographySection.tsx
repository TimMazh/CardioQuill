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
  const [lvNormal, setLvNormal] = useState("yes");
  const [lvText, setLvText] = useState("");
  const [ivsd, setIVSd] = useState("");
  const [lvedd, setLVEDd] = useState("");
  const [lvpwd, setLVPWd] = useState("");
  const [lvMassIndex, setLVMassIndex] = useState("");
  const [rwt, setRWT] = useState("");
  const [lvSysNormal, setLvSysNormal] = useState("yes");
  const [lvSysText, setLvSysText] = useState("");
  const [lvef, setLVEF] = useState("");
  const [glStrain, setGLStrain] = useState("");
  const [aortenanulus, setAortenanulus] = useState("");
  const [aortensinus, setAortensinus] = useState("");
  const [aortaAsc, setAortaAsc] = useState("");
  const [rvNormal, setRvNormal] = useState("yes");
  const [rvText, setRvText] = useState("");
  const [rvBasal, setRVBasal] = useState("");
  const [rvSysNormal, setRvSysNormal] = useState("yes");
  const [rvSysText, setRvSysText] = useState("");
  const [tapse, setTAPSE] = useState("");
  const [atriaNormal, setAtriaNormal] = useState("yes");
  const [atriaText, setAtriaText] = useState("");
  const [lavi, setLAVI] = useState("");
  const [ravi, setRAVI] = useState("");
  const [relaxationDisorder, setRelaxationDisorder] = useState("no");
  const [relaxationText, setRelaxationText] = useState("");
  const [ee, setEE] = useState("");
  const [valvePathology, setValvePathology] = useState("no");
  const [mitralValve, setMitralValve] = useState("");
  const [tricuspidValve, setTricuspidValve] = useState("");
  const [pulmonalValve, setPulmonalValve] = useState("");
  const [aorticValve, setAorticValve] = useState("");
  const [pulmPressure, setPulmPressure] = useState("no");
  const [pulmPressureText, setPulmPressureText] = useState("");
  const [pericardEffusion, setPericardEffusion] = useState("no");
  const [pericardEffusionText, setPericardEffusionText] = useState("");
  const [pleuralEffusion, setPleuralEffusion] = useState("no");
  const [pleuralEffusionText, setPleuralEffusionText] = useState("");
  const [vmax, setVmax] = useState("");
  const [dpMax, setDPMax] = useState("");
  const [dpMean, setDPMean] = useState("");

  const [outputText, setOutputText] = useState("");

  useEffect(() => {
    let lvTextOut = lvNormal === "yes"
      ? "normal gross, konzentrisch nicht hypertrophiert"
      : lvText;
    let lvSysTextOut = lvSysNormal === "yes"
      ? "Normalle linksventrikuläre systolische Funktion ohne regionnale Wandbewegungsstörungen"
      : lvSysText;
    let rvTextOut = rvNormal === "yes"
      ? "normal gross, konzentrisch nicht hypertrophiert"
      : rvText;
    let rvSysTextOut = rvSysNormal === "yes"
      ? "Normale rechtsventrikuläre systolische Funktion"
      : rvSysText;
    let atriaTextOut = atriaNormal === "yes"
      ? "Beide Vorhöfe normal gross"
      : atriaText;
    let relaxationTextOut = relaxationDisorder === "yes"
      ? relaxationText
      : "Keine relevante diastolische Dysfunktion (Relaxationsstörung)";
    let mitralValveOut = "";
    let tricuspidValveOut = "";
    let pulmonalValveOut = "";
    let aorticValveOut = "";
    if (valvePathology === "yes") {
      mitralValveOut = mitralValve === "" || mitralValve === "Keine" ? "Keine Mitralklappeninsuffizienz oder Stenose." : `Mitralklappe: ${mitralValve}.`;
      tricuspidValveOut = tricuspidValve === "" || tricuspidValve === "Keine" ? "Keine Trikuspidalklappeninsuffizienz oder Stenose." : `Trikuspidalklappe: ${tricuspidValve}.`;
      pulmonalValveOut = pulmonalValve === "" || pulmonalValve === "Keine" ? "Keine Pulmonalklappeninsuffizienz oder Stenose." : `Pulmonalklappe: ${pulmonalValve}.`;
      aorticValveOut = aorticValve === "" || aorticValve === "Keine" ? "Keine Aortenklappeninsuffizienz oder Stenose." : `Aortenklappe: ${aorticValve}.`;
    } else {
      mitralValveOut = "Keine Mitralklappeninsuffizienz oder Stenose.";
      tricuspidValveOut = "Keine Trikuspidalklappeninsuffizienz oder Stenose.";
      pulmonalValveOut = "Keine Pulmonalklappeninsuffizienz oder Stenose.";
      aorticValveOut = "Keine Aortenklappeninsuffizienz oder Stenose.";
    }
    let pulmPressureOut = pulmPressure === "yes" ? pulmPressureText : "Kein Hinweis für erhöhte pulmonale Drücke";
    let pericardEffusionOut = pericardEffusion === "yes" ? pericardEffusionText : "Kein Perikarderguss";
    let pleuralEffusionOut = pleuralEffusion === "yes" ? pleuralEffusionText : "Keine Pleuraergüsse";
    let text =
      `Linker Ventrikel ${lvTextOut}. IVSd ${ivsd} mm, LVEDd ${lvedd} mm, LVPWd ${lvpwd} mm, LV-Massenindex ${lvMassIndex} g/m2, RWT ${rwt}. ` +
      `${lvSysTextOut}. LVEF ${lvef}%. GL Strain ${glStrain}%. Aortenanulus ${aortenanulus} mm, Aortensinus ${aortensinus} mm, Aorta ascendens ${aortaAsc} mm. ` +
      `Rechter Ventrikel ${rvTextOut}. RV basal ${rvBasal} mm. ${rvSysTextOut}. TAPSE ${tapse} mm. ` +
      `${atriaTextOut}. LAVI ${lavi} ml/m2, RAVI ${ravi} ml/m2. ${relaxationTextOut}. E/E' ${ee}. ` +
      `${mitralValveOut} ${tricuspidValveOut} ${aorticValveOut} ${pulmonalValveOut} ` +
      `${pulmPressureOut}. ${pericardEffusionOut}. ${pleuralEffusionOut}. Vmax ${vmax} m/s, DP max ${dpMax} mmHg, DP mean ${dpMean} mmHg.`;
    setOutputText(text);
    updateDoctorsLetter({ transthoracicEchocardiography: text });
  }, [lvNormal, lvText, ivsd, lvedd, lvpwd, lvMassIndex, rwt, lvSysNormal, lvSysText, lvef, glStrain, aortenanulus, aortensinus, aortaAsc, rvNormal, rvText, rvBasal, rvSysNormal, rvSysText, tapse, atriaNormal, atriaText, lavi, ravi, relaxationDisorder, relaxationText, ee, valvePathology, mitralValve, tricuspidValve, pulmonalValve, aorticValve, pulmPressure, pulmPressureText, pericardEffusion, pericardEffusionText, pleuralEffusion, pleuralEffusionText, vmax, dpMax, dpMean]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Transthoracic Echocardiography</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Linker Ventrikel */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Linker Ventrikel</h3>
          <Label>Linker Ventrikel normal?</Label>
          <RadioGroup value={lvNormal} onValueChange={setLvNormal} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="lv-yes" />
              <Label htmlFor="lv-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="lv-no" />
              <Label htmlFor="lv-no">Nein</Label>
            </div>
          </RadioGroup>
          {lvNormal === "no" && (
            <Textarea value={lvText} onChange={e => setLvText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={ivsd} onChange={e => setIVSd(e.target.value)} placeholder="IVSd (mm)" />
            <Input value={lvedd} onChange={e => setLVEDd(e.target.value)} placeholder="LVEDd (mm)" />
            <Input value={lvpwd} onChange={e => setLVPWd(e.target.value)} placeholder="LVPWd (mm)" />
            <Input value={lvMassIndex} onChange={e => setLVMassIndex(e.target.value)} placeholder="LV-Massenindex (g/m2)" />
            <Input value={rwt} onChange={e => setRWT(e.target.value)} placeholder="RWT" />
          </div>
        </div>
        {/* LV systolische Funktion */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Normale linksventrikuläre systolische Funktion?</Label>
          <RadioGroup value={lvSysNormal} onValueChange={setLvSysNormal} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="lv-sys-yes" />
              <Label htmlFor="lv-sys-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="lv-sys-no" />
              <Label htmlFor="lv-sys-no">Nein</Label>
            </div>
          </RadioGroup>
          {lvSysNormal === "no" && (
            <Textarea value={lvSysText} onChange={e => setLvSysText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={lvef} onChange={e => setLVEF(e.target.value)} placeholder="LVEF (%)" />
            <Input value={glStrain} onChange={e => setGLStrain(e.target.value)} placeholder="GL Strain (%)" />
            <Input value={aortenanulus} onChange={e => setAortenanulus(e.target.value)} placeholder="Aortenanulus (mm)" />
            <Input value={aortensinus} onChange={e => setAortensinus(e.target.value)} placeholder="Aortensinus (mm)" />
            <Input value={aortaAsc} onChange={e => setAortaAsc(e.target.value)} placeholder="Aorta ascendens (mm)" />
          </div>
        </div>
        {/* Rechter Ventrikel */}
        <div className="bg-background p-4 rounded-md border">
          <h3 className="text-lg font-medium mb-4">Rechter Ventrikel</h3>
          <Label>Rechter Ventrikel normal?</Label>
          <RadioGroup value={rvNormal} onValueChange={setRvNormal} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="rv-yes" />
              <Label htmlFor="rv-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="rv-no" />
              <Label htmlFor="rv-no">Nein</Label>
            </div>
          </RadioGroup>
          {rvNormal === "no" && (
            <Textarea value={rvText} onChange={e => setRvText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={rvBasal} onChange={e => setRVBasal(e.target.value)} placeholder="RV basal (mm)" />
          </div>
        </div>
        {/* RV systolische Funktion */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Normale rechtsventrikuläre systolische Funktion?</Label>
          <RadioGroup value={rvSysNormal} onValueChange={setRvSysNormal} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="rv-sys-yes" />
              <Label htmlFor="rv-sys-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="rv-sys-no" />
              <Label htmlFor="rv-sys-no">Nein</Label>
            </div>
          </RadioGroup>
          {rvSysNormal === "no" && (
            <Textarea value={rvSysText} onChange={e => setRvSysText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={tapse} onChange={e => setTAPSE(e.target.value)} placeholder="TAPSE (mm)" />
          </div>
        </div>
        {/* Vorhöfe */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Vorhöfe normal gross?</Label>
          <RadioGroup value={atriaNormal} onValueChange={setAtriaNormal} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="atria-yes" />
              <Label htmlFor="atria-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="atria-no" />
              <Label htmlFor="atria-no">Nein</Label>
            </div>
          </RadioGroup>
          {atriaNormal === "no" && (
            <Textarea value={atriaText} onChange={e => setAtriaText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={lavi} onChange={e => setLAVI(e.target.value)} placeholder="LAVI (ml/m2)" />
            <Input value={ravi} onChange={e => setRAVI(e.target.value)} placeholder="RAVI (ml/m2)" />
          </div>
        </div>
        {/* Relaxationsstörung */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Relaxationsstörung?</Label>
          <RadioGroup value={relaxationDisorder} onValueChange={setRelaxationDisorder} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="relax-yes" />
              <Label htmlFor="relax-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="relax-no" />
              <Label htmlFor="relax-no">Nein</Label>
            </div>
          </RadioGroup>
          {relaxationDisorder === "yes" && (
            <Textarea value={relaxationText} onChange={e => setRelaxationText(e.target.value)} placeholder="Beschreibung..." />
          )}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={ee} onChange={e => setEE(e.target.value)} placeholder="E/E'" />
          </div>
        </div>
        {/* Herzklappen */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Pathologische Herzklappe?</Label>
          <RadioGroup value={valvePathology} onValueChange={setValvePathology} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="valve-yes" />
              <Label htmlFor="valve-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="valve-no" />
              <Label htmlFor="valve-no">Nein</Label>
            </div>
          </RadioGroup>
          {valvePathology === "yes" && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label>Mitralklappe</Label>
                <Select value={mitralValve} onValueChange={setMitralValve}>
                  <SelectTrigger id="mitral-valve">
                    <SelectValue placeholder="Auswahl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keine">Keine</SelectItem>
                    <SelectItem value="Stenose">Stenose</SelectItem>
                    <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trikuspidalklappe</Label>
                <Select value={tricuspidValve} onValueChange={setTricuspidValve}>
                  <SelectTrigger id="tricuspid-valve">
                    <SelectValue placeholder="Auswahl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keine">Keine</SelectItem>
                    <SelectItem value="Stenose">Stenose</SelectItem>
                    <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pulmonalklappe</Label>
                <Select value={pulmonalValve} onValueChange={setPulmonalValve}>
                  <SelectTrigger id="pulmonal-valve">
                    <SelectValue placeholder="Auswahl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keine">Keine</SelectItem>
                    <SelectItem value="Stenose">Stenose</SelectItem>
                    <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aortenklappe</Label>
                <Select value={aorticValve} onValueChange={setAorticValve}>
                  <SelectTrigger id="aortic-valve">
                    <SelectValue placeholder="Auswahl" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Keine">Keine</SelectItem>
                    <SelectItem value="Stenose">Stenose</SelectItem>
                    <SelectItem value="Insuffizienz">Insuffizienz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        {/* Pulmonale Drücke */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Erhöhte pulmonale Drücke?</Label>
          <RadioGroup value={pulmPressure} onValueChange={setPulmPressure} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="pulm-yes" />
              <Label htmlFor="pulm-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="pulm-no" />
              <Label htmlFor="pulm-no">Nein</Label>
            </div>
          </RadioGroup>
          {pulmPressure === "yes" && (
            <Textarea value={pulmPressureText} onChange={e => setPulmPressureText(e.target.value)} placeholder="Beschreibung..." />
          )}
        </div>
        {/* Perikarderguss */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Perikarderguss?</Label>
          <RadioGroup value={pericardEffusion} onValueChange={setPericardEffusion} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="peri-yes" />
              <Label htmlFor="peri-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="peri-no" />
              <Label htmlFor="peri-no">Nein</Label>
            </div>
          </RadioGroup>
          {pericardEffusion === "yes" && (
            <Textarea value={pericardEffusionText} onChange={e => setPericardEffusionText(e.target.value)} placeholder="Beschreibung..." />
          )}
        </div>
        {/* Pleuraergüsse */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Pleuraergüsse?</Label>
          <RadioGroup value={pleuralEffusion} onValueChange={setPleuralEffusion} className="flex space-x-4 mb-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="pleura-yes" />
              <Label htmlFor="pleura-yes">Ja</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="pleura-no" />
              <Label htmlFor="pleura-no">Nein</Label>
            </div>
          </RadioGroup>
          {pleuralEffusion === "yes" && (
            <Textarea value={pleuralEffusionText} onChange={e => setPleuralEffusionText(e.target.value)} placeholder="Beschreibung..." />
          )}
        </div>
        {/* Vmax, DP max, DP mean */}
        <div className="bg-background p-4 rounded-md border">
          <Label>Vmax, DP max, DP mean</Label>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Input value={vmax} onChange={e => setVmax(e.target.value)} placeholder="Vmax (m/s)" />
            <Input value={dpMax} onChange={e => setDPMax(e.target.value)} placeholder="DP max (mmHg)" />
            <Input value={dpMean} onChange={e => setDPMean(e.target.value)} placeholder="DP mean (mmHg)" />
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
