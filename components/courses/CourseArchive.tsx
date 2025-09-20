import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Video, Radio } from "lucide-react";
import { Course } from "@/types/course.type";

export default function CourseArchive({ courses }: { courses: Course[] }) {
  if (!courses || courses.length === 0) {
    return (
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-gray-600">কোনো কোর্স পাওয়া যায়নি। পরে আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        {courses.filter((course) => course.is_published).map((course) => {
          // Convert price strings to numbers for formatting
          const priceOffer = course.price_offer ? parseFloat(course.price_offer) : null;
          const priceRegular = course.price_regular ? parseFloat(course.price_regular) : null;

          return (
            <div
              key={course.slug}
              className="group relative bg-white border border-gray-200 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-full hover:border-purple-300"
            >
              <div className="relative aspect-video overflow-hidden">
                {course.poster ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${course.poster}`}
                    alt={course.title}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">No Image</div>
                )}
              </div>
              
              <div className="p-2 md:p-4 flex flex-col flex-1">
                {/* Stats mini cards below banner */}
                <div className="flex gap-2 mb-2">
                  {/* Course Type Badge */}
                  <div className={`flex items-center gap-1 px-1 py-1 rounded-md text-xs ${
                    course.type === "live"
                      ? "bg-red-500 text-white"
                      : "bg-blue-500 text-white"
                  }`}>
                    {course.type === "live" ? (
                      <Radio className="w-3 h-3" />
                    ) : (
                      <Video className="w-3 h-3" />
                    )}
                    {course.type === "live" ? "Live" : "Recorded"}
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="flex items-center gap-1 px-1 py-1 rounded-md bg-gray-100 text-gray-900 text-xs backdrop-blur-sm">
                    <Clock className="w-3 h-3" />
                    {course.duration}
                  </div>
                  
                  {/* Seats Left Badge */}
                  {/* <div className="flex items-center gap-1 px-1 py-1 rounded-md bg-purple-600/90 text-white text-xs">
                    <Users className="w-3 h-3" />
                    {course.type === "live" ? "Seats Left" : "Unlimited"}
                  </div> */}
                </div>
                {/* 5-star rating */}
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current mr-0.5" viewBox="0 0 20 20"><polygon points="9.9,1.1 7.6,6.6 1.6,7.6 6,11.9 4.8,17.8 9.9,14.8 15,17.8 13.8,11.9 18.2,7.6 12.2,6.6 "/></svg>
                  ))}
                </div>
                
                <h2 className="text-md md:text-lg font-semibold text-gray-900 mb-3 transition-colors line-clamp-2">
                  {course.title}
                </h2>
                
                {/* Price section */}
                <div className="mb-4">
                  {priceOffer && priceRegular && priceOffer !== priceRegular ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-purple-600">{priceOffer.toLocaleString("bn-BD")}<sup>৳</sup></span>
                      <span className="text-sm font-medium text-gray-400 line-through">{priceRegular.toLocaleString("bn-BD")}<sup>৳</sup></span>
                    </div>
                  ) : priceOffer ? (
                    <span className="text-xl font-bold text-purple-600">{priceOffer.toLocaleString("bn-BD")}<sup>৳</sup></span>
                  ) : priceRegular ? (
                    <span className="text-xl font-bold text-gray-900">{priceRegular.toLocaleString("bn-BD")}<sup>৳</sup></span>
                  ) : null}
                </div>
                
                {/* Full width button at bottom */}
                <Link
                  href={`/courses/${course.type.toLowerCase()}/${course.slug}`}
                  className="mt-auto w-full"
                >
                  <button className="w-full cursor-pointer px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold text-sm rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 group-hover:gap-3">
                    বিস্তারিত দেখুন
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
