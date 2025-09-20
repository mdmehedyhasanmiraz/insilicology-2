'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, ArrowRight } from 'lucide-react'

interface Workshop {
  id: string
  title: string
  slug: string
  banner_image_path: string | null
  start_time: string
  end_time: string
  status: string | null
  group_link: string | null
  // speaker_name?: string | null
}

type UserWorkshopRow = {
  workshop_id: string
  workshops: Workshop | Workshop[] | null
}

export default function MyWorkshopsPage() {
  const supabase = createClientComponentClient()
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkshops = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setWorkshops([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_workshops')
        .select('workshop_id, workshops ( id, title, slug, banner_image_path, start_time, end_time, status, group_link, speaker_name )')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error fetching user workshops:', error.message)
        setWorkshops([])
      } else {
        const rows = (data || []) as unknown as UserWorkshopRow[]
        const enrolled = rows.flatMap((entry) => {
          const w = entry.workshops
          if (!w) return [] as Workshop[]
          return Array.isArray(w) ? w : [w]
        })
        setWorkshops(enrolled)
      }

      setLoading(false)
    }

    fetchWorkshops()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka'
    })
  }
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('bn-BD', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dhaka'
    })
  }

  if (loading) {
    return (
      <div className="p-2 md:p-4">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">আমার ওয়ার্কশপসমূহ</h1>
        <div className="space-y-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm flex items-center p-3 md:p-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg flex-shrink-0">
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              </div>
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              </div>
              <div className="ml-3 flex-shrink-0">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">আমার ওয়ার্কশপসমূহ</h1>

      {workshops.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">কোনো ওয়ার্কশপ নেই</h3>
            <p className="text-gray-600 mb-6">আপনি এখনও কোনো ওয়ার্কশপে এনরোল করেননি।</p>
            <Link href="/workshops" className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              ওয়ার্কশপ দেখুন
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {workshops.map((workshop) => (
            <div key={workshop.id} className="group bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-400 flex items-center p-3 md:p-4">
              {/* Left Image */}
              <div className="relative w-16 h-16 md:w-20 md:h-20 overflow-hidden rounded-lg flex-shrink-0">
                {workshop.banner_image_path ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`}
                    alt={workshop.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Center Content */}
              <div className="ml-3 md:ml-4 flex-1 min-w-0">
                <h2 className="text-sm md:text-lg font-bold text-gray-900 mb-2 transition-colors">
                  {workshop.title}
                </h2>
                {/* {workshop.speaker_name && (
                  <p className="text-xs text-gray-600 mb-1">স্পিকার: {workshop.speaker_name}</p>
                )} */}
                {/* Date and Time - Stacked on mobile, inline on desktop */}
                <div className="md:hidden space-y-1">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                    {formatDate(workshop.start_time)}
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                    {formatTime(workshop.start_time)}
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {formatDate(workshop.start_time)}
                  </span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {formatTime(workshop.start_time)}
                  </span>
                </div>
              </div>

              {/* Right Actions */}
              <div className="ml-3 flex flex-col md:flex-row items-start md:items-center gap-2 flex-shrink-0">
                {workshop.group_link ? (
                  <a
                    href={workshop.group_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 font-semibold text-xs rounded-full hover:bg-green-100 transition w-full md:w-auto justify-center md:justify-start"
                  >
                    WhatsApp গ্রুপ
                    <ExternalLink size={14} className="ml-0.5" />
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 font-semibold text-xs rounded-full w-full md:w-auto justify-center md:justify-start">
                    গ্রুপ লিংক নেই
                  </span>
                )}
                <Link
                  href={`/workshops/${workshop.slug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 font-semibold text-xs rounded-full hover:bg-purple-100 transition w-full md:w-auto justify-center md:justify-start"
                >
                  বিস্তারিত
                  <ArrowRight size={14} className="text-purple-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
