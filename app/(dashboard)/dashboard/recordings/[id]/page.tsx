'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Video {
  id: string
  title: string
  youtube_url: string
  is_published: boolean
}

export default function VideoPlayerPage() {
  const { id } = useParams()
  const supabase = createClientComponentClient()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('course_videos')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single()

      if (!error) setVideo(data)
      setLoading(false)
    }

    fetchVideo()
  }, [id])

  if (loading) return <p className="p-6">লোড হচ্ছে...</p>
  if (!video) return <p className="p-6 text-red-500">ভিডিও পাওয়া যায়নি।</p>

  const videoId = getYouTubeId(video.youtube_url)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4">{video.title}</h1>

      <div className="aspect-video">
        <iframe
          className="w-full h-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={video.title}
          allowFullScreen
        />
      </div>
    </div>
  )
}

function getYouTubeId(url: string) {
  try {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
    return match ? match[1] : ''
  } catch {
    return ''
  }
}
