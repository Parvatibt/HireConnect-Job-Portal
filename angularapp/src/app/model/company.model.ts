// src/app/model/company.model.ts

/**
 * Company model used across the frontend.
 * Fields are optional to match typical backend responses and allow partial updates.
 */
export interface Company {
  id?: number;

  /** Required-ish on create */
  name: string;

  /** Short one-line summary or tagline */
  description?: string | null;

  /** Longer rich text about the company */
  about?: string | null;

  /** Location / HQ (e.g. "Bangalore, India") */
  location?: string | null;

  /** Industry or category (e.g. "Fintech", "Healthcare") */
  industry?: string | null;

  /** Company website URL */
  website?: string | null;

  /** Public logo URL (served by backend) */
  logoUrl?: string | null;

  /** Contact email for company (used in admin/recruiter flows) */
  email?: string | null;

  /** Contact phone number */
  phone?: string | null;

  /** Year founded (e.g. 1998) */
  founded?: number | null;

  /** Company size label (e.g. "51-200 employees") */
  size?: string | null;

  /** Social links */
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  twitterUrl?: string | null;

  /** Administrative flags */
  verified?: boolean;

  /** Timestamps (ISO strings) */
  createdAt?: string | null;
  updatedAt?: string | null;

  /**
   * Misc / extension map — allow backend to return extra fields
   * without breaking frontend typing.
   */
  [key: string]: any;
}
