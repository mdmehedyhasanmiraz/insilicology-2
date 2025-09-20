'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Plus, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Workshop {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  price_regular: number;
}

interface EnrollmentForm {
  user_id: string;
  workshop_id: string;
}

export default function NewWorkshopEnrollmentPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [users, setUsers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EnrollmentForm>({
    user_id: '',
    workshop_id: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchUsers();
    fetchWorkshops();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name')
        .order('name')
        .order('email');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchWorkshops = async () => {
    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('id, title, start_time, end_time, price_regular')
        .eq('status', 'published')
        .order('title');

      if (error) {
        console.error('Error fetching workshops:', error);
        return;
      }

      setWorkshops(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.user_id) {
      newErrors.user_id = 'ইউজার নির্বাচন করুন';
    }

    if (!form.workshop_id) {
      newErrors.workshop_id = 'ওয়ার্কশপ নির্বাচন করুন';
    }

    // Check if enrollment already exists
    if (form.user_id && form.workshop_id) {
      const existingEnrollment = users.find(u => u.id === form.user_id) && 
                                workshops.find(w => w.id === form.workshop_id);
      if (existingEnrollment) {
        // Note: We'll check for duplicates in the backend
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // Check if enrollment already exists
      const { data: existingEnrollment } = await supabase
        .from('user_workshops')
        .select('id')
        .eq('user_id', form.user_id)
        .eq('workshop_id', form.workshop_id)
        .single();

      if (existingEnrollment) {
        setErrors({ general: 'এই ইউজার ইতিমধ্যে এই ওয়ার্কশপে এনরোল করা আছে' });
        setSaving(false);
        return;
      }

      // Create new enrollment
      const { error: insertError } = await supabase
        .from('user_workshops')
        .insert({
          user_id: form.user_id,
          workshop_id: form.workshop_id
        });

      if (insertError) {
        console.error('Error creating enrollment:', insertError);
        setErrors({ general: 'এনরোলমেন্ট তৈরি করতে সমস্যা হয়েছে' });
        setSaving(false);
        return;
      }

      // Success - redirect to enrollments list
      router.push('/admin/workshop-enrollments');
    } catch (error) {
      console.error('Error:', error);
      setErrors({ general: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof EnrollmentForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedUser = users.find(u => u.id === form.user_id);
  const selectedWorkshop = workshops.find(w => w.id === form.workshop_id);

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/workshop-enrollments"
              className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              ফিরে যান
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Plus className="w-8 h-8 text-yellow-600" />
            নতুন ওয়ার্কশপ এনরোলমেন্ট
          </h1>
          <p className="text-gray-600">
            নতুন ওয়ার্কশপ এনরোলমেন্ট ম্যানুয়ালি যোগ করুন
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ইউজার নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <select
                value={form.user_id}
                onChange={(e) => handleChange('user_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.user_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">ইউজার নির্বাচন করুন</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || 'নাম নেই'} ({user.email})
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="text-red-500 text-sm mt-1">{errors.user_id}</p>
              )}
            </div>

            {/* Workshop Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ওয়ার্কশপ নির্বাচন করুন <span className="text-red-500">*</span>
              </label>
              <select
                value={form.workshop_id}
                onChange={(e) => handleChange('workshop_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.workshop_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">ওয়ার্কশপ নির্বাচন করুন</option>
                {workshops.map((workshop) => (
                  <option key={workshop.id} value={workshop.id}>
                    {workshop.title} - {new Date(workshop.start_time).toLocaleDateString('bn-BD')}
                  </option>
                ))}
              </select>
              {errors.workshop_id && (
                <p className="text-red-500 text-sm mt-1">{errors.workshop_id}</p>
              )}
            </div>

            {/* Preview Section */}
            {(selectedUser || selectedWorkshop) && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-3">এনরোলমেন্ট বিবরণ</h3>
                
                {selectedUser && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">ইউজার:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser.name || 'নাম নেই'} ({selectedUser.email})
                    </p>
                  </div>
                )}
                
                {selectedWorkshop && (
                  <div>
                    <p className="text-sm text-gray-600">ওয়ার্কশপ:</p>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {selectedWorkshop.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      তারিখ: {new Date(selectedWorkshop.start_time).toLocaleDateString('bn-BD')} - {new Date(selectedWorkshop.end_time).toLocaleDateString('bn-BD')}
                    </p>
                    <p className="text-sm text-gray-600">
                      মূল্য: ৳{selectedWorkshop.price_regular}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'এনরোলমেন্ট তৈরি করুন'}
              </button>
              
              <Link
                href="/admin/workshop-enrollments"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                বাতিল করুন
              </Link>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 সহায়তা</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• শুধুমাত্র প্রকাশিত ওয়ার্কশপ নির্বাচন করা যাবে</li>
            <li>• একই ইউজার একই ওয়ার্কশপে একাধিকবার এনরোল করা যাবে না</li>
            <li>• এনরোলমেন্ট তৈরি করার পর ইউজার স্বয়ংক্রিয়ভাবে ওয়ার্কশপে যোগদান করবে</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
