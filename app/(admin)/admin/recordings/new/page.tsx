'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  title: string
}

interface Workshop {
  id: string
  title: string
}

interface Batch {
  id: string
  batch_code: string
}

interface VideoInsertData {
  title: string
  youtube_url: string
  is_published: boolean
  course_id?: string | null
  workshop_id?: string | null
  batch_id?: string | null
}

export default function UploadVideoPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [entityType, setEntityType] = useState<'course' | 'workshop'>('course')
  const [courseId, setCourseId] = useState('')
  const [workshopId, setWorkshopId] = useState('')
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [batches, setBatches] = useState<Batch[]>([])
  const [batchId, setBatchId] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [coursesResult, workshopsResult] = await Promise.all([
        supabase.from('courses').select('id, title'),
        supabase.from('workshops').select('id, title')
      ])
      
      if (coursesResult.data) setCourses(coursesResult.data)
      if (workshopsResult.data) setWorkshops(workshopsResult.data)
    }
    fetchData()
  }, [supabase])

  useEffect(() => {
    if (!courseId || entityType !== 'course') {
      setBatches([])
      setBatchId('')
      return
    }
    const fetchBatches = async () => {
      const { data, error } = await supabase.from('live_batches').select('id, batch_code').eq('course_id', courseId)
      if (!error) setBatches(data || [])
    }
    fetchBatches()
  }, [courseId, entityType, supabase])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const videoData: VideoInsertData = {
      title,
      youtube_url: youtubeUrl,
      is_published: isPublished,
    }

    if (entityType === 'course') {
      videoData.course_id = courseId
      videoData.workshop_id = null
      videoData.batch_id = batchId || null
    } else {
      videoData.workshop_id = workshopId
      videoData.course_id = null
      videoData.batch_id = null
    }

    const { error } = await supabase.from('course_videos').insert(videoData)

    setLoading(false)

    if (error) {
      alert('Error uploading video: ' + error.message)
    } else {
      router.push('/admin/recordings')
    }
  }

  const resetEntitySelection = () => {
    setCourseId('')
    setWorkshopId('')
    setBatchId('')
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🎬 নতুন ভিডিও যুক্ত করুন</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        
        <div>
          <label className="block font-medium mb-2">ভিডিওর ধরন</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="entityType"
                value="course"
                checked={entityType === 'course'}
                onChange={() => {
                  setEntityType('course')
                  resetEntitySelection()
                }}
                className="mr-2"
              />
              কোর্স
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="entityType"
                value="workshop"
                checked={entityType === 'workshop'}
                onChange={() => {
                  setEntityType('workshop')
                  resetEntitySelection()
                }}
                className="mr-2"
              />
              ওয়ার্কশপ
            </label>
          </div>
        </div>

        {entityType === 'course' ? (
          <>
            <div>
              <label className="block font-medium">কোর্স</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
              >
                <option value="">একটি কোর্স বেছে নিন</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium">ব্যাচ (ঐচ্ছিক)</label>
              <select
                className="w-full border px-3 py-2 rounded"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                disabled={!batches.length}
              >
                <option value="">কোনো ব্যাচ নির্ধারণ করুন (ঐচ্ছিক)</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>{batch.batch_code}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <div>
            <label className="block font-medium">ওয়ার্কশপ</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={workshopId}
              onChange={(e) => setWorkshopId(e.target.value)}
              required
            >
              <option value="">একটি ওয়ার্কশপ বেছে নিন</option>
              {workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block font-medium">ভিডিও টপিক (Title)</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-medium">YouTube লিংক</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          <label>পাবলিশড</label>
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          disabled={loading}
        >
          {loading ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </button>
      </form>
    </div>
  )
}
