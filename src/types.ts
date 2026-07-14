export interface PICOSCriteria {
  title: string;
  population: string;
  intervention: string;
  comparator: string;
  outcomes: string;
  studyDesigns: string; // e.g. RCT, Cohort, etc.
  languageRestrictions: string;
  publicationStatus: string;
}

export interface Paper {
  id: string;
  citation: string; // e.g., "Uman 2011"
  title: string;
  authors: string;
  year: string;
  journal: string;
  abstract: string;
  sourceText?: string; // Optional full full-text or block of text for extraction
  screeningStatus: "unscreened" | "eligible" | "excluded" | "needs_full_text";
  screeningReason: string;
  extractionData?: ExtractionData;
  qualityAssessment?: RiskOfBias;
  referencesCited?: string[];
}

export interface ExtractionData {
  sampleSize: string;
  ageRange: string;
  demographics: string;
  interventionDetails: string;
  comparatorDetails: string;
  keyOutcomesReported: string;
  conclusions: string;
  citationReference: string; // APA/Cochrane citation
}

export interface RiskOfBiasItem {
  domain: string; // e.g., "Random sequence generation", "Allocation concealment", etc.
  judgment: "Low risk" | "High risk" | "Unclear risk";
  supportForJudgment: string;
}

export interface RiskOfBias {
  toolUsed: "Cochrane RoB 2.0" | "QUADAS-2" | "Custom Checklist";
  items: RiskOfBiasItem[];
  overallComments: string;
}

export interface PRISMACounts {
  recordsIdentified: number;
  recordsRemovedDuplicates: number;
  recordsScreened: number;
  recordsExcluded: number;
  reportsSoughtForRetrieval: number;
  reportsNotRetrieved: number;
  reportsAssessedForEligibility: number;
  reportsExcludedNearMisses: number;
  studiesIncluded: number;
}
