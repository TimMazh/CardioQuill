import { DoctorsLetter } from "./types";
import { Document, Packer, Paragraph, TextRun, AlignmentType, Header, Footer, ImageRun, IImageOptions, Table, TableRow, TableCell } from "docx";
import { formatDate } from "./utils";
import { fetchLLMSummary } from "./llmSummary";





// Helper to load image as ArrayBuffer (browser/node compatible)
async function loadLogoImage(): Promise<ArrayBuffer> {
  // Browser fetch for image asset
  const response = await fetch("/src/lib/logo.png");
  return await response.arrayBuffer();
}

export async function generateWordDocument(letter: DoctorsLetter): Promise<Blob> {
  // Hole die LLM-Zusammenfassung
  const llmSummary = await fetchLLMSummary(letter);
  const today = new Date();
  const dateStr = today.toLocaleDateString("de-CH", { day: "2-digit", month: "long", year: "numeric" });
  const patientControlDate = formatDate(letter.patientControlDate);
  const patientDateOfBirth = formatDate(letter.patientDateOfBirth);

  // Datum im Format MMYY für patCode
  let monthYear = "";
  console.log(letter);
  if (patientControlDate) {
    // Erwartetes Format: YYYY-MM-DD
    const parts = patientControlDate.split(".");
    if (parts.length === 3) {
      // parts[1] = Monat, parts[0] = Tag, parts[2] = Jahr
      monthYear = parts[1].padStart(2, '0') + parts[2].slice(-2);
    }
  }
  const patCode = `${(letter.patientLastName || "").substring(0,3).toLowerCase()}${(letter.patientFirstName || "").substring(0,1).toLowerCase()}${monthYear}`;


  // Header/Footer color
  const grayColor = "808080";

  // Header text for subsequent pages
  const headerText = `${letter.patientLastName || "Patientennachname"} ${letter.patientFirstName || "Patientenvorname"}, ${patientDateOfBirth || "Geburtsdatum"} - Ambulante Kontrolle am ${patientControlDate || "Kontrolldatum"}`;
  // Footer text
  const footerText = "Kardiologische Praxis Rosenberg | Rosenbergstrasse 8 | CH - 9000 St. Gallen | info@kardiologische-praxis-rosenberg.ch | www.kardiologische-praxis-rosenberg.ch | Telefon +41 (0)71 245 77 25";
  // Load logo image for first page header
  // Always load the PNG logo as ArrayBuffer, convert to Uint8Array for docx
const logoBuffer = await loadLogoImage();
const logoUint8Array = new Uint8Array(logoBuffer);
console.log("[wordExportUtil] LogoBuffer type:", typeof logoBuffer);
console.log("[wordExportUtil] LogoUint8Array length:", logoUint8Array.length);
console.log("[wordExportUtil] LogoUint8Array first bytes:", Array.from(logoUint8Array.slice(0, 8)));

  const doc = new Document({
    sections: [
      {
        properties: {
          titlePage: true
        },
        headers: {
          first: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    data: logoUint8Array,
                    transformation: { width: 232, height: 42 },
                    type: "png"
                  })
                ],
              }),
            ],
          }),
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: headerText,
                    color: grayColor,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          first: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: footerText,
                    color: grayColor,
                  }),
                ],
              }),
            ],
          }),
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: footerText,
                    color: grayColor,
                  }),
                ],
              }),
            ],
          }),
        },
        
        children: [ 
          // Logo links, Ärzteinformationen rechts in einer Tabelle
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
                new TextRun({ text: letter.doctorGender === "female" ? "Frau" : "Herrn" }),
                new TextRun({ break: 1 }),
                new TextRun({ text: letter.doctorTitle || "" }),
                new TextRun({ break: 1 }),
                new TextRun({ text: `${letter.doctorFirstName || "[Arztname]"} ${letter.doctorLastName || ""}`.trim() }),
                new TextRun({ break: 1 }),
                new TextRun({ text: letter.doctorClinic || "[Klinik Name]" }),
                new TextRun({ break: 1 }),
                new TextRun({ text: letter.doctorAddress || "[Adresse]" }),
                new TextRun({ break: 1 })
              ]
            }),
          // Datum und Patientencode rechts
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun(`St. Gallen, den ${dateStr}`),
              new TextRun({ break: 1 }),
              new TextRun(patCode),
              new TextRun("")
            ]
          }),
          // Patientendaten links
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: "Patient", bold: true }),
              new TextRun("\t\t\t"),
              new TextRun({ text: `${letter.patientFirstName || "[Vorname]"} ${letter.patientLastName || "[Nachname]"}` }),
              new TextRun({ break: 1 }),
              new TextRun({ text: "Geburtsdatum", bold: true }),
              new TextRun("\t\t"),
              new TextRun({ text: patientDateOfBirth || "[Geburtsdatum]" }),
              new TextRun({ break: 1 }),
              new TextRun({ text: "Wohnhaft", bold: true }),
              new TextRun("\t\t"),
              new TextRun({ text: `${letter.patientAddress || "[Adresse]"}` }),
              new TextRun({ break: 1 }),
              new TextRun({ text: "Amb. Kontrolle", bold: true }),
              new TextRun("\t\t"),
              new TextRun({ text: patientControlDate || "[Kontrolldatum]" }),
              new TextRun({ break: 1 })
            ]
          }),
          // Einleitungstext (ggf. gesplittet nach erstem Auftreten von Arzt Vorname oder Nachname)
          ...(() => {
            const intro = letter.introText || "";
            const firstName = letter.doctorFirstName || "";
            const lastName = letter.doctorLastName || "";
            let splitIdx = -1;
            if (firstName && intro.includes(firstName)) {
              splitIdx = intro.indexOf(firstName) + firstName.length;
            } else if (lastName && intro.includes(lastName)) {
              splitIdx = intro.indexOf(lastName) + lastName.length;
            }
            if (splitIdx > -1) {
              return [
                new Paragraph({ text: intro.slice(0, splitIdx).trim(), spacing: { after: 200 } }),
                new Paragraph({ text: intro.slice(splitIdx).trim(), spacing: { after: 200 } })
              ];
            } else {
              return [new Paragraph({ text: intro, spacing: { after: 200 } })];
            }
          })(),
          // Diagnose
          new Paragraph({ children: [new TextRun({ text: "Diagnose:", bold: true })] }),
          new Paragraph({
  children: (letter.diagnosis || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Kardiovaskuläre Risikofaktoren
          new Paragraph({ children: [new TextRun({ text: "Kardiovaskuläre Risikofaktoren:", bold: true })] }),
          new Paragraph({
  children: (letter.cardiovascularRiskFactors || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Nebendiagnosen
          new Paragraph({ children: [new TextRun({ text: "Nebendiagnosen:", bold: true })] }),
          new Paragraph({
  children: (letter.secondaryDiagnosis || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Empfohlene Massnahmen
          new Paragraph({ children: [new TextRun({ text: "Empfohlene Massnahmen:", bold: true })] }),
          new Paragraph({
  children: (letter.recommendedProcedure || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Anamnese
          new Paragraph({ children: [new TextRun({ text: "Anamnese:", bold: true })] }),
          new Paragraph({
  children: (letter.anamnesis || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Vormedikation
          new Paragraph({ children: [new TextRun({ text: "Vormedikation:", bold: true })] }),
          new Paragraph({
  children: (letter.previousMedication || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Körperliche Untersuchung
          new Paragraph({ children: [new TextRun({ text: "Körperliche Untersuchung:", bold: true })] }),
          new Paragraph({
  children: (letter.physicalExamination || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // EKG
          new Paragraph({ children: [new TextRun({ text: "12-Kanal-Ruhe-EKG / Rhythmusstreifen", bold: true })] }),
          new Paragraph({
  children: (letter.ecgAnalysis || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Echo
          new Paragraph({ children: [new TextRun({ text: "Transthorakale Echokardiographie:", bold: true })] }),
          new Paragraph({
  children: (letter.transthoracicEchocardiography || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Ergometrie
          new Paragraph({ children: [new TextRun({ text: "Ergometrie:", bold: true })] }),
          new Paragraph({
  children: (letter.ergometry || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // LZ-EKG
          new Paragraph({ children: [new TextRun({ text: `6d- / 24h-LZ-EKG vom ${patientControlDate || "[Kontrolldatum]"}:`, bold: true })] }),
          new Paragraph({
  children: (letter.lzEkg || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // CT-Koronarangiographie
          new Paragraph({ children: [new TextRun({ text: `CT-Koronarangiographie vom ${patientControlDate || "[Kontrolldatum]"}:`, bold: true })] }),
          new Paragraph({
  children: (letter.ctKoronarangiographie  || "").split("\n").flatMap((line, idx, arr) =>
    idx < arr.length - 1
      ? [new TextRun(line), new TextRun({ break: 1 })]
      : [new TextRun(line)]
  ),
  spacing: { after: 200 }
}),
          // Zusammenfassende Beurteilung
          new Paragraph({ children: [new TextRun({ text: "Zusammenfassende Beurteilung:", bold: true })] }),
          new Paragraph({
            children: (llmSummary || "").split("\n").flatMap((line, idx, arr) =>
              idx < arr.length - 1
                ? [new TextRun(line), new TextRun({ break: 1 })]
                : [new TextRun(line)]
            ),
            spacing: { after: 200 }
          }),
        ],
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  return blob;
}
