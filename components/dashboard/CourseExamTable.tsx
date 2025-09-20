'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import dayjs from 'dayjs'
import { ExamRecord, CourseExamTableProps } from '@/types/course.type'

export default function CourseExamTable({ courseId }: CourseExamTableProps) {
  const supabase = createClientComponentClient()
  const [exams, setExams] = useState<ExamRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchExams = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user?.id || !courseId) {
        setLoading(false)
        return
      }

      const { data: allExams, error: examErr } = await supabase
        .from('exams')
        .select('id, title, total_marks')
        .eq('course_id', courseId)

      if (examErr || !allExams?.length) {
        console.error('exam fetch error', examErr)
        setLoading(false)
        return
      }

      const results: ExamRecord[] = []

      for (const exam of allExams) {
        // ✅ Fetch user response to this exam
        const { data: userResp } = await supabase
          .from('exam_responses')
          .select('total_marks, created_at')
          .eq('exam_id', exam.id)
          .eq('user_id', user.id)
          .maybeSingle()

        if (!userResp) continue

        // ✅ Fetch all responses for this exam
        const { data: allResps } = await supabase
          .from('exam_responses')
          .select('user_id, total_marks')
          .eq('exam_id', exam.id)

        const resps = allResps ?? []

        const sorted = resps.sort((a, b) => b.total_marks - a.total_marks)
        const pos = sorted.findIndex((r) => r.user_id === user.id) + 1
        const total = sorted.length

        const percentage = Number(
          ((userResp.total_marks / exam.total_marks) * 100).toFixed(2)
        )

        results.push({
          examId: exam.id,
          examName: exam.title,
          score: percentage,
          position: pos,
          totalParticipants: total,
          attendedAt: userResp.created_at,
        })
      }

      setExams(results)
      setLoading(false)
    }

    fetchExams()
  }, [courseId])

  if (loading) return <p>লোড হচ্ছে...</p>
  if (exams.length === 0)
    return <p className="text-gray-500">এই কোর্সে কোনো পরীক্ষার রেজাল্ট পাওয়া যায়নি।</p>

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-4">এই কোর্সের পরীক্ষার রেজাল্ট</h2>
      <div className="overflow-x-auto shadow-lg shadow-purple-100 hover:shadow-xl rounded-lg">
        <table className="w-full bg-white table-auto text-sm text-left text-gray-600">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="px-4 py-2">পরীক্ষার নাম</th>
              <th className="px-4 py-2">স্কোর</th>
              <th className="px-4 py-2">পজিশন</th>
              <th className="px-4 py-2">পরীক্ষার তারিখ</th>
            </tr>
          </thead>
          <tbody>
            {exams.map((e) => (
              <tr key={e.examId} className="border-t border-gray-200">
                <td className="px-4 py-2">{e.examName}</td>
                <td className="px-4 py-2 font-semibold text-purple-700">{e.score}%</td>
                <td className="px-4 py-2">
                  {e.position} / {e.totalParticipants}
                </td>
                <td className="px-4 py-2">{dayjs(e.attendedAt).format('DD MMM YYYY')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
