import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPublishedJobs } from '@/lib/supabase/publicJobUtils';
import { Job } from '@/types/job.type';
import JobArchive from '@/components/career/JobArchive';

export const metadata: Metadata = {
  title: 'Career Opportunities at Insilicology - Join Our Team',
  description: 'Explore exciting career opportunities at Insilicology. Join our team as a Campus Ambassador and help shape the future of education technology.',
  keywords: 'career, jobs, opportunities, campus ambassador, Insilicology, education technology',
};

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

const CareerPage: React.FC = async () => {
  let jobs: Job[] = [];
  
  try {
    jobs = await getPublishedJobs();
  } catch (error) {
    console.error('Failed to fetch jobs, using empty array:', error);
    jobs = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join Our Team at{' '}
              <span className="text-amber-600">Insilicology</span>
            </h1>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              Help us revolutionize education technology and make quality learning accessible to everyone. 
              Join our mission to empower students with the skills they need for the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#open-positions"
                className="bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
              >
                View Open Positions
              </Link>
              <Link
                href="/contact"
                className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold border-2 border-amber-600 hover:bg-amber-50 focus:ring-4 focus:ring-amber-200 transition-all duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Open Positions Section */}
      <div id="open-positions">
        <JobArchive jobs={jobs} />
      </div>

      {/* Campus Ambassador Section */}
      <div className="py-16 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Become a Campus Ambassador
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our exclusive community of student leaders and help shape the future of education technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What You&apos;ll Do</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Represent Insilicology at your university and promote our courses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Organize events and workshops to help fellow students</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Build your professional network and leadership skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>Gain valuable experience in marketing and community building</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Benefits You&apos;ll Get</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">🎯</span>
                    </div>
                    <span className="text-sm text-gray-600">Leadership Development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">🌐</span>
                    </div>
                    <span className="text-sm text-gray-600">Network Building</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">📚</span>
                    </div>
                    <span className="text-sm text-gray-600">Free Course Access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 text-sm">🏆</span>
                    </div>
                    <span className="text-sm text-gray-600">Certificates & Recognition</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">Requirements</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li>• Currently enrolled in a university/college</li>
                  <li>• Strong communication and leadership skills</li>
                  <li>• Active on social media platforms</li>
                  <li>• Passionate about education and technology</li>
                  <li>• Must be male (as per current requirements)</li>
                </ul>
              </div>
            </div>

            {/* Application Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Join?</h3>
                <p className="text-gray-600">
                  Take the first step towards becoming a Campus Ambassador and start building your future.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">What&apos;s included:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Free access to all our premium courses</li>
                    <li>• Professional development opportunities</li>
                    <li>• Networking events and workshops</li>
                    <li>• Performance-based incentives</li>
                    <li>• Certificate upon completion</li>
                  </ul>
                </div>

                <Link
                  href="/career/campus-ambassador"
                  className="w-full bg-amber-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-amber-700 focus:ring-4 focus:ring-amber-200 transition-all duration-200 text-center block"
                >
                  Apply Now
                </Link>

                <p className="text-xs text-gray-500 text-center">
                  Application takes 5-10 minutes to complete
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-amber-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don&apos;t See the Right Fit?
          </h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            We&apos;re always looking for talented individuals to join our team. Send us your resume and we&apos;ll keep you in mind for future opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-amber-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 focus:ring-4 focus:ring-white/20 transition-all duration-200"
            >
              Send Your Resume
            </Link>
            <Link
              href="/contact"
              className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold border-2 border-white hover:bg-white/10 focus:ring-4 focus:ring-white/20 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Why Work With Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Work With Insilicology?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join a team that&apos;s passionate about education and technology, where your work makes a real impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Make an Impact</h3>
              <p className="text-gray-600">
                Help thousands of students gain valuable skills and advance their careers through our platform.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Learn & Grow</h3>
              <p className="text-gray-600">
                Access to our premium courses and continuous learning opportunities to develop your skills.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Our Community</h3>
              <p className="text-gray-600">
                Be part of a vibrant community of educators, students, and technology enthusiasts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerPage; 