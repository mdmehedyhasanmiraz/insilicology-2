import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/server";
import { ArrowRight, Video, Clock, Users } from "lucide-react";
import LiveCourseBatches from "@/components/courses/live/LiveCourseBatches";

export async function generateMetadata() {
  return {
    title: "Live Courses",
    description: "Live courses are available here. Try again later.",
    keywords: [
      "Live Courses",
    ],
    metadataBase: new URL('https://insilicology.org'),
    alternates: {
      canonical: '/courses/live',
    },
    openGraph: {
      title: "Live Courses",
      description: "Live courses are available here. Try again later.",
    },
    twitter: {
      card: 'summary_large_image',
      title: "Live Courses",
      description: "Live courses are available here. Try again later.",
    },
  };
}

export default async function AllCoursesPage() {
  try {
    const supabase = await createClient();
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .in("type", ["live", "hybrid"])
      .order("created_at", { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    // Helper function to construct proper image URL
    const getImageUrl = (poster: string | null) => {
      if (!poster) return null;
      if (poster.startsWith('http')) return poster;
      return `/${poster}`;
    };

    // Fetch batches for all courses
    const courseIds = courses?.map((c) => c.id) || [];
    let batches = [];
    if (courseIds.length > 0) {
      const { data: batchData, error: batchError } = await supabase
        .from("live_batches")
        .select("*")
        .in("course_id", courseIds);
      
      if (batchError) {
        console.error('Error fetching batches:', batchError);
        // Don't throw error for batches, just log it
      }
      
      batches = batchData || [];
    }

    if (!courses || courses.length === 0) {
      return (
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">লাইভ কোর্স</h1>
            <p className="text-gray-600 text-lg">কোনো লাইভ কোর্স পাওয়া যায়নি। পরে আবার চেষ্টা করুন।</p>
          </div>
        </div>
      );
    }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <Video className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">লাইভ কোর্স</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          আমাদের বিশেষজ্ঞদের সাথে সরাসরি শিখুন এবং প্রশ্ন করুন
        </p>
      </div>

      {/* Course Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses?.filter(course => course && course.id).map((course) => {
          const courseBatches = batches?.filter(b => b && b.course_id === course.id) || [];
          return (
            <Link
              key={course.slug || course.id}
              href={`/courses/${course.type?.toLowerCase() || 'live'}/${course.slug || course.id}`}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg shadow-red-100 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Course Image */}
              <div className="relative w-full h-48 overflow-hidden">
                {getImageUrl(course.poster) ? (
                  <Image
                    src={getImageUrl(course.poster)!}
                    alt={course.title || 'Course Image'}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {/* Live Badge */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-xs px-3 py-1 rounded-full text-white font-medium shadow-sm bg-red-600 border border-red-500">
                    লাইভ
                  </span>
                  {course.duration && (
                    <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full font-medium shadow-sm">
                      {course.duration}
                    </span>
                  )}
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Batch Info */}
              <LiveCourseBatches batches={courseBatches} />
              {/* Course Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors duration-200 line-clamp-2">
                  {course.title || 'Untitled Course'}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {course.description || 'No description available'}
                </p>

                {/* Course Features */}
                <div className="space-y-2 mb-4">
                  {course.duration && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-2" />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Video className="w-3 h-3 mr-2" />
                    <span>লাইভ সেশন</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-2" />
                    <span>সবাই</span>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-red-600 font-semibold text-sm">আরও জানুন</span>
                  <ArrowRight size={16} className="text-red-600 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-8 border border-red-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">আরও কোর্স খুঁজছেন?</h3>
          <p className="text-gray-600 mb-6">আমাদের রেকর্ডেড কোর্সগুলোও দেখুন</p>
          <Link
            href="/courses/recorded"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200"
          >
            রেকর্ডেড কোর্স দেখুন
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Server error in AllCoursesPage:', error);
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Error Loading Courses</h1>
          <p className="text-gray-600 text-lg">Something went wrong while loading the courses. Please try again later.</p>
          <p className="text-sm text-gray-500 mt-2">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
