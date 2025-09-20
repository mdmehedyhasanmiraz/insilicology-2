'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminUserEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    gender: '',
    district: '',
    whatsapp: '',
    role: 'student', // default role
    university: '',
    department: '',
    academic_year: '',
    academic_session: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error(error || 'User not found');
        return;
      }

      setForm({
        name: data.name || '',
        email: data.email || '',
        gender: data.gender || '',
        district: data.district || '',
        whatsapp: data.whatsapp || '',
        role: data.role || 'student',
        university: data.university || '',
        department: data.department || '',
        academic_year: data.academic_year || '',
        academic_session: data.academic_session || '',
      });

      setLoading(false);
    };

    fetchUser();
  }, []);

  const updateUser = async () => {
    const { error } = await supabase
      .from('users')
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      alert('🛑 ইউজার আপডেট ব্যর্থ হয়েছে');
      console.error(error);
    } else {
      alert('✅ ইউজার সফলভাবে আপডেট হয়েছে');
      router.push('/admin/users');
    }
  };

  const inputStyle =
    'w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">ইউজার তথ্য সম্পাদনা করুন</h1>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : (
        <div className="space-y-5">
          {[
            { label: 'নাম', key: 'name' },
            { label: 'ইমেইল', key: 'email' },
            { label: 'লিঙ্গ', key: 'gender' },
            { label: 'জেলা', key: 'district' },
            { label: 'WhatsApp', key: 'whatsapp' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={inputStyle}
              />
            </div>
          ))}

          {/* Academic Fields */}
          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">একাডেমিক তথ্য</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিশ্ববিদ্যালয়/কলেজ</label>
                <input
                  type="text"
                  value={form.university}
                  onChange={(e) => setForm({ ...form, university: e.target.value })}
                  className={inputStyle}
                  placeholder="বিশবিদ্যালয়ের নাম"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">বিভাগ/ফ্যাকাল্টি</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className={inputStyle}
                  placeholder="বিভাগের নাম"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষাবর্ষ</label>
                <select
                  value={form.academic_year}
                  onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                  className={inputStyle}
                >
                  <option value="">শিক্ষাবর্ষ নির্বাচন করুন</option>
                  <option value="1st year">১ম বর্ষ</option>
                  <option value="2nd year">২য় বর্ষ</option>
                  <option value="3rd year">৩য় বর্ষ</option>
                  <option value="4th year">৪র্থ বর্ষ</option>
                  <option value="5th year">৫ম বর্ষ</option>
                  <option value="Masters">মাস্টার্স</option>
                  <option value="PhD">পিএইচডি</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">শিক্ষা সেশন</label>
                <select
                  value={form.academic_session}
                  onChange={(e) => setForm({ ...form, academic_session: e.target.value })}
                  className={inputStyle}
                >
                  <option value="">শিক্ষা সেশন নির্বাচন করুন</option>
                  <option value="2023-24">২০২৩-২৪</option>
                  <option value="2024-25">২০২৪-২৫</option>
                  <option value="2025-26">২০২৫-২৬</option>
                  <option value="2026-27">২০২৬-২৭</option>
                  <option value="Other">অন্যান্য</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">রোল</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputStyle}
            >
              <option value="student">👨‍🎓 Student</option>
              <option value="admin">🛡️ Admin</option>
            </select>
          </div>

          <button
            onClick={updateUser}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
          >
            আপডেট করুন
          </button>
        </div>
      )}
    </div>
  );
}
