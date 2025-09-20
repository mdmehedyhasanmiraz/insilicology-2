import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getJobBySlug } from '@/lib/supabase/publicJobUtils';

interface JobDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const job = await getJobBySlug(resolvedParams.slug);
  
  if (!job) {
    return {
      title: 'Job Not Found - Insilicology',
      description: 'The requested job position could not be found.',
    };
  }

  return {
    title: `${job.title} - Career Opportunities at Insilicology`,
    description: job.description.substring(0, 160) + '...',
    keywords: `career, jobs, ${job.title.toLowerCase()}, ${job.type}, ${job.location_type}, insilicology`,
  };
}

const JobDetailPage: React.FC<JobDetailPageProps> = async ({ params }) => {
  const resolvedParams = await params;
  const job = await getJobBySlug(resolvedParams.slug);

  if (!job) {
    notFound();
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-blue-100 text-blue-800';
      case 'internship':
        return 'bg-yellow-100 text-yellow-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'volunteer':
        return 'bg-amber-100 text-amber-800';
      case 'temporary':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationTypeColor = (locationType: string) => {
    switch (locationType) {
      case 'remote':
        return 'bg-blue-100 text-blue-800';
      case 'on-site':
        return 'bg-purple-100 text-purple-800';
      case 'hybrid':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isApplicationOpen = new Date(job.application_deadline) > new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-8">
            <Link
              href="/career"
              className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Positions
            </Link>
            
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
                {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLocationTypeColor(job.location_type)}`}>
                {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1).replace('-', ' ')}
              </span>
              {job.job_code && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {job.job_code}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              {job.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Posted {formatDate(job.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Deadline: {formatDate(job.application_deadline)}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">Application Status</h3>
                  <p className="text-amber-800">
                    {isApplicationOpen 
                      ? `Applications are open until ${formatDate(job.application_deadline)}`
                      : 'Applications are now closed for this position'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {isApplicationOpen ? (
              <Link
                href={`/career/${job.slug}/apply`}
                className="bg-amber-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-center"
              >
                Apply for This Position
              </Link>
            ) : (
              <button
                disabled
                className="bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold cursor-not-allowed"
              >
                Applications Closed
              </button>
            )}
            <Link
              href="/career"
              className="bg-white text-amber-600 px-8 py-4 rounded-lg font-semibold border-2 border-amber-600 hover:bg-amber-50 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-center"
            >
              View Other Positions
            </Link>
          </div>
        </div>
      </div>

      {/* Job Description */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
            <div className="prose prose-lg max-w-none text-gray-700">
              <div className="whitespace-pre-wrap">{job.description}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-amber-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Join Our Team?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            {isApplicationOpen 
              ? 'Submit your application today and take the first step towards an exciting career at Insilicology.'
              : 'While this position is currently closed, we\'re always looking for talented individuals. Check out our other openings or send us your resume for future opportunities.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isApplicationOpen ? (
              <Link
                href={`/career/${job.slug}/apply`}
                className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:ring-4 focus:ring-white/20 transition-all duration-200"
              >
                Apply Now
              </Link>
            ) : (
              <Link
                href="/career"
                className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:ring-4 focus:ring-white/20 transition-all duration-200"
              >
                View Other Positions
              </Link>
            )}
            <Link
              href="/contact"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold border-2 border-white hover:bg-white/10 focus:ring-4 focus:ring-white/20 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage; 