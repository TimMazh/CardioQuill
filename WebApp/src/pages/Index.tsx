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
import { PythonBackendInfo } from "@/components/PythonBackendInfo";
import { DoctorsLetter, ServerStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { checkServerStatus, startServer, uploadAndProcessPdf } from "@/api/mockBackend";
import { TransthoracicEchocardiographySection } from "@/components/TransthoracicEchocardiographySection";

const Index = () => {
  const { toast } = useToast();
  
  // Main state for doctors letter data
  const [doctorsLetter, setDoctorsLetter] = useState<DoctorsLetter>(() => {
    // Try to load saved state from sessionStorage
    const savedState = sessionStorage.getItem('doctorsLetterState');
    return savedState ? JSON.parse(savedState) : {};
  });
  
  // Application state
  const [appStatus, setAppStatus] = useState<string>("ready");
  const [serverStatus, setServerStatus] = useState<ServerStatus>({
    status: "checking",
  });
  const [ragEnabled, setRagEnabled] = useState(false);
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
    const status = await checkServerStatus();
    console.log("Server status:", status);
    if (status.status === "not-running") {
      setServerStatus({ status: "starting" });
      const startedStatus = await startServer();
      setServerStatus(startedStatus);
      return startedStatus.status === "running";

    }    
    setServerStatus(status);
    return status.status === "running";
  };

  useEffect(() => {
    checkAndStartServer();
  }, []); 

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
  };
  
  // Toggle RAG
  const handleToggleRAG = () => {
    setRagEnabled(!ragEnabled);
    toast({
      title: `RAG ${!ragEnabled ? "aktiviert" : "deaktiviert"}`,
      description: `Die RAG-Funktionalität wurde ${!ragEnabled ? "aktiviert" : "deaktiviert"}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">CardioVista - Medical Scribe</h1>
          <p className="text-muted-foreground">Medizinische Berichte und Kardiologische Analysen</p>
        </header>
        
        <Tabs defaultValue="master-data" onValueChange={handleTabChange}>
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger value="master-data">Stammdaten</TabsTrigger>
            <TabsTrigger value="intro">Einleitung</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnose</TabsTrigger>
            <TabsTrigger value="risk-factors">Kardiovaskuläre Risikofaktoren</TabsTrigger>
            <TabsTrigger value="secondary-diagnosis">Nebendiagnosen</TabsTrigger>
            <TabsTrigger value="recommended-procedure">Empfohlene Maßnahmen</TabsTrigger>
            <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
            <TabsTrigger value="previous-medication">Vormedikation</TabsTrigger>
            <TabsTrigger value="physical-examination">Körperliche Untersuchung</TabsTrigger>
            <TabsTrigger value="ecg-analysis">EKG-Auswertung</TabsTrigger>
            <TabsTrigger value="transthoracic-echocardiography">Echo</TabsTrigger>
            <TabsTrigger value="ergometry">Ergometrie</TabsTrigger>
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
                title="Empfohlene Maßnahmen" 
                field="recommendedProcedure" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Empfohlene Maßnahmen beschreiben..." 
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
                title="Vormedikation" 
                field="previousMedication" 
                doctorsLetter={doctorsLetter} 
                updateDoctorsLetter={updateDoctorsLetter} 
                placeholder="Vormedikation auflisten..." 
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
          </div>
        </Tabs>
        
        <ControlPanel 
          onGenerateReport={handleGenerateReport}
          onUploadPDF={() => handleUploadPDF()}
          onClearFields={handleClearFields}
          ragEnabled={ragEnabled}
          onToggleRAG={handleToggleRAG}
          appStatus={appStatus}
          serverStatus={serverStatus}
        />
        
        <UploadPDFDialog
          open={pdfDialogOpen}
          onOpenChange={setPdfDialogOpen}
          onUpload={handleUploadPDF}
        />
        
        {/* Query Panel for LLM Interaction */}
        <QueryPanel 
          ragEnabled={ragEnabled}
          onProcessingChange={(isProcessing) => {
            setAppStatus(isProcessing ? "processing" : "ready");
          }}
        />
        
        {/* Python Backend Information */}
        <PythonBackendInfo />
      </div>
    </div>
  );
};

export default Index;
