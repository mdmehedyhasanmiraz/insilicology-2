export interface Job {
  id: string;
  title: string;
  description: string;
  type: 'full-time' | 'part-time' | 'internship' | 'volunteer' | 'contract' | 'temporary' | 'other';
  location_type: 'on-site' | 'remote' | 'hybrid';
  location?: string;
  application_deadline: string;
  is_published: boolean;
  job_code?: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  facebook_url?: string;
  date_of_birth: string;
  present_address_division: string;
  present_address_district: string;
  present_address_upazila: string;
  present_address_detail: string;
  permanent_address_division: string;
  permanent_address_district: string;
  permanent_address_upazila: string;
  permanent_address_detail: string;
  resume_url: string;
  cover_letter?: string;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  admin_notes?: string;
  created_at: string;
}

export interface JobWithApplicationCount extends Job {
  application_count?: number;
} 