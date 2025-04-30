import { DoctorsLetter } from "./types";
import { ServerService } from "../services/ServerService";
import { TempRagStorage } from "./llmRagStorage";

const serverService = new ServerService();

export async function fetchLLMSummary(letter: DoctorsLetter): Promise<string> {
  // 1. Storage leeren (pro Brief)
  const ragStorage = TempRagStorage.getInstance();
  ragStorage.clear();

  // 2. Alle relevanten Felder als Text zusammenbauen und in Storage legen
  const fields = [
    `Diagnose: ${letter.diagnosis || ""}`,
    `Kardiovaskuläre Risikofaktoren: ${letter.cardiovascularRiskFactors || ""}`,
    `Nebendiagnosen: ${letter.secondaryDiagnosis || ""}`,
    `Empfohlene Massnahmen: ${letter.recommendedProcedure || ""}`,
    `Anamnese: ${letter.anamnesis || ""}`,
    `Vormedikation: ${letter.previousMedication || ""}`,
    `Körperliche Untersuchung: ${letter.physicalExamination || ""}`,
    `EKG: ${letter.ecgAnalysis || ""}`,
    `Echo: ${letter.transthoracicEchocardiography || ""}`,
    `Ergometrie: ${letter.ergometry || ""}`,
    `LZ-EKG: ${letter.lzEkg || ""}`,
    `CT-Koronarangiographie: ${letter.ctKoronarangiographie || ""}`
  ];
  const infoText = fields.join("\n---\n");
  ragStorage.addDoc(infoText);

  // 3. Prompt für LLM bauen, der Storage als Wissensbasis nutzt
  const prompt = ragStorage.getAllDocs().join("\n\n").replace(/\u2022/g, "-");
  console.log(prompt);
  // 4. Prompt mit speziellem RAG-Präfix absenden (Backend muss _TEMP_RAG_ erkennen!)
  const rawSummary = await serverService.executePrompt(prompt, true);
  // Extrahiere den ersten Block zwischen --- ... ---
  const match = rawSummary.match(/---\s*([\s\S]*?)\s*---/);
  if (match && match[1]) {
    return match[1].trim();
  }
  // Fallback: falls kein Block gefunden, gib alles zurück
  return rawSummary.trim();
}
