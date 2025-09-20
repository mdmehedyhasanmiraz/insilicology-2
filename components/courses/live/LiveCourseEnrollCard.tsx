"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Users, Award, Calendar, Video } from "lucide-react";
import { CourseEnrollCardProps } from "@/types/course.type";

export default function LiveCourseEnrollCard({ course, enrolled, nextStartDate }: CourseEnrollCardProps) {
  const hasDiscount = course.price_offer && course.price_regular && course.price_offer < course.price_regular;
  const discountPercentage = hasDiscount 
    ? Math.round(((course.price_regular! - course.price_offer!) / course.price_regular!) * 100)
    : 0;

  // Use nextStartDate if provided, otherwise fallback to course.starts_on
  const displayStartDate = nextStartDate || course.starts_on;

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
        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-md text-sm font-semibold">
          লাইভ
        </div>
      </div>

      {/* Course Info */}
      <div className="p-6">
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
            href={`/dashboard/my-courses/live/${course.slug}`}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-6"
          >
            <span>কোর্সে যান</span>
          </Link>
        ) : (
          <Link
            href={`/courses/${course.slug}/enroll`}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 mb-6"
          >
            <span>এখনই ভর্তি হোন</span>
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
            <Video className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">লাইভ ক্লাস</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">সবার জন্য</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">সার্টিফিকেট</span>
          </div>
          {displayStartDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-bold text-gray-600">শুরু: {new Date(displayStartDate).toLocaleDateString('bn-BD', { month: 'long', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        {/* <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span>৪.৮/৫</span>
            </div>
            <div>•</div>
            <div>৮+ শিক্ষার্থী</div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 