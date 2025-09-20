'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Play, BookOpen, Users, Search } from 'lucide-react'

interface Course {
  id: string
  title: string
  poster?: string
}

interface Workshop {
  id: string
  title: string
  banner_image_path?: string
}

interface CourseVideo {
  id: string
  title: string
  course_id: string | null
  workshop_id: string | null
  youtube_url: string
  thumbnail_url?: string
  is_published: boolean
  created_at: string
  course: { title: string; poster?: string } | null
  workshop: { title: string; banner_image_path?: string } | null
}

export default function RecordingsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const [videos, setVideos] = useState<CourseVideo[]>([])
  const [filteredVideos, setFilteredVideos] = useState<CourseVideo[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [selectedEntityType, setSelectedEntityType] = useState<'all' | 'course' | 'workshop'>('all')
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // 🔹 Get enrolled courses
      const { data: userCourses, error: courseErr } = await supabase
        .from('user_courses')
        .select('course_id')
        .eq('user_id', user.id)

      if (courseErr || !userCourses) return

      const courseIds = userCourses.map((uc) => uc.course_id)

      // 🔹 Get enrolled workshops
      const { data: userWorkshops } = await supabase
        .from('user_workshops')
        .select('workshop_id')
        .eq('user_id', user.id)

      const workshopIds = userWorkshops?.map((uw) => uw.workshop_id) || []

      // 🔹 Get course and workshop titles + banners
      const [courseData, workshopData] = await Promise.all([
        supabase.from('courses').select('id, title, poster').in('id', courseIds),
        supabase.from('workshops').select('id, title, banner_image_path').in('id', workshopIds)
      ])

      setCourses(courseData.data || [])
      setWorkshops(workshopData.data || [])

      // 🔹 Get published videos for enrolled courses and workshops, include poster/banner
      const { data: courseVideos, error: videoErr } = await supabase
        .from('course_videos')
        .select(`
          *,
          course:course_id(title,poster),
          workshop:workshop_id(title,banner_image_path)
        `)
        .or(`course_id.in.(${courseIds.join(',')}),workshop_id.in.(${workshopIds.join(',')})`)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!videoErr && courseVideos) {
        setVideos(courseVideos as unknown as CourseVideo[])
        setFilteredVideos(courseVideos as unknown as CourseVideo[])
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase])

  const handleFilterChange = (entityType: 'all' | 'course' | 'workshop', entityId: string = '') => {
    setSelectedEntityType(entityType)
    setSelectedEntityId(entityId)
    
    let filtered = videos

    // Filter by entity type
    if (entityType === 'course') {
      filtered = videos.filter(video => video.course_id !== null)
    } else if (entityType === 'workshop') {
      filtered = videos.filter(video => video.workshop_id !== null)
    }

    // Filter by specific entity
    if (entityId) {
      filtered = filtered.filter(video => 
        video.course_id === entityId || video.workshop_id === entityId
      )
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (video.course?.title || video.workshop?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredVideos(filtered)
  }

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    
    let filtered = videos

    // Apply entity type filter
    if (selectedEntityType === 'course') {
      filtered = videos.filter(video => video.course_id !== null)
    } else if (selectedEntityType === 'workshop') {
      filtered = videos.filter(video => video.workshop_id !== null)
    }

    // Apply specific entity filter
    if (selectedEntityId) {
      filtered = filtered.filter(video => 
        video.course_id === selectedEntityId || video.workshop_id === selectedEntityId
      )
    }

    // Apply search filter
    if (query) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        (video.course?.title || video.workshop?.title || '').toLowerCase().includes(query.toLowerCase())
      )
    }

    setFilteredVideos(filtered)
  }

  const getEntityInfo = (video: CourseVideo) => {
    if (video.course_id && video.course) {
      return { type: 'কোর্স', name: video.course.title, icon: BookOpen, color: 'blue' }
    } else if (video.workshop_id && video.workshop) {
      return { type: 'ওয়ার্কশপ', name: video.workshop.title, icon: Users, color: 'green' }
    }
    return { type: '—', name: '—', icon: BookOpen, color: 'gray' }
  }

  function getBannerFallback(video: CourseVideo) {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!baseUrl) return ''
    if (video.course?.poster) {
      return `${baseUrl}/storage/v1/object/public/images/course-banners/${video.course.poster}`
    }
    if (video.workshop?.banner_image_path) {
      return `${baseUrl}/storage/v1/object/public/images/workshop-banners/${video.workshop.banner_image_path}`
    }
    return ''
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-96"></div>
          </div>
          
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-full max-w-md"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm p-0 overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">কোনো ভিডিও রেকর্ডিং পাওয়া যায়নি</h3>
            <p className="text-gray-500">আপনার এনরোল করা কোর্স বা ওয়ার্কশপে এখনও কোনো ভিডিও আপলোড করা হয়নি।</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            ক্লাস রেকর্ডিং
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:flex-wrap items-stretch lg:items-center">
            {/* Search */}
            <div className="flex-1 min-w-0 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ভিডিও বা কোর্স/ওয়ার্কশপ অনুসন্ধান করুন..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Entity Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedEntityType === 'all'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => handleFilterChange('course')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedEntityType === 'course'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200'
                }`}
              >
                কোর্স
              </button>
              <button
                onClick={() => handleFilterChange('workshop')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedEntityType === 'workshop'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ওয়ার্কশপ
              </button>
            </div>

            {/* Specific Entity Filter */}
            {(selectedEntityType === 'course' || selectedEntityType === 'workshop') && (
              <div className="w-full lg:w-auto min-w-0">
                <select
                  value={selectedEntityId}
                  onChange={(e) => handleFilterChange(selectedEntityType, e.target.value)}
                  className="w-full max-w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">সব {selectedEntityType === 'course' ? 'কোর্স' : 'ওয়ার্কশপ'}</option>
                  {(selectedEntityType === 'course' ? courses : workshops).map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((video) => {
            const entityInfo = getEntityInfo(video)
            const IconComponent = entityInfo.icon

            const id = getYouTubeId(video.youtube_url)
            const thumbCandidates = buildYouTubeThumbnailCandidates(id)
            const bannerFallback = getBannerFallback(video)
            const initialThumb = video.thumbnail_url || thumbCandidates[0] || bannerFallback || '/opengraph-image.webp'
            
            return (
              <div
                key={video.id}
                onClick={() => router.push(`/dashboard/recordings/${video.id}`)}
                className="bg-white cursor-pointer rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <SmartThumbnail
                    title={video.title}
                    initial={initialThumb}
                    candidates={[...thumbCandidates, bannerFallback, '/opengraph-image.webp'].filter(Boolean)}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                      <Play className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  {/* Entity Type Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white ${
                    entityInfo.color === 'blue' ? 'bg-blue-500' : 
                    entityInfo.color === 'green' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    <IconComponent className="w-3 h-3 inline mr-1" />
                    {entityInfo.type}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 text-md mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {entityInfo.name}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <span>{new Date(video.created_at).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Results Count */}
        <div className="mt-8 text-center text-gray-500">
          <p>{filteredVideos.length} টি ভিডিও পাওয়া গেছে</p>
        </div>
      </div>
    </div>
  )
}

// 🧠 Helper: Extract YouTube video ID (handles watch, youtu.be, embed, shorts)
function getYouTubeId(url: string) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      const seg = u.pathname.split('/').filter(Boolean)
      return seg[0] || ''
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v') || ''
      }
      const seg = u.pathname.split('/').filter(Boolean)
      if (seg[0] === 'embed' || seg[0] === 'shorts' || seg[0] === 'v') {
        return seg[1] || ''
      }
    }
  } catch {}
  // Fallback regex
  const match = url.match(/(?:v=|v\/|embed\/|shorts\/|youtu\.be\/)([0-9A-Za-z_-]{11})/)
  return match ? match[1] : ''
}

function buildYouTubeThumbnailCandidates(id: string) {
  if (!id) return ['/opengraph-image.webp']
  // Try multiple hosts (img.youtube.com and i.ytimg.com) and webp/jpeg variants
  const hosts = [
    `https://img.youtube.com/vi/${id}`,
    `https://i.ytimg.com/vi/${id}`,
    `https://i.ytimg.com/vi_webp/${id}`,
  ]
  const paths = [
    'hqdefault.webp',
    'mqdefault.webp',
    'sddefault.webp',
    'maxresdefault.webp',
    'hqdefault.jpg',
    'mqdefault.jpg',
    'sddefault.jpg',
    'maxresdefault.jpg',
    'default.jpg',
  ]
  const urls: string[] = []
  for (const host of hosts) {
    for (const p of paths) {
      // Skip impossible combos (img.youtube.com does not serve webp)
      if (host.includes('img.youtube.com') && p.endsWith('.webp')) continue
      // vi_webp host should only serve webp
      if (host.includes('/vi_webp/') && !p.endsWith('.webp')) continue
      urls.push(`${host}/${p}`)
    }
  }
  try {
    console.debug('[Thumbnails] Built candidates for video id', id, { count: urls.length, firstFive: urls.slice(0, 5) })
  } catch {}
  return urls
}

