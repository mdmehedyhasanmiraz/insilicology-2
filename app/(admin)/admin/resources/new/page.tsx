'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

interface Course { id: string; title: string; }
interface Workshop { id: string; title: string; }

interface ResourceForm {
  title: string;
  file_url: string;
  course_ids: string[];
  workshop_ids: string[];
}

interface SavedResource {
  id: string;
  title: string;
  file_url: string;
  course_ids: string[] | null;
  workshop_ids: string[] | null;
  created_at?: string;
  updated_at?: string;
}

export default function AdminResourcesPage() {
  const supabase = createClientComponentClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [resources, setResources] = useState<SavedResource[]>([]);
  const [form, setForm] = useState<ResourceForm>({
    title: '',
    file_url: '',
    course_ids: [],
    workshop_ids: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const [c, w, r] = await Promise.all([
        supabase.from('courses').select('id, title').order('title'),
        supabase.from('workshops').select('id, title').order('title'),
        supabase.from('resources').select('*').order('created_at', { ascending: false }),
      ]);

      setCourses(c.data || []);
      setWorkshops(w.data || []);
      setResources(r.data || []);
    };

    loadData();
  }, []);

  const toggleSelection = (list: 'course_ids' | 'workshop_ids', id: string) => {
    setForm((prev) => {
      const exists = prev[list].includes(id);
      const updated = exists ? prev[list].filter((x) => x !== id) : [...prev[list], id];
      return { ...prev, [list]: updated };
    });
  };

  const addResource = async () => {
    if (!form.title || !form.file_url) {
      toast.error('টাইটেল ও ফাইল লিংক প্রয়োজন');
      return;
    }

    const { error } = await supabase.from('resources').insert({
      title: form.title,
      file_url: form.file_url,
      course_ids: form.course_ids.length ? form.course_ids : null,
      workshop_ids: form.workshop_ids.length ? form.workshop_ids : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast.error('রিসোর্স যোগ করতে সমস্যা হয়েছে!');
      console.error(error);
    } else {
      toast.success('রিসোর্স সফলভাবে যোগ হয়েছে!');
      setForm({ title: '', file_url: '', course_ids: [], workshop_ids: [] });

      const { data: updated } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });
      setResources(updated || []);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">রিসোর্স যোগ করুন</h1>

      <div className="space-y-4 bg-white p-4 rounded shadow">
        {[{ label: 'টাইটেল', key: 'title' }, { label: 'ফাইল লিংক', key: 'file_url' }].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input
              type="text"
              value={form[key as keyof Pick<ResourceForm, 'title' | 'file_url'>] as string}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium mb-1">কোর্স নির্বাচন করুন</label>
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
          <label className="block text-sm font-medium mb-1">ওয়ার্কশপ নির্বাচন করুন</label>
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

        <button onClick={addResource} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          রিসোর্স সংরক্ষণ করুন
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-4">📦 সংরক্ষিত রিসোর্স সমূহ</h2>
      <ul className="space-y-3">
        {resources.map((r) => (
          <li key={r.id} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded shadow-sm">
            <span>{r.title}</span>
            <a href={r.file_url} download target="_blank" className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
              ডাউনলোড
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
