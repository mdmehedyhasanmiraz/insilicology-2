'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

type Course = {
  id: string
  title: string
  slug: string
  poster: string
  duration: string
  type: string
}

export default function MyCoursesPage() {
  const supabase = createClientComponentClient()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) {
        setCourses([])
        setLoading(false)
        return
      }
  
      const { data, error } = await supabase
        .from('user_courses')
        .select('course_id, courses ( id, title, slug, poster, duration, type )')
        .eq('user_id', user.id)
  
      if (error) {
        console.error('Error fetching courses:', error.message)
        setCourses([])
      } else {
        // Cast and filter for recorded only
        const enrolled = data
          .map((entry) => entry.courses as unknown as Course)
          .filter((course) => course.type === 'recorded')
  
        setCourses(enrolled)
      }
  
      setLoading(false)
    }
  
    fetchCourses()
  }, [])  

  if (loading) {
    return (
      <div className="p-2 md:p-4">
        <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">আমার রেকর্ডেড কোর্সসমূহ</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full"
            >
              {/* Course Image Skeleton */}
              <div className="relative aspect-video overflow-hidden">
                <div className="w-full h-full bg-gray-200 animate-pulse"></div>
              </div>
              
              {/* Course Content Skeleton */}
              <div className="p-2 md:p-3 flex flex-col flex-1">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-2"></div>
                <div className="flex gap-2 mt-auto">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-900">আমার রেকর্ডেড কোর্সসমূহ</h1>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">কোনো রেকর্ডেড কোর্স নেই</h3>
            <p className="text-gray-600 mb-6">আপনি এখনও কোনো রেকর্ডেড কোর্সে এনরোল করেননি।</p>
            <Link
              href="/courses/recorded"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              রেকর্ডেড কোর্স দেখুন
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/dashboard/my-courses/${course.type.toLowerCase().replace(/ /g, '-')}/${course.slug}`}
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-purple-400 flex flex-col justify-between h-full"
            >
              <div className="relative aspect-video overflow-hidden">
                {course.poster ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${course.poster}`}
                    alt={course.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute top-2 left-2 flex gap-2 z-20">
                  <span className="text-xs px-2 py-1 rounded-full font-semibold shadow-sm border border-white/30 backdrop-blur-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    {course.type.charAt(0).toUpperCase() + course.type.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs bg-gray-900/80 text-white px-2 py-1 rounded-full font-semibold shadow-sm border border-white/20 backdrop-blur-sm">
                    {course.duration}
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-3 flex flex-col flex-1">
                <h2 className="text-md md:text-lg font-bold text-gray-900 mb-1 transition-colors">
                  {course.title}
                </h2>
                {/* 5-star rating */}
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current mr-0.5" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.8,17.8 9.9,14.8 15,17.8 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>
                  ))}
                </div>
                {/* Button row at the bottom */}
                <div className="mt-auto">
                  <span className="inline-flex justify-center align-middle items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-full group-hover:bg-blue-100 transition">
                    কোর্স দেখুন
                    <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
