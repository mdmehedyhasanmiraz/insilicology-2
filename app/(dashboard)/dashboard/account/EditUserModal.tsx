'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Pencil, X, User, GraduationCap, Building, Calendar, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import districtsData from '@/data/bd-geo/bd-districts.json';
import { PublicUser } from '@/types/users.type';

export default function EditUserModal({ user, onUserUpdate }: { user: PublicUser; onUserUpdate: (updatedUser: PublicUser) => void }) {
  const supabase = createClientComponentClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    gender: user?.gender || '',
    district: user?.district || '',
    whatsapp: user?.whatsapp || '',
    university: user?.university || '',
    department: user?.department || '',
    academic_year: user?.academic_year || '',
    academic_session: user?.academic_session || '',
  });  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData({
        name: user?.name || '',
        gender: user?.gender || '',
        district: user?.district || '',
        whatsapp: user?.whatsapp || '',
        university: user?.university || '',
        department: user?.department || '',
        academic_year: user?.academic_year || '',
        academic_session: user?.academic_session || '',
      });
    }
  }, [open, user]);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from('users')
      .update({
        name: formData.name,
        gender: formData.gender,
        district: formData.district,
        whatsapp: formData.whatsapp,
        university: formData.university,
        department: formData.department,
        academic_year: formData.academic_year,
        academic_session: formData.academic_session,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error('Update failed. Please try again.');
    } else {
      toast.success('Profile updated successfully!');
      setOpen(false);
      // Update the parent component state instead of reloading
      if (data) {
        onUserUpdate(data);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors duration-200 border border-purple-200 hover:border-purple-300"
      >
        <Pencil size={16} />
        Edit
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Pencil className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">তথ্য সম্পাদনা করুন</h2>
                  <p className="text-sm text-gray-600">আপনার ব্যক্তিগত এবং একাডেমিক তথ্য আপডেট করুন</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">ব্যক্তিগত তথ্য</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">পূর্ণ নাম</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="আপনার পূর্ণ নাম লিখুন"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">লিঙ্গ</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">লিঙ্গ নির্বাচন করুন</option>
                      <option value="Male">পুরুষ</option>
                      <option value="Female">মহিলা</option>
                      <option value="Other">অন্যান্য</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">জেলা</label>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">আপনার জেলা নির্বাচন করুন</option>
                      {districtsData.districts.map((district) => (
                        <option key={district.id} value={district.name}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp নম্বর</label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="০১৮৪২২২১৮৭২"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Details Section */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">একাডেমিক তথ্য</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিশ্ববিদ্যালয়</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="আপনার বিশ্ববিদ্যালয়ের নাম"
                      />
                      <Building className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">বিভাগ</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="আপনার বিভাগের নাম"
                      />
                      <BookOpen className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">একাডেমিক বছর</label>
                    <div className="relative">
                      <select
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">বছর নির্বাচন করুন</option>
                        <option value="1st Year">১ম বছর</option>
                        <option value="2nd Year">২য় বছর</option>
                        <option value="3rd Year">৩য় বছর</option>
                        <option value="4th Year">৪র্থ বছর</option>
                        <option value="5th Year">৫ম বছর</option>
                        <option value="Masters">মাস্টার্স</option>
                        <option value="PhD">পিএইচডি</option>
                        <option value="Other">অন্যান্য</option>
                      </select>
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">একাডেমিক সেশন</label>
                    <div className="relative">
                      <select
                        name="academic_session"
                        value={formData.academic_session}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">সেশন নির্বাচন করুন</option>
                        <option value="2020-21">২০২০-২১</option>
                        <option value="2021-22">২০২১-২২</option>
                        <option value="2022-23">২০২২-২৩</option>
                        <option value="2023-24">২০২৩-২৪</option>
                        <option value="2024-25">২০২৪-২৫</option>
                        <option value="2025-26">২০২৫-২৬</option>
                        <option value="Other">অন্যান্য</option>
                      </select>
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                >
                  বাতিল করুন
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  {loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তনগুলি সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
