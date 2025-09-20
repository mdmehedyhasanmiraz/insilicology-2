import React from 'react';
import Link from 'next/link';
import { Job } from '@/types/job.type';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  const isApplicationOpen = new Date(job.application_deadline) > new Date();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(job.type)}`}>
              {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLocationTypeColor(job.location_type)}`}>
              {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1).replace('-', ' ')}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            {job.location && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Posted {formatDate(job.created_at)}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Deadline: {formatDate(job.application_deadline)}
            </div>
            {job.job_code && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {job.job_code}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 lg:mt-0">
          {isApplicationOpen ? (
            <Link
              href={`/career/${job.slug}`}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
            >
              View Details
            </Link>
          ) : (
            <span className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
              Closed
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isApplicationOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isApplicationOpen ? 'Applications Open' : 'Applications Closed'}
        </span>
        <Link
          href={`/career/${job.slug}`}
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Read more →
        </Link>
      </div>
    </div>
  );
};

export default JobCard; 