export interface Candidate {
  id: string;
  name: string;
  currentRole: string;
  score: number | null;
  recommendation: string;
  mustHavesMet: number;
  mustHavesTotal: number;
  topStrengths: string[];
  keyConcerns: string[];
  interviewPriority: string;
  cvText: string;
  reportPath: string | null;
  evaluatedAt: string | null;
  status: string;
}

export interface RoleConfig {
  title: string;
  department: string;
  team: string;
  seniority: string;
  location: string;
  locationType: string;
  mustHave: string[];
  niceToHave: string[];
  compBand: string;
  jdText: string;
}

export interface EvaluationReport {
  candidateId: string;
  candidateName: string;
  score: number;
  recommendation: string;
  blocks: {
    snapshot: string;
    requirementsMatch: string;
    experienceDepth: string;
    technicalFit: string;
    cultureFit: string;
    hiringRec: string;
  };
  interviewQuestions: string[];
  machineSummary: Record<string, unknown>;
}
