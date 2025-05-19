import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasterDataSection } from "@/components/MasterDataSection";
import { TextSection } from "@/components/TextSection"; 
import { ECGAnalysisSection } from "@/components/ECGAnalysisSection";
import { ErgometrySection } from "@/components/ErgometrySection";
import { IntroSection } from "@/components/IntroSection";
import { PhysicalExaminationSection } from "@/components/PhysicalExaminationSection";
import { ControlPanel } from "@/components/ControlPanel";
import { UploadPDFDialog } from "@/components/UploadPDFDialog";
import { QueryPanel } from "@/components/QueryPanel";
import { DoctorsLetter, ServerStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { checkServerStatus, startServer, uploadAndProcessPdf } from "@/api/mockBackend";
import { TransthoracicEchocardiographySection } from "@/components/TransthoracicEchocardiographySection";
import { saveAs } from "file-saver";
import { generateWordDocument } from "@/lib/wordExportUtil";
import CardioQuillLogo from "@/lib/CardioQuillLogo.png";

const Index = () => {
  const { toast } = useToast();
  
  // Main state for doctors letter data
  const [doctorsLetter, setDoctorsLetter] = useState<DoctorsLetter>(() => {
    // Try to load saved state from sessionStorage
    const savedState = sessionStorage.getItem('doctorsLetterState');
    if (savedState) return JSON.parse(savedState);
    return {
      patientDateOfBirth: "",
      patientControlDate: ""
    };
  });
  
  // Application state
  const [appStatus, setAppStatus] = useState<string>("ready");
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: "checking",
  });
  const [ragEnabled, setRagEnabled] = useState(true);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);

  // Update doctors letter data
  const updateDoctorsLetter = (data: Partial<DoctorsLetter>) => {
    setDoctorsLetter(prev => ({ ...prev, ...data }));
  };
  
  // Save state to sessionStorage whenever doctorsLetter changes
  useEffect(() => {
    sessionStorage.setItem('doctorsLetterState', JSON.stringify(doctorsLetter));
  }, [doctorsLetter]);
  
  // Handle tab change (optional, can be removed if not needed)
  const handleTabChange = (value: string) => {
    // This is a placeholder. You can add specific logic if needed.
    console.log(`Tab changed to: ${value}`);
  };

  // Check server status and start it if needed
  const checkAndStartServer = async () => {
    setServerStatus({ status: "checking" });
    setAppStatus("checking");
    const status = await checkServerStatus();
    console.log("Server status:", status);
    if (status.status === "not-running") {
      setServerStatus({ status: "starting" });
      setAppStatus("not-ready");
      const startedStatus = await startServer();

      setServerStatus(startedStatus);
      // Nach dem Start erneut prüfen, ob der Server wirklich läuft
      const confirmedStatus = await checkServerStatus();
      if (confirmedStatus.status === "running") {
        setAppStatus("ready");
      }
      setServerStatus(confirmedStatus);
      return confirmedStatus.status === "running";
    }
    setServerStatus(status);
    setAppStatus("ready");
    return status.status === "running";
  };

  useEffect(() => {
    checkAndStartServer();
  }, []); 

  // Word-Export
  const [isExporting, setIsExporting] = useState(false);
  const handleWordExport = async () => {
    setAppStatus("processing");
    setIsExporting(true);
    try {
      const blob = await generateWordDocument(doctorsLetter);
      saveAs(blob, `Bericht_${doctorsLetter.patientLastName || "Patient"}.docx`);
    } finally {
      setAppStatus("ready");
      setIsExporting(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    setAppStatus("processing");

    const serverReady = await checkAndStartServer();
    if (!serverReady) {
      toast({
        title: "Serverfehler",
        description: "Der Server konnte nicht gestartet werden.",
        variant: "destructive",
      });
      setAppStatus("error");
      return;
    }
    
    // Simulate report generation
    setTimeout(() => {
      const reportText = Object.values(doctorsLetter).filter(Boolean).join("\n\n");
      
      if (reportText.length < 10) {
        toast({
          title: "Unvollständige Daten",
          description: "Bitte füllen Sie mehr Felder aus, um einen Bericht zu generieren.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Bericht generiert",
          description: "Der Bericht wurde erfolgreich generiert.",
        });
      }
      
      setAppStatus("ready");
    }, 2000);
  };
  
  // Upload PDF
  const handleUploadPDF = async (file?: File) => {
    if (!file) {
      setPdfDialogOpen(true);
      return;
    }
    setAppStatus("processing");
    const success = await uploadAndProcessPdf(file);
    if (!success) {
      toast({
        title: "PDF-Verarbeitung fehlgeschlagen",
        description: `Die Datei "${file.name}" konnte nicht verarbeitet werden.`,
        variant: "destructive",
      });
    }
    setAppStatus("ready");
    setPdfDialogOpen(false);
    
  };
  
  // Clear all fields
  const handleClearFields = () => {
    setDoctorsLetter({});
    
    toast({
      title: "Felder gelöscht",
      description: "Alle Felder wurden zurückgesetzt.",
    });
    window.location.reload();
  };
  
  // Toggle RAG
  const handleToggleRAG = () => {
    setRagEnabled(!ragEnabled);
    toast({
      title: `Beispielverwendung ${!ragEnabled ? "aktiviert" : "deaktiviert"}`,
      description: `${!ragEnabled ? "Es werden Beispiele von Zusammenfassungen als Inspiration für das Generieren verwendet" : "Es werden keine Beispiele von Zusammenfassungen als Inspiration für das Generieren verwendet"}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8">
        <header className="mb-8">

          
          

          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-4">
            <img src={CardioQuillLogo} alt="CardioQuill Logo" className="w-24 h-auto mb-0" />
            CardioQuill
          </h1>
          <p className="text-muted-foreground">Kardiologische Berichterstattung</p>
          <ControlPanel 
            onUploadPDF={handleUploadPDF}
            onClearFields={handleClearFields}
            ragEnabled={ragEnabled}
            onToggleRAG={handleToggleRAG}
            appStatus={appStatus}
            serverStatus={serverStatus}
            onWordExport={handleWordExport}
            isExporting={isExporting}
          />
        
          <UploadPDFDialog
            open={pdfDialogOpen}
            onOpenChange={setPdfDialogOpen}
            onUpload={handleUploadPDF}
          />
        </header>
        
        
        <Tabs defaultValue="master-data" onValueChange={handleTabChange}>
          <TabsList className="mb-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {/* Patientendaten */}
            <TabsTrigger value="master-data">Stammdaten</TabsTrigger>
            <TabsTrigger value="intro">Einleitung</TabsTrigger>
            {/* Diagnostik */}
            <TabsTrigger value="diagnosis">Diagnosen</TabsTrigger>
            <TabsTrigger value="risk-factors">Kardiovaskuläre Risikofaktoren</TabsTrigger>
            <TabsTrigger value="secondary-diagnosis">Nebendiagnosen</TabsTrigger>
            <TabsTrigger value="recommended-procedure">Empfohlenes Procedere</TabsTrigger>
            <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
            <TabsTrigger value="previous-medication">Bisherige Medikation</TabsTrigger>
            {/* Untersuchungen */}
            <TabsTrigger value="physical-examination">Körperliche Untersuchung</TabsTrigger>
            <TabsTrigger value="ecg-analysis">12-Kanal-Ruhe-EKG / Rhythmusstreifen</TabsTrigger>
            <TabsTrigger value="transthoracic-echocardiography">Transthorakale Echokardiographie</TabsTrigger>
            <TabsTrigger value="ergometry">Ergometrie</TabsTrigger>
            <TabsTrigger value="lz-ekg">6d- / 24-h-LZ-EKG</TabsTrigger>
            <TabsTrigger value="ct-koronarangiographie">CT-Koronarangiographie</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4">
            <TabsContent value="master-data">
              <MasterDataSection 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
              />
            </TabsContent>
            
            <TabsContent value="intro">
              <IntroSection 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
              />
            </TabsContent>
            
            <TabsContent value="diagnosis">
              <TextSection 
                title="Diagnose" 
                field="diagnosis" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Diagnose beschreiben..." 
              />
            </TabsContent>

            <TabsContent value="risk-factors">
              <TextSection 
                title="Kardiovaskuläre Risikofaktoren" 
                field="cardiovascularRiskFactors" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Risikofaktoren auflisten..." 
              />
            </TabsContent>
            
            <TabsContent value="secondary-diagnosis">
              <TextSection 
                title="Nebendiagnosen" 
                field="secondaryDiagnosis" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Nebendiagnosen auflisten..." 
              />
            </TabsContent>
            
            <TabsContent value="recommended-procedure">
              <TextSection 
                title="Empfohlenes Procedere" 
                field="recommendedProcedure" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Empfohlenes Procedere beschreiben..." 
              />
            </TabsContent>
            
            <TabsContent value="anamnesis">
              <TextSection 
                title="Anamnese" 
                field="anamnesis" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Anamnese beschreiben..." 
              />
            </TabsContent>
            
            <TabsContent value="previous-medication">
              <TextSection 
                title="Bisherige Medikation" 
                field="previousMedication" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Bisherige Medikation auflisten..." 
              />
            </TabsContent>
            
            <TabsContent value="physical-examination">
              <PhysicalExaminationSection
                doctorsLetter={doctorsLetter}
                updateDoctorsLetter={updateDoctorsLetter}
              />
            </TabsContent>
            
            <TabsContent value="ecg-analysis">
              <ECGAnalysisSection 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
              />
            </TabsContent>
            
            <TabsContent value="transthoracic-echocardiography">
              <TransthoracicEchocardiographySection
                doctorsLetter={doctorsLetter}
                updateDoctorsLetter={updateDoctorsLetter}
              />
            </TabsContent>

            <TabsContent value="ergometry">
              <ErgometrySection
                doctorsLetter={doctorsLetter}
                updateDoctorsLetter={updateDoctorsLetter}
              />
            </TabsContent>
            <TabsContent value="lz-ekg">
              <TextSection
                title="6d- / 24-h-LZ-EKG"
                field="lzEkg"
                doctorsLetter={doctorsLetter}
                updateDoctorsLetter={updateDoctorsLetter}
                placeholder="6d- / 24-h-LZ-EKG-Befund eintragen..."
              />
            </TabsContent>

            <TabsContent value="ct-koronarangiographie">
              <TextSection
                title="CT-Koronarangiographie"
                field="ctKoronarangiographie"
                doctorsLetter={doctorsLetter}
                updateDoctorsLetter={updateDoctorsLetter}
                placeholder="CT-Koronarangiographie-Befund eintragen..."
              />
            </TabsContent>

          </div>
        </Tabs>
        
        
      
        {/* Query Panel for LLM Interaction */}
        <QueryPanel 
          ragEnabled={ragEnabled}
          onProcessingChange={(isProcessing) => {
            setAppStatus(isProcessing ? "processing" : "ready");
          }}
        />

        
      </div>
    </div>
  );
};

export default Index;
