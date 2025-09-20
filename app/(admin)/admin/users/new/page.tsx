'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CreateUserPage() {
  const supabase = createClientComponentClient();

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    gender: '',
    district: '',
    whatsapp: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const createUser = async () => {
    setLoading(true);

    const { error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
      user_metadata: {
        display_name: form.name,
      },
    });

    if (error) {
      alert('ব্যবহারকারী তৈরি ব্যর্থ হয়েছে!');
      console.error(error);
    } else {
      alert('ব্যবহারকারী সফলভাবে তৈরি হয়েছে!');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">নতুন ইউজার তৈরি করুন</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingInput label="ইমেইল" name="email" value={form.email} onChange={handleChange} />
        <FloatingInput
          label="পাসওয়ার্ড"
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
        />
        <FloatingInput label="নাম" name="name" value={form.name} onChange={handleChange} />
        <SelectInput label="লিঙ্গ" name="gender" value={form.gender} onChange={handleChange} options={['পুরুষ', 'নারী', 'অন্যান্য']} />
        <FloatingInput label="জেলা" name="district" value={form.district} onChange={handleChange} />
        <FloatingInput label="WhatsApp" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
      </div>

      <button
        onClick={createUser}
        disabled={loading}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow transition disabled:opacity-50"
      >
        {loading ? 'তৈরি হচ্ছে...' : 'ইউজার তৈরি করুন'}
      </button>
    </div>
  );
}

function FloatingInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="relative w-full">
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder=" "
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400"
      >
        {label}
      </label>
    </div>
  );
}

function SelectInput({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div className="relative w-full">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="peer w-full border border-gray-300 rounded px-3 pt-5 pb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">-- সিলেক্ট করুন --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-sm text-gray-500"
      >
        {label}
      </label>
    </div>
  );
}
