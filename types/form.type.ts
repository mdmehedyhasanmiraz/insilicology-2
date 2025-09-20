export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  replied_at?: string;
  ip_address?: string;
  user_agent?: string;
  source: string;
  page_url?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactSubmissionResponse {
  statusCode: number;
  statusMessage: string;
  data?: {
    id: string;
    submitted_at: string;
  };
}

export interface CampusAmbassadorFormData {
  full_name: string;
  email: string;
  phone_number: string;
  university_name: string;
  department_name: string;
  current_year: number;
  course_duration: number;
  why_join: string;
  linkedin_url: string;
  facebook_url: string;
}