/**
 * Represents a user review or feedback entry.
 * Used in ReviewFormComponent and ReviewService.
 */
export interface Review {
  id?: number |null;                 // Database ID (auto-generated)
  name: string;                // Reviewer name
  designation?: string;        // Optional job title / company
  message: string;             // Feedback text
  
}
