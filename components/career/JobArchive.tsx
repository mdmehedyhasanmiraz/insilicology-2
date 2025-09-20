'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Job } from '@/types/job.type';
import { Search, MapPin, Clock, Calendar, Briefcase } from 'lucide-react';

interface JobArchiveProps {
  jobs: Job[];
}

const JobArchive: React.FC<JobArchiveProps> = ({ jobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocationType, setSelectedLocationType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'title'>('newest');

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    const filtered = jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = selectedType === 'all' || job.type === selectedType;
      const matchesLocationType = selectedLocationType === 'all' || job.location_type === selectedLocationType;
      
      return matchesSearch && matchesType && matchesLocationType;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'deadline':
          return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, selectedType, selectedLocationType, sortBy]);

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

  const isApplicationOpen = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  const jobTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'other', label: 'Other' },
  ];

  const locationTypes = [
    { value: 'all', label: 'All Locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'on-site', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Open Positions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our current openings and find the perfect opportunity to join our team.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
              />
            </div>

            {/* Job Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Type Filter */}
            <div>
              <select
                value={selectedLocationType}
                onChange={(e) => setSelectedLocationType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
              >
                {locationTypes.map(location => (
                  <option key={location.value} value={location.value}>
                    {location.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'deadline' | 'title')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="deadline">Deadline Soon</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedJobs.length} of {jobs.length} positions
            </p>
          </div>
        </div>

        {/* Jobs Grid */}
        {filteredAndSortedJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No positions found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedType !== 'all' || selectedLocationType !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'We don\'t have any open positions at the moment, but we\'re always looking for talented individuals.'
              }
            </p>
            {(searchTerm || selectedType !== 'all' || selectedLocationType !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLocationType('all');
                }}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group"
              >
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isApplicationOpen(job.application_deadline) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isApplicationOpen(job.application_deadline) ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLocationTypeColor(job.location_type)}`}>
                      {job.location_type.charAt(0).toUpperCase() + job.location_type.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Deadline: {formatDate(job.application_deadline)}</span>
                  </div>
                  {job.job_code && (
                    <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                      Code: {job.job_code}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Action */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href={`/career/${job.slug}`}
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm group-hover:underline transition-colors"
                  >
                    View Details →
                  </Link>
                  {isApplicationOpen(job.application_deadline) && (
                    <Link
                      href={`/career/${job.slug}/apply`}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobArchive; 