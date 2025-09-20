'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { CampusAmbassadorFormData } from '@/types/form.type';
import { useRouter } from 'next/navigation';
import { submitCampusAmbassadorApplication } from '@/app/(public)/career/campus-ambassador/actions';

const initialForm: CampusAmbassadorFormData = {
  full_name: '',
  email: '',
  phone_number: '',
  university_name: '',
  department_name: '',
  current_year: 1,
  course_duration: 4,
  why_join: '',
  linkedin_url: '',
  facebook_url: '',
};

const CampusAmbassadorReg: React.FC = () => {
  const [form, setForm] = useState<CampusAmbassadorFormData>(initialForm);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    // Check file size (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      return 'File size must be less than 1MB';
    }
    
    // Check file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return 'Please upload a PDF, DOC, or DOCX file';
    }
    
    return null;
  };

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const uploadFileToStorage = async (file: File, email: string): Promise<string | null> => {
    const supabase = createClient();
    
    // Create a unique filename using email and timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${email.replace('@', '_at_')}_${timestamp}.${fileExtension}`;
    
    const { error } = await supabase.storage
      .from('cv_uploads')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('cv_uploads')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let fileUrl: string | null = null;
      
      // Only upload file if one is selected
      if (selectedFile) {
        fileUrl = await uploadFileToStorage(selectedFile, form.email);
        
        if (!fileUrl) {
          setError('Failed to upload CV file. Please try again.');
          setSubmitting(false);
          return;
        }
      }
      
      // Call the server action that handles database insertion and email sending
      await submitCampusAmbassadorApplication(form, fileUrl);
      
      // If we reach here, the action was successful
      // Generate a secure token with timestamp
      const timestamp = Date.now();
      const randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const token = `${timestamp}-${randomPart}`;
      
      // Store the token in sessionStorage with timestamp for validation
      sessionStorage.setItem('campus_ambassador_success_token', token);
      sessionStorage.setItem('campus_ambassador_success_timestamp', timestamp.toString());
      
      // Redirect to success page with token
      router.push(`/career/campus-ambassador/success?token=${token}`);
      
    } catch (err) {
      console.error('Submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      default:
        return '📎';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 md:p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Campus Ambassador Application</h1>
          <p className="text-gray-600">Become a Campus Ambassador. Enhance your skills and network with real-world projects.</p>
        </div>

				<div className="mb-6">
					<label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
					<input 
						name="full_name" 
						value={form.full_name} 
						onChange={handleChange} 
						required 
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
						placeholder="Enter your full name"
					/>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-semibold text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
          <p className="text-sm text-gray-500 mb-2">Must be Male</p>
				</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
            <input 
              name="email" 
              type="email" 
              value={form.email} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number (WhatsApp) <span className="text-red-500">*</span></label>
            <input 
              name="phone_number" 
              value={form.phone_number} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="+880 1XXX XXX XXX"
            />
          </div>
        </div>

				<div className="mb-6">
					<label className="block text-sm font-semibold text-gray-700 mb-2">University/College Name <span className="text-red-500">*</span></label>
					<input 
						name="university_name" 
						value={form.university_name} 
						onChange={handleChange} 
						required 
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
						placeholder="Your university name"
					/>
				</div>

				<div className="mb-6">
					<label className="block text-sm font-semibold text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
					<input 
						name="department_name" 
						value={form.department_name} 
						onChange={handleChange} 
						required 
						className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
						placeholder="e.g., Computer Science"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Year <span className="text-red-500">*</span></label>
            <select 
              name="current_year" 
              value={form.current_year} 
              onChange={handleChange} 
              required 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
            >
              <option value={1}>1st Year</option>
              <option value={2}>2nd Year</option>
              <option value={3}>3rd Year</option>
              <option value={4}>4th Year</option>
              <option value={5}>5th Year</option>
            </select>
          </div>

					<div>
						<label className="block text-sm font-semibold text-gray-700 mb-2">Course Duration <span className="text-red-500">*</span></label>
						<select 
							name="course_duration" 
							value={form.course_duration} 
							onChange={handleChange} 
							required 
							className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-white"
						>
							<option value={4}>4 Years</option>
							<option value={5}>5 Years</option>
						</select>
					</div>
				</div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn Profile (Optional)</label>
          <input 
            name="linkedin_url" 
            value={form.linkedin_url} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Facebook Profile Link <span className="text-red-500">*</span></label>
          <input 
            name="facebook_url" 
            value={form.facebook_url} 
            onChange={handleChange} 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="https://facebook.com/yourprofile"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want to join our Campus Ambassador Program? <span className="text-red-500">*</span></label>
          <textarea 
            name="why_join" 
            value={form.why_join} 
            onChange={handleChange} 
            required
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            placeholder="Tell us about your motivation, relevant experience, and what you hope to achieve as a Campus Ambassador..."
          />
        </div>

				<div className="mb-6">
					<label className="block text-sm font-semibold text-gray-700 mb-2">CV (Optional)</label>
					<p className="text-gray-500 text-sm mb-3">Please upload your CV file (PDF, DOC, or DOCX). Max file size: 1 MB.</p>
					
					{/* Modern Drag & Drop Area */}
					<div
						className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
							isDragOver 
								? 'border-purple-500 bg-purple-50 scale-105' 
								: selectedFile 
									? 'border-green-500 bg-green-50' 
									: 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
						}`}
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onDragEnter={handleDragEnter}
						onClick={() => fileInputRef.current?.click()}
					>
						{selectedFile ? (
							<div className="space-y-3">
								<div className="text-4xl mb-2">{getFileIcon(selectedFile.name)}</div>
								<div className="space-y-1">
									<p className="font-medium text-gray-900">{selectedFile.name}</p>
									<p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
								</div>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setSelectedFile(null);
										if (fileInputRef.current) fileInputRef.current.value = '';
									}}
									className="text-sm text-red-600 hover:text-red-700 font-medium"
								>
									Remove file
								</button>
							</div>
						) : (
							<div className="space-y-3">
								<div className="text-4xl mb-2">
									{isDragOver ? '📁' : '📎'}
								</div>
								<div className="space-y-1">
									<p className="font-medium text-gray-900">
										{isDragOver ? 'Drop your CV here' : 'Drag & drop your CV here'}
									</p>
									<p className="text-sm text-gray-500">
										{isDragOver ? 'Release to upload' : 'or click to browse files'}
									</p>
								</div>
								<div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
									<span>PDF, DOC, DOCX</span>
									<span>•</span>
									<span>Max 1MB</span>
								</div>
							</div>
						)}
						
						{/* Hidden file input */}
						<input
							ref={fileInputRef}
							type="file"
							accept=".pdf,.doc,.docx"
							onChange={handleFileChange}
							className="hidden"
						/>
					</div>
				</div>

        <button 
          type="submit" 
          disabled={submitting} 
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform"
        >
          {submitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Submitting...
            </div>
          ) : (
            'Submit Application'
          )}
        </button>
					
        {/* Error message */}
        {error && (
          <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <span className="mr-1">⚠️</span>
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default CampusAmbassadorReg; 