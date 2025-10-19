// src/app/model/candidate.model.ts
export interface CandidateProfile {
  id?: number;
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  headline?: string;
  location?: string;
  pinCode?: string;
  skills?: string;
  resumeUrl?: string | null;
  resumeFilename?: string | null;
  profilePicture?: string | null;
  profileComplete?: boolean;
}
