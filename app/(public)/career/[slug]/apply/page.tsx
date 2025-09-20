'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJobBySlug } from '@/lib/supabase/clientJobUtils';
import { uploadResume } from '@/lib/supabase/clientJobUtils';
import { submitJobApplicationAction } from './actions';
import { testServerAction } from './test-actions';
import { Job } from '@/types/job.type';
import { getDivisions, getDistrictsByDivision, getUpazilasByDistrict, type Division, type District, type Upazila } from '@/utils/bdGeoData';

interface ApplyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ params }) => {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    linkedin_url: '',
    facebook_url: '',
    date_of_birth: '',
    present_address_division: '',
    present_address_district: '',
    present_address_upazila: '',
    present_address_detail: '',
    permanent_address_division: '',
    permanent_address_district: '',
    permanent_address_upazila: '',
    permanent_address_detail: '',
    cover_letter: ''
  });

  // Geographic data state
  const [divisions] = useState<Division[]>(getDivisions());
  const [presentDistricts, setPresentDistricts] = useState<District[]>([]);
  const [presentUpazilas, setPresentUpazilas] = useState<Upazila[]>([]);
  const [permanentDistricts, setPermanentDistricts] = useState<District[]>([]);
  const [permanentUpazilas, setPermanentUpazilas] = useState<Upazila[]>([]);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve params
  React.useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  // Load job data
  React.useEffect(() => {
    if (!resolvedParams) return;
    
    const loadJob = async () => {
      try {
        const jobData = await getJobBySlug(resolvedParams.slug);
        if (!jobData) {
          router.push('/career');
          return;
        }
        
        // Check if application deadline has passed
        if (new Date(jobData.application_deadline) < new Date()) {
          router.push(`/career/${resolvedParams.slug}`);
          return;
        }
        
        setJob(jobData);
      } catch (err) {
        console.error('Error loading job details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [resolvedParams, router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Handle cascading dropdowns for present address
    if (name === 'present_address_division') {
      const districts = getDistrictsByDivision(value);
      setPresentDistricts(districts);
      setFormData(prev => ({
        ...prev,
        present_address_district: '',
        present_address_upazila: ''
      }));
      setPresentUpazilas([]);
    }

    if (name === 'present_address_district') {
      const upazilas = getUpazilasByDistrict(value);
      setPresentUpazilas(upazilas);
      setFormData(prev => ({
        ...prev,
        present_address_upazila: ''
      }));
    }

    // Handle cascading dropdowns for permanent address
    if (name === 'permanent_address_division') {
      const districts = getDistrictsByDivision(value);
      setPermanentDistricts(districts);
      setFormData(prev => ({
        ...prev,
        permanent_address_district: '',
        permanent_address_upazila: ''
      }));
      setPermanentUpazilas([]);
    }

    if (name === 'permanent_address_district') {
      const upazilas = getUpazilasByDistrict(value);
      setPermanentUpazilas(upazilas);
      setFormData(prev => ({
        ...prev,
        permanent_address_upazila: ''
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    const maxSize = 1 * 1024 * 1024; // 1MB

    if (!allowedTypes.includes(file.type)) {
      setFieldErrors({ resume: 'Please select a PDF, DOCX, or DOC file' });
      return;
    }

    if (file.size > maxSize) {
      setFieldErrors({ resume: 'File size must be less than 1MB' });
      return;
    }

    setResumeFile(file);
    // Clear resume error when valid file is selected
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.resume;
      return newErrors;
    });
  }, []);

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Upload resume
  const uploadResumeFile = async () => {
    if (!resumeFile) return '';

    setUploading(true);
    try {
      console.log('Starting resume upload...');
      const result = await uploadResume(resumeFile);
      console.log('Upload result:', result);
      
      if (result.success && result.url) {
        console.log('Resume uploaded successfully:', result.url);
        return result.url;
      } else {
        console.error('Upload failed:', result.error);
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Error in uploadResumeFile:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;

    // Clear previous errors
    setFieldErrors({});
    setSubmissionError('');

    // Validate required fields
    const requiredFields = [
      { field: 'full_name', label: 'Full Name' },
      { field: 'email', label: 'Email Address' },
      { field: 'phone', label: 'Phone Number' },
      { field: 'date_of_birth', label: 'Date of Birth' },
      { field: 'linkedin_url', label: 'LinkedIn Profile' },
      { field: 'present_address_division', label: 'Present Address Division' },
      { field: 'present_address_district', label: 'Present Address District' },
      { field: 'present_address_upazila', label: 'Present Address Upazila' },
      { field: 'present_address_detail', label: 'Present Address Detail' },
      { field: 'permanent_address_division', label: 'Permanent Address Division' },
      { field: 'permanent_address_district', label: 'Permanent Address District' },
      { field: 'permanent_address_upazila', label: 'Permanent Address Upazila' },
      { field: 'permanent_address_detail', label: 'Permanent Address Detail' }
    ];

    const newFieldErrors: Record<string, string> = {};
    const missingFields = requiredFields.filter(({ field }) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      missingFields.forEach(({ field, label }) => {
        newFieldErrors[field] = `${label} is required`;
      });
      setFieldErrors(newFieldErrors);
      return;
    }

    // Check if resume file is selected
    if (!resumeFile) {
      setFieldErrors({ resume: 'Please select a resume file to upload.' });
      return;
    }

    setSubmitting(true);

    try {
      // Upload resume first and get the URL
      const uploadedResumeUrl = await uploadResumeFile();
      
      if (!uploadedResumeUrl) {
        setSubmissionError('Failed to upload resume. Please try again.');
        setSubmitting(false);
        return;
      }
      
      // Submit application
      const applicationData = {
        job_id: job.id,
        resume_url: uploadedResumeUrl,
        ...formData,
        phone: `+88${formData.phone}` // Prepend country code to phone number
      };

      console.log('Submitting application with data:', applicationData);
      console.log('Calling server action...');
      
      // Test the server action connection first
      try {
        const testResult = await testServerAction({ test: true });
        console.log('Test server action result:', testResult);
      } catch (testError) {
        console.error('Test server action failed:', testError);
        throw new Error('Server connection failed. Please try again.');
      }
      
      let result;
      try {
        result = await submitJobApplicationAction(applicationData, job.title);
        console.log('Server action result:', result);
      } catch (serverActionError) {
        console.error('Server action error:', serverActionError);
        throw new Error('Failed to submit application. Please try again.');
      }
      
      if (result.success) {
        // Generate a secure token with timestamp
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const token = `${timestamp}-${randomPart}`;
        
        // Store the token in sessionStorage with timestamp for validation
        sessionStorage.setItem('job_application_success_token', token);
        sessionStorage.setItem('job_application_success_timestamp', timestamp.toString());
        sessionStorage.setItem('job_application_job_title', job.title);
        
        // Redirect to success page with token
        router.push(`/career/${job.slug}/apply/success?token=${token}`);
      } else {
        setSubmissionError(result.error || 'Failed to submit application');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      if (err instanceof Error) {
        setSubmissionError(err.message);
      } else {
        setSubmissionError('An error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render until params are resolved
  if (!resolvedParams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/career/${job.slug}`}
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Job Details
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply for {job.title}
          </h1>
          <p className="text-gray-600">
            Please fill out the form below to submit your application.
          </p>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-2 md:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-8">

            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors ${
                      fieldErrors.full_name ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.full_name && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.full_name}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="gender"
                    name="gender"
                    value="Must be Male"
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors ${
                      fieldErrors.email ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">+88</span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors ${
                        fieldErrors.phone ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter phone number without country code (e.g., 01XXXXXXXXX)</p>
                  {fieldErrors.phone && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    required
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors ${
                      fieldErrors.date_of_birth ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.date_of_birth && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.date_of_birth}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    required
                    value={formData.linkedin_url}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/your-profile"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors ${
                      fieldErrors.linkedin_url ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : 'border-gray-300'
                    }`}
                  />
                  {fieldErrors.linkedin_url && (
                    <p className="text-red-600 text-sm mt-1">{fieldErrors.linkedin_url}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-700 mb-2">
                    Facebook Profile
                  </label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/your-profile"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Present Address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Present Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="present_address_division" className="block text-sm font-medium text-gray-700 mb-2">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="present_address_division"
                    name="present_address_division"
                    required
                    value={formData.present_address_division}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="present_address_district" className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="present_address_district"
                    name="present_address_district"
                    required
                    value={formData.present_address_district}
                    onChange={handleInputChange}
                    disabled={!formData.present_address_division}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select District</option>
                    {presentDistricts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="present_address_upazila" className="block text-sm font-medium text-gray-700 mb-2">
                    Upazila <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="present_address_upazila"
                    name="present_address_upazila"
                    required
                    value={formData.present_address_upazila}
                    onChange={handleInputChange}
                    disabled={!formData.present_address_district}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select Upazila</option>
                    {presentUpazilas.map((upazila) => (
                      <option key={upazila.id} value={upazila.id}>
                        {upazila.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="present_address_detail" className="block text-sm font-medium text-gray-700 mb-2">
                    House/Street/Road <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="present_address_detail"
                    name="present_address_detail"
                    required
                    rows={3}
                    value={formData.present_address_detail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Permanent Address */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Permanent Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="permanent_address_division" className="block text-sm font-medium text-gray-700 mb-2">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="permanent_address_division"
                    name="permanent_address_division"
                    required
                    value={formData.permanent_address_division}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="permanent_address_district" className="block text-sm font-medium text-gray-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="permanent_address_district"
                    name="permanent_address_district"
                    required
                    value={formData.permanent_address_district}
                    onChange={handleInputChange}
                    disabled={!formData.permanent_address_division}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select District</option>
                    {permanentDistricts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div> 
                  <label htmlFor="permanent_address_upazila" className="block text-sm font-medium text-gray-700 mb-2">
                    Upazila <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="permanent_address_upazila"
                    name="permanent_address_upazila"
                    required
                    value={formData.permanent_address_upazila}
                    onChange={handleInputChange}
                    disabled={!formData.permanent_address_district}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select Upazila</option>
                    {permanentUpazilas.map((upazila) => (
                      <option key={upazila.id} value={upazila.id}>
                        {upazila.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="permanent_address_detail" className="block text-sm font-medium text-gray-700 mb-2">
                    House/Street/Road <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="permanent_address_detail"
                    name="permanent_address_detail"
                    required
                    rows={3}
                    value={formData.permanent_address_detail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Resume/CV Upload <span className="text-red-500">*</span></h2>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  dragActive 
                    ? 'border-amber-400 bg-amber-50' 
                    : resumeFile 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-300 hover:border-amber-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !resumeFile && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {resumeFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">{resumeFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the file input
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drop your resume here, or click to browse
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PDF, DOCX, or DOC files up to 1MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {uploading && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600 mr-3"></div>
                  <span className="text-gray-600">Uploading resume...</span>
                </div>
              )}
              {fieldErrors.resume && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-800">{fieldErrors.resume}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Cover Letter (Optional)</h2>
              <textarea
                id="cover_letter"
                name="cover_letter"
                rows={6}
                value={formData.cover_letter}
                onChange={handleInputChange}
                placeholder="Tell us why you're interested in this position and why you'd be a great fit..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting Application...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
              
              <Link
                href={`/career/${job.slug}`}
                className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold border-2 border-amber-600 hover:bg-amber-50 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-center"
              >
                Cancel
              </Link>
            </div>

            {/* Submission Error */}
            {submissionError && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-800">{submissionError}</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage; 