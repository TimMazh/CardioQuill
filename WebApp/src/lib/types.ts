
// Type definitions for the CardioVista application

export interface DoctorsLetter {
  
  // Intro Section
  greeting?: string;
  
  // Master Data
  patientFirstName?: string;
  patientLastName?: string;
  patientGender?: string;
  patientDateOfBirth?: string;
  patientAddress?: string;
  patientControlDate?: string;
  doctorTitle?: string;
  doctorGender?: string;
  doctorFirstName?: string;
  doctorLastName?: string;
  doctorClinic?: string;
  doctorAddress?: string;
  
  // Medical Data
  introText?: string;
  diagnosis?: string;
  cardiovascularRiskFactors?: string;
  secondaryDiagnosis?: string;
  recommendedProcedure?: string;
  lzEkg?: string;
  ctKoronarangiographie?: string;
  anamnesis?: string;
  previousMedication?: string;
  physicalExamination?: string;
  ecgAnalysis?: string;
  transthoracicEchocardiography?: string;
  ergometry?: string;

  mode?: string;
  
  // Physical Examination Data
  az?: string;
  ez?: string;

  height?: string;
  weight?: string;
  bmi?: string;
  
  bpLeftSys?: string;
  bpLeftDia?: string;
  bpRightSys?: string;
  bpRightDia?: string;
  hasBPSideDifference?: boolean;
  
  heartRhythm?: string;
  heartRhythmDetails?: string;
  
  heartPathology?: string;
  hasHeartPathology?: boolean;
  
  lungDetails?: string;
  hasLungAbnormality?: boolean;
  
  hasGoodPulse?: boolean;
  pulseStatus?: string;

  hasFlowNoise?: boolean;
  flowNoiseDetails?: string;

  edemaDetails?: string;
  hasEdema?: boolean;
  
  pulse?: string;


  // ECG Analysis Data
  sinusRate?: string;
  lagetyp?: string;
  pq?: string;
  qrs?: string;
  qtc?: string;
  hasPathologicalQ?: boolean;
  qWaveLeads?: string[];
  hasSTChanges?: boolean;
  stChangesText?: string;
  hasRProgression?: boolean;
  rProgressionText?: string;
  rhythmContinuity?: string;
  rhythmContinuityText?: string;
  rhythmFrequency?: string;
  extrasystole?: string;
  extrasystoleFrequency?: string;
  extrasystoleTypes?: string[];

  // Transthoracic Echocardiography Data
  isLvNormal?: boolean;
  lvText?: string;
  ivsd?: string;
  lvedd?: string;
  lvpwd?: string;
  lvMassIndex?: string;
  rwt?: string;
  isLvSysNormal?: boolean;
  lvSysText?: string;
  lvef?: string;
  glStrain?: string;
  isRvNormal?: boolean;
  rvText?: string;
  rvBasal?: string;
  isRvSysNormal?: boolean;
  rvSysText?: string;
  tapse?: string;
  aortenanulus?: string;
  aortensinus?: string;
  aortaAsc?: string;
  vmax?: string;
  dpMax?: string;
  dpMean?: string;
  isAtriaNormal?: boolean;
  atriaText?: string;
  lavi?: string;
  ravi?: string;
  hasRelaxationDisorder?: boolean;
  relaxationText?: string;
  ee?: string;
  hasValvePathology?: boolean;
  mitralValve?: string;
  tricuspidValve?: string;
  pulmonalValve?: string;
  aorticValve?: string;
  hasPulmPressure?: boolean;
  pulmPressureText?: string;
  hasPericardEffusion?: boolean;
  pericardEffusionText?: string;
  hasPleuralEffusion?: boolean;
  pleuralEffusionText?: string;

  // Ergometry Data
  cancellingReason?: string;
  shouldWatt?: string;
  shouldHF?: string;
  isBdRegular?: boolean;
  bdText?: string;
  isHfRegular?: boolean;
  hfText?: string;
  hasPektanginoesComplaints?: boolean;
  pektanginoesComplaintsWatt?: string;
  hasDesaturation?: boolean;
  desaturationText?: string;
  hasDyspnoe?: boolean;
  dyspnoeWatt?: string;
  hasRhythmDisturbance?: boolean;
  rhythmDisturbanceText?: string;
  hasStChangesErgo?: boolean;
  stLeadsErgo?: string[];
  
}

export interface ServerStatus {
  status: 'running' | 'not-running' | 'starting' | 'checking' | 'error';
  message?: string;
}

export interface SSHResponse {
  output: string;
  error: string;
}
