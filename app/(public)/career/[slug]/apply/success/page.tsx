'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const SuccessPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState('');

  useEffect(() => {
    // Validate the token with enhanced security
    const token = searchParams.get('token');
    const storedToken = sessionStorage.getItem('job_application_success_token');
    const storedTimestamp = sessionStorage.getItem('job_application_success_timestamp');
    const storedJobTitle = sessionStorage.getItem('job_application_job_title');

    if (!token || !storedToken || !storedTimestamp) {
      // Missing token or timestamp, redirect to home
      router.replace('/');
      return;
    }

    // Check if token matches
    if (token !== storedToken) {
      router.replace('/');
      return;
    }

    // Check if token is not expired (5 minutes)
    const currentTime = Date.now();
    const tokenTime = parseInt(storedTimestamp);
    const timeDiff = currentTime - tokenTime;
    const maxAge = 5 * 60 * 1000; // 5 minutes in milliseconds

    if (timeDiff > maxAge) {
      // Token expired, redirect to home
      sessionStorage.removeItem('job_application_success_token');
      sessionStorage.removeItem('job_application_success_timestamp');
      sessionStorage.removeItem('job_application_job_title');
      router.replace('/');
      return;
    }

    // Set job title if available
    if (storedJobTitle) {
      setJobTitle(storedJobTitle);
    }

    // Valid token, allow access
    setIsValid(true);
    setIsLoading(false);

    // Clean up the tokens from sessionStorage after a delay
    setTimeout(() => {
      sessionStorage.removeItem('job_application_success_token');
      sessionStorage.removeItem('job_application_success_timestamp');
      sessionStorage.removeItem('job_application_job_title');
    }, 10000); // Remove after 10 seconds
  }, [searchParams, router]);

  // Show loading while validating
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not valid (will redirect)
  if (!isValid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Message */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-500 mb-4">
            Application Submitted Successfully!
          </h1>
          <p className="text-gray-600 mb-2">
            Thank you for applying for the {jobTitle && <span className="font-semibold">{jobTitle}</span>} position.
          </p>
          <p className="text-gray-600">
            We&apos;ve sent you a confirmation email with further instructions. Please contact us if you haven&apos;t received it.
          </p>
        </div>

        {/* Facebook Follow Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Follow us to get updates
            </h2>
            <p className="text-gray-600 mb-6">
              Follow our Facebook page to get updates about your application status, new job openings, and career opportunities!
            </p>
          </div>

          {/* Facebook Button */}
          <a
            href="https://www.facebook.com/insilicology"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 transform hover:scale-105 mb-4"
          >
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Follow on Facebook
          </a>

          <p className="text-sm text-gray-500">
            Get instant notifications about application updates and new job opportunities
          </p>
        </div>

        {/* What's Next Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 mb-8">
          {/* What's Next */}
          <div className="bg-amber-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-amber-900 mb-3">What&apos;s Next?</h2>
            <ul className="text-left text-amber-800 space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">✓</span>
                We&apos;ll review your application and resume
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">✓</span>
                Shortlisted candidates will be contacted for an interview
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">✓</span>
                Selected candidates will receive an offer letter
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/career"
            className="bg-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
          >
            View More Jobs
          </Link>
          <Link
            href="/"
            className="bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200"
          >
            Back to Home
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Have questions? Contact us at{' '}
            <a href="mailto:insilicology@gmail.com" className="text-amber-600 hover:text-amber-700">
              insilicology@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const CareerApplicationSuccess: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
};

export default CareerApplicationSuccess; 