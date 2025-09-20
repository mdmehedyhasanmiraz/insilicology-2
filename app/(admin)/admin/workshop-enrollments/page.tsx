'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Users, GraduationCap, Calendar, Search, Download, Eye, Plus, X, Mail, Phone, MapPin, University, GraduationCap as GraduationCapIcon, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface WorkshopEnrollment {
  id: string;
  created_at: string;
  user: {
    id: string;
    email: string;
    name?: string;
    whatsapp?: string;
    gender?: string;
    district?: string;
    university?: string;
    department?: string;
    academic_year?: string;
    academic_session?: string;
  };
  workshop: {
    id: string;
    title: string;
    start_time?: string;
    end_time?: string;
    price_regular?: number;
    description?: string;
    speaker_name?: string;
    category?: string;
  };
}

export default function WorkshopEnrollmentsPage() {
  const supabase = createClientComponentClient();
  const [enrollments, setEnrollments] = useState<WorkshopEnrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<WorkshopEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('all');
  const [workshops, setWorkshops] = useState<{ id: string; title: string }[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<WorkshopEnrollment | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchEnrollments();
    fetchWorkshops();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const { data, error } = await supabase
        .from('user_workshops')
        .select(`
          id,
          created_at,
          user:user_id(
            id,
            email,
            name,
            whatsapp,
            gender,
            district,
            university,
            department,
            academic_year,
            academic_session
          ),
          workshop:workshop_id(
            id,
            title,
            start_time,
            end_time,
            price_regular,
            description,
            speaker_name,
            category
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching enrollments:', error);
        return;
      }

      console.log('Fetched enrollments:', data);
      setEnrollments((data as unknown) as WorkshopEnrollment[] || []);
      setFilteredEnrollments((data as unknown) as WorkshopEnrollment[] || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('id, title')
        .order('title');

      if (!error && data) {
        console.log('Fetched workshops:', data);
        setWorkshops(data);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterEnrollments(query, selectedWorkshop);
  };

  const handleWorkshopFilter = (workshopId: string) => {
    setSelectedWorkshop(workshopId);
    filterEnrollments(searchQuery, workshopId);
  };

  const filterEnrollments = (query: string, workshopId: string) => {
    let filtered = enrollments;

    // Filter by search query
    if (query) {
      filtered = filtered.filter(enrollment =>
        enrollment.user.email?.toLowerCase().includes(query.toLowerCase()) ||
        enrollment.user.name?.toLowerCase().includes(query.toLowerCase()) ||
        enrollment.user.whatsapp?.includes(query) ||
        enrollment.workshop.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by workshop
    if (workshopId !== 'all') {
      filtered = filtered.filter(enrollment => enrollment.workshop.id === workshopId);
    }

    setFilteredEnrollments(filtered);
  };

  const handleRowClick = (enrollment: WorkshopEnrollment) => {
    setSelectedEnrollment(enrollment);
    setShowModal(true);
  };

  const exportToCSV = () => {
    const headers = ['User Email', 'User Name', 'WhatsApp', 'Workshop', 'Start Date', 'End Date', 'Price', 'Enrollment Date'];
    const csvData = filteredEnrollments.map(enrollment => [
      enrollment.user.email || '',
      enrollment.user.name || '',
      enrollment.user.whatsapp || '',
      enrollment.workshop.title,
      enrollment.workshop.start_time ? new Date(enrollment.workshop.start_time).toLocaleDateString('bn-BD') : '',
      enrollment.workshop.end_time ? new Date(enrollment.workshop.end_time).toLocaleDateString('bn-BD') : '',
      enrollment.workshop.price_regular || '',
      new Date(enrollment.created_at).toLocaleDateString('bn-BD')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `workshop-enrollments-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full max-w-md mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="w-8 h-8 text-yellow-600" />
            ওয়ার্কশপ এনরোলমেন্টস
          </h1>
          <p className="text-gray-600">
            সকল ওয়ার্কশপ এনরোলমেন্ট দেখুন এবং পরিচালনা করুন
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">মোট এনরোলমেন্ট</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">সক্রিয় ওয়ার্কশপ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(enrollments.map(e => e.workshop.id)).size}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
      </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">আজকের এনরোলমেন্ট</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => 
                    new Date(e.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-100">
          <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row lg:gap-4 lg:flex-wrap lg:items-center">
          {/* Search */}
            <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
                  placeholder="ইমেইল, নাম, ফোন বা ওয়ার্কশপ অনুসন্ধান করুন..."
              value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
              </div>
          </div>

          {/* Workshop Filter */}
            <div className="w-full lg:w-auto min-w-0">
          <select
            value={selectedWorkshop}
                onChange={(e) => handleWorkshopFilter(e.target.value)}
                className="w-full max-w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
          >
                <option value="all">সব ওয়ার্কশপ</option>
            {workshops.map((workshop) => (
              <option key={workshop.id} value={workshop.id}>
                {workshop.title}
              </option>
            ))}
          </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:gap-2">
              {/* New Enrollment Button */}
              <Link
                href="/admin/workshop-enrollments/new"
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                নতুন এনরোলমেন্ট
              </Link>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV ডাউনলোড
              </button>
            </div>
          </div>
        </div>

        {/* Filtered Statistics */}
        {(searchQuery || selectedWorkshop !== 'all') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Search className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-blue-900">
                ফিল্টার ফলাফল
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">ফিল্টারকৃত এনরোলমেন্ট</p>
                    <p className="text-2xl font-bold text-blue-900">{filteredEnrollments.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              {selectedWorkshop !== 'all' && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">নির্বাচিত ওয়ার্কশপ</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {workshops.find(w => w.id === selectedWorkshop)?.title || ''}
                      </p>
                    </div>
                    <GraduationCap className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}
              
              {searchQuery && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">অনুসন্ধান</p>
                      <p className="text-lg font-semibold text-blue-900">&quot;{searchQuery}&quot;</p>
                    </div>
                    <Search className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Filter Summary */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <Search className="w-3 h-3" />
                    অনুসন্ধান: {searchQuery}
                  </span>
                )}
                {selectedWorkshop !== 'all' && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <GraduationCap className="w-3 h-3" />
                    ওয়ার্কশপ: {workshops.find(w => w.id === selectedWorkshop)?.title || ''}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  <Users className="w-3 h-3" />
                  মোট: {filteredEnrollments.length} টি এনরোলমেন্ট
                </span>
        </div>
      </div>
            
            {/* Clear Filters Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedWorkshop('all');
                  setFilteredEnrollments(enrollments);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                সব ফিল্টার মুছুন
              </button>
            </div>
          </div>
        )}

      {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ইউজার
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ওয়ার্কশপ
                </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    তারিখ
                  </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  এনরোলমেন্ট তারিখ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  কার্যকলাপ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(enrollment)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user.name || 'নাম নেই'}
                        </div>
                        <div className="text-sm text-gray-500">{enrollment.user.email}</div>
                        {enrollment.user.whatsapp && (
                          <div className="text-sm text-gray-400">{enrollment.user.whatsapp}</div>
                        )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {enrollment.workshop.title}
                    </div>
                      {enrollment.workshop.start_time && (
                    <div className="text-sm text-gray-500">
                          {new Date(enrollment.workshop.start_time).toLocaleDateString('bn-BD')}
                    </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      {enrollment.workshop.start_time ? (
                        <div className="text-sm text-gray-900">
                          {new Date(enrollment.workshop.start_time).toLocaleDateString('bn-BD')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">নির্ধারিত নয়</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(enrollment.created_at).toLocaleDateString('bn-BD')}
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <div className="divide-y divide-gray-200">
              {filteredEnrollments.map((enrollment) => (
                <div 
                  key={enrollment.id} 
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(enrollment)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">
                        {enrollment.user.name || 'নাম নেই'}
                      </h3>
                      <p className="text-sm text-gray-500 mb-1">{enrollment.user.email}</p>
                      {enrollment.user.whatsapp && (
                        <p className="text-xs text-gray-400">{enrollment.user.whatsapp}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {new Date(enrollment.created_at).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {enrollment.workshop.title}
                    </h4>
                    {enrollment.workshop.start_time && (
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>📅 {new Date(enrollment.workshop.start_time).toLocaleDateString('bn-BD')}</p>
                        {enrollment.workshop.end_time && (
                          <p>⏰ {new Date(enrollment.workshop.start_time).toLocaleTimeString('bn-BD', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(enrollment.workshop.end_time).toLocaleTimeString('bn-BD', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</p>
                        )}
                        {enrollment.workshop.price_regular ? (
                          <p className="text-green-600 font-medium">💰 ৳{enrollment.workshop.price_regular}</p>
                        ) : (
                          <p className="text-green-600 font-medium">💰 ফ্রি</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>এনরোলমেন্ট: {new Date(enrollment.created_at).toLocaleDateString('bn-BD')}</span>
                    <button className="text-yellow-600 hover:text-yellow-900 transition-colors">
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Empty State */}
        {filteredEnrollments.length === 0 && (
          <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">কোনো এনরোলমেন্ট পাওয়া যায়নি</h3>
              <p className="text-gray-500">
                {searchQuery || selectedWorkshop !== 'all' 
                  ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো এনরোলমেন্ট নেই।' 
                  : 'এখনও কোনো ওয়ার্কশপ এনরোলমেন্ট করা হয়নি।'
                }
            </p>
          </div>
        )}
      </div>

        {/* Results Count */}
        <div className="mt-6 text-center text-gray-500">
          <p>{filteredEnrollments.length} টি এনরোলমেন্ট পাওয়া গেছে</p>
        </div>
      </div>

      {/* Enrollment Details Modal */}
      {showModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">এনরোলমেন্ট বিবরণ</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  ইউজার তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">নাম</p>
                    <p className="text-gray-900">{selectedEnrollment.user.name || 'নাম নেই'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">ইমেইল</p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedEnrollment.user.email}
                    </p>
                  </div>
                  {selectedEnrollment.user.whatsapp && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">WhatsApp</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {selectedEnrollment.user.whatsapp}
                      </p>
                    </div>
                  )}
                  {selectedEnrollment.user.gender && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">লিঙ্গ</p>
                      <p className="text-gray-900">{selectedEnrollment.user.gender}</p>
                    </div>
                  )}
                  {selectedEnrollment.user.district && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">জেলা</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {selectedEnrollment.user.district}
                      </p>
                    </div>
                  )}
                  {selectedEnrollment.user.university && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">বিশ্ববিদ্যালয়</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <University className="w-4 h-4 text-gray-400" />
                        {selectedEnrollment.user.university}
                      </p>
                    </div>
                  )}
                  {selectedEnrollment.user.department && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">বিভাগ</p>
                      <p className="text-gray-900">{selectedEnrollment.user.department}</p>
                    </div>
                  )}
                  {selectedEnrollment.user.academic_year && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">একাডেমিক বছর</p>
                      <p className="text-gray-900">{selectedEnrollment.user.academic_year}</p>
                    </div>
                  )}
                  {selectedEnrollment.user.academic_session && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">একাডেমিক সেশন</p>
                      <p className="text-gray-900">{selectedEnrollment.user.academic_session}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Workshop Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCapIcon className="w-5 h-5 text-blue-600" />
                  ওয়ার্কশপ তথ্য
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">শিরোনাম</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedEnrollment.workshop.title}</p>
                  </div>
                  {selectedEnrollment.workshop.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">বিবরণ</p>
                      <p className="text-gray-900">{selectedEnrollment.workshop.description}</p>
                    </div>
                  )}
                  {selectedEnrollment.workshop.speaker_name && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">স্পিকার</p>
                      <p className="text-gray-900">{selectedEnrollment.workshop.speaker_name}</p>
                    </div>
                  )}
                  {selectedEnrollment.workshop.category && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">বিভাগ</p>
                      <p className="text-gray-900">{selectedEnrollment.workshop.category}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEnrollment.workshop.start_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">শুরুর তারিখ</p>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(selectedEnrollment.workshop.start_time).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                    {selectedEnrollment.workshop.end_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">শেষের তারিখ</p>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(selectedEnrollment.workshop.end_time).toLocaleDateString('bn-BD')}
                        </p>
                      </div>
                    )}
                    {selectedEnrollment.workshop.start_time && selectedEnrollment.workshop.end_time && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">সময়</p>
                        <p className="text-gray-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(selectedEnrollment.workshop.start_time).toLocaleTimeString('bn-BD', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {new Date(selectedEnrollment.workshop.end_time).toLocaleTimeString('bn-BD', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-600">মূল্য</p>
                      <p className="text-gray-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        {selectedEnrollment.workshop.price_regular ? `৳${selectedEnrollment.workshop.price_regular}` : 'ফ্রি'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrollment Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  এনরোলমেন্ট তথ্য
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">এনরোলমেন্ট আইডি</p>
                    <p className="text-gray-900 font-mono text-sm">{selectedEnrollment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">এনরোলমেন্ট তারিখ</p>
                    <p className="text-gray-900">
                      {new Date(selectedEnrollment.created_at).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">এনরোলমেন্ট সময়</p>
                    <p className="text-gray-900">
                      {new Date(selectedEnrollment.created_at).toLocaleTimeString('bn-BD', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">এনরোলমেন্ট স্ট্যাটাস</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      সক্রিয়
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
