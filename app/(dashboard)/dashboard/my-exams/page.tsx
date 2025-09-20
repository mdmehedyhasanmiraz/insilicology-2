'use client';

import { useEffect, useState, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/Button';
import { PostgrestError } from '@supabase/supabase-js';

interface Course {
  title: string;
}

interface ExamFromDB {
  id: string;
  title: string;
  course_id: string;
  batch_ids: string[] | null;
  created_at: string;
  courses: Course;
}

interface Exam {
  id: string;
  title: string;
  course_id: string;
  batch_ids: string[] | null;
  created_at: string;
  courses: Course | null;
  userResponse: ExamResponse | null;
}

interface ExamResponse {
  id: string;
  exam_id: string;
  total_marks: number;
  created_at: string;
}

export default function MyExamListPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [examItems, setExamItems] = useState<Exam[]>([]);
  const [batchMap, setBatchMap] = useState<Record<string, string>>({});
  const courseBatchMapRef = useRef<Record<string, string | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authData?.user?.id) {
        setExamItems([]);
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // 1. Fetch courses the user enrolled in
      const { data: userCourses, error: ucError } = await supabase
        .from('user_courses')
        .select('course_id, batch_id')
        .eq('user_id', userId);

      if (ucError || !userCourses?.length) {
        setExamItems([]);
        setLoading(false);
        return;
      }

      const courseIds = userCourses.map((c) => c.course_id);
      // Map of course_id to the user's enrolled batch_id (assume one batch per course per user)
      const courseBatchMap: Record<string, string | null> = {};
      userCourses.forEach((uc) => {
        courseBatchMap[uc.course_id] = uc.batch_id || null;
      });
      courseBatchMapRef.current = courseBatchMap;

      // 2. Fetch exams for those courses
      const { data: exams, error: examsError } = await supabase
        .from('exams')
        .select('id, title, course_id, batch_ids, created_at, courses(title)')
        .in('course_id', courseIds)
        .order('created_at', { ascending: false }) as { data: ExamFromDB[] | null, error: PostgrestError | null };

      if (examsError || !exams?.length) {
        setExamItems([]);
        setLoading(false);
        return;
      }

      // Only include exams where batch_ids is null/empty (for all batches) or user's batch_id for the course is included in batch_ids
      const filteredExams = exams.filter((exam) => {
        if (!exam.batch_ids || exam.batch_ids.length === 0) return true;
        const userBatchId = courseBatchMap[exam.course_id];
        return userBatchId && exam.batch_ids.includes(userBatchId);
      });

      const examIds = filteredExams.map((e) => e.id);

      // 3. Fetch user's exam responses for those exams
      const { data: responses, error: responsesError } = await supabase
        .from('exam_responses')
        .select('id, exam_id, total_marks, created_at')
        .in('exam_id', examIds)
        .eq('user_id', userId);

      if (responsesError) {
        console.error('Failed to fetch exam responses:', responsesError);
        setExamItems([]);
        setLoading(false);
        return;
      }

      // 4. Map responses by exam_id for quick lookup
      const responseMap = new Map<string, ExamResponse>();
      responses?.forEach((r) => responseMap.set(r.exam_id, r));

      // 5. Merge userResponse into exams
      const merged: Exam[] = filteredExams.map((exam) => ({
        ...exam,
        userResponse: responseMap.get(exam.id) || null,
      }));

      setExamItems(merged);
      setLoading(false);

      // Fetch all batch_ids used in filteredExams
      const batchIds = Array.from(new Set(filteredExams.flatMap(e => e.batch_ids || [])));
      let batchMap: Record<string, string> = {};
      if (batchIds.length > 0) {
        const { data: batches } = await supabase
          .from('live_batches')
          .select('id, batch_code')
          .in('id', batchIds);
        if (batches) {
          batchMap = Object.fromEntries(batches.map((b: { id: string, batch_code: string }) => [b.id, b.batch_code]));
        }
      }
      setBatchMap(batchMap);
    };

    fetchData();
  }, [supabase]);

  const handleAttend = (examId: string) => {
    router.push(`/dashboard/my-exams/${examId}`);
  };

  const handleViewResult = (examId: string) => {
    router.push(`/dashboard/my-exams/${examId}/result`);
  };

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">আমার পরীক্ষাসমূহ</h1>

      {loading ? (
        <div className="w-full">
          <div className="overflow-x-auto rounded-lg shadow-sm">
            <table className="w-full table-auto bg-white text-sm text-left text-gray-600 overflow-x-auto">
              <thead className="bg-purple-600 text-white text-sm">
                <tr>
                  <th className="px-4 py-2">কোর্স</th>
                  <th className="px-4 py-2">ব্যাচ</th>
                  <th className="px-4 py-2">পরীক্ষা</th>
                  <th className="px-4 py-2">তারিখ</th>
                  <th className="px-4 py-2">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4].map((i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : examItems.length === 0 ? (
        <p>আপনি কোন কোর্সে অংশ নেননি বা এগুলোর কোনো পরীক্ষা নেই।</p>
      ) : (
        <div className="w-full">
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:shadow-purple-200">
            <table className="w-full table-auto bg-white text-sm text-left text-gray-600 overflow-x-auto">
              <thead className="bg-purple-600 text-white text-sm">
                <tr>
                  <th className="px-4 py-2">কোর্স</th>
                  <th className="px-4 py-2">ব্যাচ</th>
                  <th className="px-4 py-2">পরীক্ষা</th>
                  <th className="px-4 py-2">তারিখ</th>
                  <th className="px-4 py-2">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {examItems.map((exam) => {
                  const response = exam.userResponse;
                  const taken = !!response;
                  const date = taken ? response.created_at : exam.created_at;
                  // Get the user's enrolled batch for this course
                  const userBatchId = (exam.course_id && typeof courseBatchMapRef.current !== 'undefined') ? courseBatchMapRef.current[exam.course_id] : null;
                  let batchDisplay = '';
                  if (!exam.batch_ids || exam.batch_ids.length === 0) {
                    batchDisplay = '—'; // or 'All'
                  } else if (userBatchId && batchMap[userBatchId]) {
                    batchDisplay = batchMap[userBatchId];
                  } else {
                    batchDisplay = '';
                  }
                  return (
                    <tr key={exam.id} className="border-t border-gray-200">
                      <td className="px-4 py-2">{exam.courses?.title || 'অজানা কোর্স'}</td>
                      <td className="px-4 py-2">{batchDisplay}</td>
                      <td className="px-4 py-2">{exam.title}</td>
                      <td className="px-4 py-2">{dayjs(date).format('DD MMM YYYY')}</td>
                      <td className="px-4 py-2">
                        {taken ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResult(exam.id)}
                          >
                            Result
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleAttend(exam.id)}>
                            Attend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
