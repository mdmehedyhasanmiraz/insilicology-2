import React from 'react';
import Link from 'next/link';
import { CareerPosition } from '@/data/careerPositions';

interface CareerPositionCardProps {
  position: CareerPosition;
}

const CareerPositionCard: React.FC<CareerPositionCardProps> = ({ position }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time':
        return 'bg-green-100 text-green-800';
      case 'Part-time':
        return 'bg-blue-100 text-blue-800';
      case 'Internship':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contract':
        return 'bg-orange-100 text-orange-800';
      case 'Volunteer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-900">{position.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(position.type)}`}>
              {position.type}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {position.location}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {position.department}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Posted {new Date(position.postedDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="mt-4 lg:mt-0">
          <Link
            href={position.applyLink}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
          >
            Apply Now
          </Link>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{position.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
          <ul className="space-y-1">
            {position.requirements.map((req, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                {req}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
          <ul className="space-y-1">
            {position.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="text-green-600 mr-2 mt-1">✓</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CareerPositionCard; 