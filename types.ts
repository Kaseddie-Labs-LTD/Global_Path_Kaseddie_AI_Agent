export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  region: 'GCC' | 'EUROPE';
  description: string;
  fullDescription?: string;
  salaryHint: string;
  postDate: string;
  site: 'bayt' | 'naukri' | 'indeed' | 'google';
  type: 'blue-collar' | 'professional';
  subCategory: string;
  imageUrl?: string;
  isVerified?: boolean;
  contactInfo?: {
    recruiter: string;
    email: string;
    phone: string;
  };
}

export interface JobAlert {
  id: string;
  email: string;
  searchTerm: string;
  region: Region;
  type: 'ALL' | 'blue-collar' | 'professional';
}

export interface VerificationResult {
  valid: boolean;
  confidence: number;
  issues: string[];
  extractedData?: {
    name?: string;
    expiry?: string;
    documentType?: string;
  };
}

export interface VerificationStep {
  label: string;
  status: 'pending' | 'verifying' | 'completed' | 'failed';
  result?: VerificationResult;
}

export type Region = 'GCC' | 'EUROPE' | 'ALL';
