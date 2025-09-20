'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Course {
  id: string
  title: string
}

interface Workshop {
  id: string
  title: string
}

interface VideoUpdateData {
  title: string
  youtube_url: string
  is_published: boolean
  course_id?: string | null
  workshop_id?: string | null
}

export default function EditVideoPage() {
  const { id } = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [courses, setCourses] = useState<Course[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [entityType, setEntityType] = useState<'course' | 'workshop'>('course')
  const [courseId, setCourseId] = useState('')
  const [workshopId, setWorkshopId] = useState('')
  const [title, setTitle] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isPublished, setIsPublished] = useState(true)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const [coursesResult, workshopsResult, videoResult] = await Promise.all([
        supabase.from('courses').select('id, title'),
        supabase.from('workshops').select('id, title'),
        supabase.from('course_videos').select('*').eq('id', id).single(),
      ])
      
      if (coursesResult.data) setCourses(coursesResult.data)
      if (workshopsResult.data) setWorkshops(workshopsResult.data)
      
      if (videoResult.data) {
        setTitle(videoResult.data.title)
        setYoutubeUrl(videoResult.data.youtube_url)
        setIsPublished(videoResult.data.is_published)
        
        // Determine entity type and set appropriate ID
        if (videoResult.data.course_id) {
          setEntityType('course')
          setCourseId(videoResult.data.course_id)
          setWorkshopId('')
        } else if (videoResult.data.workshop_id) {
          setEntityType('workshop')
          setWorkshopId(videoResult.data.workshop_id)
          setCourseId('')
        }
      }
    }

    fetchData()
  }, [id, supabase])

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const updateData: VideoUpdateData = {
      title,
      youtube_url: youtubeUrl,
      is_published: isPublished,
    }

    if (entityType === 'course') {
      updateData.course_id = courseId
      updateData.workshop_id = null
    } else {
      updateData.workshop_id = workshopId
      updateData.course_id = null
    }

    const { error } = await supabase
      .from('course_videos')
      .update(updateData)
      .eq('id', id)

    setLoading(false)

    if (error) {
      alert('Error updating video: ' + error.message)
    } else {
      router.push('/admin/recordings')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই ভিডিওটি মুছে ফেলতে চান?')) return

    setDeleting(true)
    setError(null)

    const { error } = await supabase.from('course_videos').delete().eq('id', id)

    if (error) {
      setError('ভিডিও মুছে ফেলা যায়নি। আবার চেষ্টা করুন।')
      setDeleting(false)
    } else {
      router.push('/admin/recordings')
    }
  }

  const resetEntitySelection = () => {
    setCourseId('')
    setWorkshopId('')
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">🎥 ভিডিও সম্পাদনা করুন</h1>
      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded shadow">
        
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
          disabled={loading || deleting}
        >
          {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
        </button>
      </form>

      {/* Delete Button */}
      <div className="mt-6">
        <button
          onClick={handleDelete}
          disabled={deleting || loading}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          {deleting ? 'মুছে ফেলা হচ্ছে...' : 'ভিডিও ডিলিট করুন'}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  )
}
