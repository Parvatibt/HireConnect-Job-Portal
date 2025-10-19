// src/app/model/application.model.ts
export interface Application {
  // Backend DTO fields (server expects these names)
  jobId?: number;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  resumeFilename?: string;

  // Template-friendly aliases
  name?: string;   // maps -> candidateName
  email?: string;  // maps -> candidateEmail
  phone?: string;  // maps -> candidatePhone
  resume?: string; // maps -> resumeFilename
}
