'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

type Resource = {
  id: string;
  title: string;
  file_url: string;
  course_ids: string[] | null;
  workshop_ids: string[] | null;
};

type IdTitle = { id: string; title: string };

export default function AdminResourcesListPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, string>>({});
  const [workshopMap, setWorkshopMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('id, title, file_url, course_ids, workshop_ids')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('রিসোর্স লোড করতে সমস্যা:', error.message);
        toast.error('রিসোর্স লোড করতে সমস্যা হয়েছে!');
        setLoading(false);
        return;
      }

      const res = (data as unknown as Resource[]) || [];
      setResources(res);

      // Collect unique course/workshop ids
      const courseIds = Array.from(
        new Set(res.flatMap((r) => r.course_ids || []))
      );
      const workshopIds = Array.from(
        new Set(res.flatMap((r) => r.workshop_ids || []))
      );

      const [coursesResp, workshopsResp] = await Promise.all([
        courseIds.length
          ? supabase.from('courses').select('id, title').in('id', courseIds)
          : Promise.resolve({ data: [] as IdTitle[] }),
        workshopIds.length
          ? supabase.from('workshops').select('id, title').in('id', workshopIds)
          : Promise.resolve({ data: [] as IdTitle[] }),
      ]);

      const cMap: Record<string, string> = {};
      (coursesResp.data as IdTitle[] | null)?.forEach((c) => (cMap[c.id] = c.title));
      const wMap: Record<string, string> = {};
      (workshopsResp.data as IdTitle[] | null)?.forEach((w) => (wMap[w.id] = w.title));
      setCourseMap(cMap);
      setWorkshopMap(wMap);

      setLoading(false);
    };

    fetchResources();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎓 রিসোর্স তালিকা</h1>
        <button onClick={() => router.push('/admin/resources/new')} className="bg-black cursor-pointer text-white px-4 py-2 rounded hover:bg-gray-800 transition">রিসোর্স যোগ করুন</button>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : resources.length === 0 ? (
        <p>🙁 কোনো রিসোর্স পাওয়া যায়নি।</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="py-2 px-4 border-b">টাইটেল</th>
                <th className="py-2 px-4 border-b">কোর্সসমূহ</th>
                <th className="py-2 px-4 border-b">ওয়ার্কশপসমূহ</th>
                <th className="py-2 px-4 border-b text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="py-2 px-4 border-b font-medium">
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {r.title}
                    </a>
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {(r.course_ids || []).map((id) => courseMap[id]).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-2 px-4 border-b text-gray-700">
                    {(r.workshop_ids || []).map((id) => workshopMap[id]).filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    <button
                      onClick={() => router.push(`/admin/resources/${r.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                    >
                      এডিট
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
