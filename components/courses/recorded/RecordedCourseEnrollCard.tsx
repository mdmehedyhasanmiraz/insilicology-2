"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Award } from "lucide-react";
import { CourseEnrollCardProps } from "@/types/course.type";

export default function RecordedCourseEnrollCard({ course, enrolled }: CourseEnrollCardProps) {
  const hasDiscount = course.price_offer && course.price_regular && course.price_offer < course.price_regular;
  const discountPercentage = hasDiscount 
    ? Math.round(((course.price_regular! - course.price_offer!) / course.price_regular!) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Course Image */}
      <div className="relative aspect-video">
        {course.poster && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${course.poster}`}
            alt={course.title}
            fill
            className="object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
            {discountPercentage}% ছাড়
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="p-6">
        {/* <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2">
          {course.title}
        </h3> */}

        {/* Pricing */}
        <div className="mb-6">
          {hasDiscount ? (
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                ৳{course.price_offer?.toLocaleString('bn-BD')}
              </span>
              <span className="text-lg text-gray-500 line-through">
                ৳{course.price_regular?.toLocaleString('bn-BD')}
              </span>
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              ৳{course.price_regular?.toLocaleString('bn-BD') || 'ফ্রি'}
            </div>
          )}
        </div>

        {/* Enroll or Go to Course Button */}
        {enrolled ? (
          <Link
            href={`/dashboard/my-courses/recorded/${course.slug}`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-6"
          >
            <span>কোর্সে যান</span>
          </Link>
        ) : (
          <Link
            href={`/courses/${course.slug}/enroll`}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-6"
          >
            <span>এখনই কোর্সটি কিনুন</span>
          </Link>
        )}

        {/* Course Features */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
          {course.duration && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{course.duration}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">সবাই</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">সার্টিফিকেট সহ</span>
          </div>
          {course.starts_on && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">শুরু: {new Date(course.starts_on).toLocaleDateString('bn-BD', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 