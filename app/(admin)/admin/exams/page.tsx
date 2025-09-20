"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface Exam {
  id: string;
  title: string;
  course_title: string;
  is_published: boolean;
  created_at: string;
}

interface ExamWithCourse {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
  course: {
    title: string;
  } | null;
}

export default function AdminExamsPage() {
  const supabase = createClientComponentClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(`id, title, is_published, created_at, course:course_id(title)`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch exams:", error);
      } else {
        const formatted = ((data as unknown) as ExamWithCourse[] || []).map((e) => ({
          id: e.id,
          title: e.title,
          is_published: e.is_published,
          created_at: e.created_at,
          course_title: e.course?.title || "—",
        }));
        setExams(formatted);
      }
      setLoading(false);
    };

    loadExams();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin • Exams</h1>
        <Link href="/admin/exams/new">
          <Button>+ New Exam</Button>
        </Link>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : exams.length === 0 ? (
        <p className="text-gray-600">কোনো পরীক্ষা তৈরি হয়নি।</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Exam Title</th>
              <th className="p-2 text-left">Course</th>
              <th className="p-2 text-center">Published</th>
              <th className="p-2 text-center">Created</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((ex) => (
              <tr key={ex.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{ex.title}</td>
                <td className="p-2">{ex.course_title || 'অজানা কোর্স'}</td>
                <td className="p-2 text-center">
                  {ex.is_published ? "✅" : "❌"}
                </td>
                <td className="p-2 text-center">
                  {new Date(ex.created_at).toLocaleDateString("bn-BD")}
                </td>
                <td className="p-2 text-right space-x-2">
                  <Link href={`/admin/exams/${ex.id}`}>
                    <Button variant="outline" size="sm">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
