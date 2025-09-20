'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CourseVideo {
  id: string
  title: string
  youtube_url: string
  is_published: boolean
  created_at: string
  course_id: string | null
  workshop_id: string | null
  course: {
    title: string
  } | null
  workshop: {
    title: string
  } | null
}

export default function AdminVideoPage() {
  const supabase = createClientComponentClient()
  const [videos, setVideos] = useState<CourseVideo[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('course_videos')
        .select(`
          id, 
          title, 
          youtube_url, 
          is_published, 
          created_at, 
          course_id, 
          workshop_id,
          course:course_id(title),
          workshop:workshop_id(title)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching videos:', error.message)
        setVideos([])
      } else {
        setVideos(data as unknown as CourseVideo[])
      }

      setLoading(false)
    }

    fetchVideos()
  }, [])

  const getEntityInfo = (video: CourseVideo) => {
    if (video.course_id && video.course) {
      return { type: 'কোর্স', name: video.course.title }
    } else if (video.workshop_id && video.workshop) {
      return { type: 'ওয়ার্কশপ', name: video.workshop.title }
    }
    return { type: '—', name: '—' }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎬 কোর্স ও ওয়ার্কশপ ভিডিও লিস্ট</h1>
        <Link
          href="/admin/recordings/new"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
        >
          + নতুন ভিডিও যুক্ত করুন
        </Link>
      </div>

      {loading ? (
        <p>লোড হচ্ছে...</p>
      ) : videos.length === 0 ? (
        <p className="text-gray-500">কোনো ভিডিও পাওয়া যায়নি।</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3">টপিক</th>
                <th className="px-4 py-3">ধরন</th>
                <th className="px-4 py-3">নাম</th>
                <th className="px-4 py-3">YouTube</th>
                <th className="px-4 py-3">পাবলিশড?</th>
                <th className="px-4 py-3">কার্যকলাপ</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((video) => {
                const entityInfo = getEntityInfo(video)
                return (
                  <tr key={video.id} className="border-b">
                    <td className="px-4 py-2">{video.title}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entityInfo.type === 'কোর্স' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {entityInfo.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">{entityInfo.name}</td>
                    <td className="px-4 py-2 text-blue-600 underline">
                      <a href={video.youtube_url} target="_blank" rel="noreferrer">
                        দেখুন
                      </a>
                    </td>
                    <td className="px-4 py-2">
                      {video.is_published ? (
                        <span className="text-green-600 font-semibold">হ্যাঁ</span>
                      ) : (
                        <span className="text-red-600 font-semibold">না</span>
                      )}
                    </td>
                    <td className="px-4 py-2 space-x-2">
                      <button onClick={() => router.push(`/admin/recordings/${video.id}`)} className="text-blue-600 hover:underline text-sm">✏️ সম্পাদনা</button>
                      <button className="text-red-600 hover:underline text-sm">🗑️ মুছুন</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
