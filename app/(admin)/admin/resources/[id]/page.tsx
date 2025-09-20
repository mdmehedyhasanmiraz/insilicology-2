'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Resource = {
  id: string;
  title: string;
  file_url: string;
  course_ids: string[] | null;
  workshop_ids: string[] | null;
};

type IdTitle = { id: string; title: string };

export default function AdminResourceEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState<boolean>(true);
  const [resource, setResource] = useState<Resource | null>(null);
  const [courses, setCourses] = useState<IdTitle[]>([]);
  const [workshops, setWorkshops] = useState<IdTitle[]>([]);

  const [form, setForm] = useState({
    title: '',
    file_url: '',
    course_ids: [] as string[],
    workshop_ids: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      const [r, c, w] = await Promise.all([
        supabase.from('resources').select('*').eq('id', id).single(),
        supabase.from('courses').select('id, title').order('title'),
        supabase.from('workshops').select('id, title').order('title'),
      ]);

      if (!r.error && r.data) {
        const res = r.data as Resource;
        setResource(res);
        setForm({
          title: res.title || '',
          file_url: res.file_url || '',
          course_ids: res.course_ids || [],
          workshop_ids: res.workshop_ids || [],
        });
      }
      setCourses(c.data || []);
      setWorkshops(w.data || []);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const toggleSelection = (list: 'course_ids' | 'workshop_ids', value: string) => {
    setForm((prev) => {
      const exists = prev[list].includes(value);
      const updated = exists ? prev[list].filter((x) => x !== value) : [...prev[list], value];
      return { ...prev, [list]: updated };
    });
  };

  const updateResource = async () => {
    const { error } = await supabase
      .from('resources')
      .update({
        title: form.title,
        file_url: form.file_url,
        course_ids: form.course_ids.length ? form.course_ids : null,
        workshop_ids: form.workshop_ids.length ? form.workshop_ids : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      alert('আপডেট ব্যর্থ হয়েছে');
      console.error(error.message);
    } else {
      alert('✅ সফলভাবে হালনাগাদ হয়েছে');
      router.push('/admin/resources');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🎯 রিসোর্স এডিট করুন</h1>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : !resource ? (
        <p>রিসোর্স পাওয়া যায়নি।</p>
      ) : (
        <div className="space-y-4 bg-white p-4 rounded shadow">
          {[{ label: 'টাইটেল', key: 'title' }, { label: 'ফাইল URL', key: 'file_url' }].map(({ label, key }) => (
            <div key={key}>
              <label className="block font-medium text-sm text-gray-700 mb-1">{label}</label>
              <input
                type="text"
                value={form[key as 'title' | 'file_url']}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">কোর্স নির্বাচন করুন</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto border rounded p-2">
              {courses.map((c) => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.course_ids.includes(c.id)}
                    onChange={() => toggleSelection('course_ids', c.id)}
                  />
                  <span>{c.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700 mb-1">ওয়ার্কশপ নির্বাচন করুন</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-auto border rounded p-2">
              {workshops.map((w) => (
                <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.workshop_ids.includes(w.id)}
                    onChange={() => toggleSelection('workshop_ids', w.id)}
                  />
                  <span>{w.title}</span>
                </label>
              ))}
            </div>
          </div>

          <button onClick={updateResource} className="mt-2 bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
            সংরক্ষণ করুন
          </button>
        </div>
      )}
    </div>
  );
}
