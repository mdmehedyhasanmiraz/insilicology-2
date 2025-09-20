'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';

type ResourceItem = {
  id: string;
  title: string;
  file_url: string;
};

type EnrolledCourse = { course_id: string };
type EnrolledWorkshop = { workshop_id: string };

export default function StudentResourcesPage() {
  const supabase = createClientComponentClient();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResources = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) return setLoading(false);

      // Get enrolled course and workshop IDs
      const [{ data: enrolledCourses }, { data: enrolledWorkshops }] = await Promise.all([
        supabase.from('user_courses').select('course_id').eq('user_id', user.id),
        supabase.from('user_workshops').select('workshop_id').eq('user_id', user.id),
      ]);

      const courseIds = (enrolledCourses || ([] as EnrolledCourse[]))
        .map((e: EnrolledCourse) => e.course_id)
        .filter(Boolean);
      const workshopIds = (enrolledWorkshops || ([] as EnrolledWorkshop[]))
        .map((e: EnrolledWorkshop) => e.workshop_id)
        .filter(Boolean);

      if (courseIds.length === 0 && workshopIds.length === 0) {
        setResources([]);
        return setLoading(false);
      }

      // Fetch linked resources using overlaps on arrays; run two queries and merge
      const [byCourses, byWorkshops] = await Promise.all([
        courseIds.length > 0
          ? supabase
              .from('resources')
              .select('id, title, file_url')
              .overlaps('course_ids', courseIds)
          : Promise.resolve({ data: [] as ResourceItem[], error: null as null }),
        workshopIds.length > 0
          ? supabase
              .from('resources')
              .select('id, title, file_url')
              .overlaps('workshop_ids', workshopIds)
          : Promise.resolve({ data: [] as ResourceItem[], error: null as null }),
      ]);

      const combined = [...(byCourses.data || []), ...(byWorkshops.data || [])] as ResourceItem[];
      // De-duplicate by id
      const uniqueMap = new Map<string, ResourceItem>();
      combined.forEach((r) => uniqueMap.set(r.id, r));
      setResources(Array.from(uniqueMap.values()));

      setLoading(false);
    };

    loadResources();
  }, []);

  if (loading) {
    return (
      <div className="p-2 md:p-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4">রিসোর্সসমূহ</h1>
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between bg-white shadow-sm rounded-lg p-2 border border-white">
              <div className="flex items-center gap-2 justify-between w-full">
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
                <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse ml-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">রিসোর্সসমূহ</h1>

      <div className="grid grid-cols-1 gap-2">
      {resources.length === 0 ? (
        <p>দুঃখিত, আপনি কোনো রিসোর্সে এক্সেস করছেন না বা এগুলো এই মুহূর্তে উপলব্ধ নয়।</p>
      ) : (
        <ul className="space-y-2">
          {resources.map((r) => (
            <li key={r.id} className="flex items-center justify-between bg-white shadow-sm rounded-lg p-2 border border-white hover:border-purple-300">
              <div className='flex items-center gap-2 justify-between w-full'>
                <div>
                  <Link href={r.file_url} target="_blank" className="text-blue-600 hover:underline font-medium">
                    {r.title}
                  </Link>
                </div>
                <button onClick={() => window.open(r.file_url, '_blank')} className="bg-purple-600 hover:bg-purple-700 cursor-pointer text-white px-4 py-2 rounded-md">Download</button>
              </div>
            </li>
          ))}
          </ul>
        )}
      </div>
    </div>
  );
}
