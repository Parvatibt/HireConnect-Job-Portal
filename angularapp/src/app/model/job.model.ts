// src/app/model/job.model.ts
export interface CompanyInfo {
  id?: number;
  name?: string;
  description?: string;
  size?: string | number;
  location?: string;
  founded?: number | string;
}

export interface UserInfo {
  id?: number;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  // add other user/recruiter fields you need
}

export interface Job {
  id?: number;
  title?: string;
  location?: string;
  description?: string;
  shortDescription?: string;

  minExp?: number | null;
  maxExp?: number | null;
  minSalary?: number | null;
  maxSalary?: number | null;

  responsibilities?: string[];

  // Nested company if you need richer structure
  company?: CompanyInfo | null;

  // Convenience: top-level companyName matches backend DTO
  companyName?: string | null;

  employmentType?: string;
  postedAt?: string;

  skills?: string[];
  qualifications?: string[];

  // optional fields
  category?: string;

  // new fields added to match your test and typical domain model:
  isActive?: boolean;    // whether job posting is active
  postedBy?: UserInfo | null; // user/recruiter who posted the job
}