// Selects the first valid, non-placeholder thumbnail by probing candidates
function SmartThumbnail({ title, initial, candidates }: { title: string; initial: string; candidates: string[] }) {
  const [src, setSrc] = useState<string>(initial)
  const [idx, setIdx] = useState<number>(0)

  useEffect(() => {
    let isCancelled = false
    const chain = [initial, ...candidates].filter(Boolean)

    // Consider an image valid if it's at least 320x180 and not the 120x90 placeholder
    const isValidSize = (w: number, h: number) => {
      if (!w || !h) return false
      if (w === 120 && h === 90) return false
      return w >= 320 && h >= 180
    }

    try {
      console.debug('[Thumbnails] Start probing', { title, total: chain.length, chain })
    } catch {}

    const tryNext = (i: number) => {
      if (isCancelled || i >= chain.length) return
      const url = chain[i]
      try {
        console.debug('[Thumbnails] Trying candidate', { title, index: i, url })
      } catch {}
      const testImg = new Image()
      testImg.referrerPolicy = 'no-referrer'
      testImg.loading = 'eager'
      testImg.decoding = 'async'
      testImg.onload = () => {
        if (isCancelled) return
        const w = (testImg as HTMLImageElement).naturalWidth
        const h = (testImg as HTMLImageElement).naturalHeight
        if (isValidSize(w, h)) {
          try {
            console.debug('[Thumbnails] Valid candidate selected', { title, index: i, url, width: w, height: h })
          } catch {}
          setSrc(url)
          setIdx(i)
        } else {
          try {
            console.warn('[Thumbnails] Rejected small/placeholder image', { title, index: i, url, width: w, height: h })
          } catch {}
          tryNext(i + 1)
        }
      }
      testImg.onerror = () => {
        if (isCancelled) return
        try {
          console.error('[Thumbnails] Load error for candidate', { title, index: i, url })
        } catch {}
        tryNext(i + 1)
      }
      testImg.src = url
    }

    tryNext(0)
    return () => {
      isCancelled = true
    }
  }, [initial, candidates.join('|')])

  return (
    <img
      src={src}
      alt={title}
      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      referrerPolicy="no-referrer"
      decoding="async"
      data-thumb-idx={String(idx)}
      onError={() => {
        // In case a later network error occurs, advance to the next candidate
        const chain = [initial, ...candidates].filter(Boolean)
        const next = idx + 1
        try {
          console.error('[Thumbnails] Runtime onError advancing', { title, currentIndex: idx, nextIndex: next, currentSrc: src })
        } catch {}
        if (next < chain.length) {
          setSrc(chain[next])
          setIdx(next)
        } else {
          try {
            console.error('[Thumbnails] Exhausted all candidates, keeping last src', { title, lastIndex: idx, src })
          } catch {}
        }
      }}
    />
  )
}
