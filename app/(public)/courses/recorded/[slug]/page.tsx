import { notFound } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Clock, Users, Award, CheckCircle, Play, BookOpen, Target, FileText } from "lucide-react";
import RecordedCourseEnrollCard from "@/components/courses/recorded/RecordedCourseEnrollCard";
import CourseModules from "@/components/courses/recorded/CourseModules";
import StickyEnrollButton from "@/components/courses/StickyEnrollButton";
import { isUserEnrolledInCourse } from "@/lib/supabase/paymentUtils";

async function getCourse(slug: string) {
  const supabase = createServerComponentClient({ cookies });
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("type", "recorded")
    .single();
  
  return course;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  
  if (!course) {
    return {
      title: "কোর্স পাওয়া যায়নি",
      description: "আপনি যে কোর্সটি খুঁজছেন তা পাওয়া যায়নি। পরে আবার চেষ্টা করুন।",
    };
  }

  return {
    title: course.title,
    description: course.description,
    keywords: [
      "রেকর্ডেড কোর্স",
      "কোর্স পাওয়া যায়নি",
      "পরে আবার চেষ্টা করুন",
    ],
    metadataBase: new URL('https://insilicology.org'),
    alternates: {
      canonical: `/courses/recorded/${slug}`,
    },
    openGraph: {
      title: course.title,
      description: course.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: course.description,
    },
  };
}

export default async function RecordedCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = createServerComponentClient({ cookies });

  // Fetch course data
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", (await params).slug)
    .eq("type", "recorded")
    .single();

  if (!course) return notFound();

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let enrolled = false;
  if (session?.user?.id) {
    enrolled = await isUserEnrolledInCourse(session.user.id, course.id);
  }

  // Fetch modules and lessons for this course
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      id,
      title,
      position,
      description,
      lessons (
        id,
        title,
        position,
        duration
      )
    `)
    .eq("course_id", course.id)
    .order("position");

  // Sort lessons within each module
  const sortedModules = modules?.map(module => ({
    ...module,
    lessons: module.lessons?.sort((a, b) => a.position - b.position) || []
  })).sort((a, b) => a.position - b.position) || [];

  return (
    <div 
      className="min-h-screen bg-gray-50"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(240, 238, 233) 1.5px, transparent 1px)",
        backgroundSize: "15px 15px",
      }}
    >
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="mb-2">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {course.title}
                </h1>
                <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  {course.description}
                </p>
              </div>
            </div>

            {/* Course Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">কোর্সের বিবরণ</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <Clock className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">সময়কাল</p>
                    <p className="font-semibold text-gray-900">{course.duration}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <Play className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">কোর্সের ধরন</p>
                    <p className="font-semibold text-gray-900">রেকর্ডেড কোর্স</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <Award className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">সার্টিফিকেট</p>
                    <p className="font-semibold text-gray-900">হ্যাঁ, কোর্স শেষে</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <Users className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">কাদের জন্য</p>
                    <p className="font-semibold text-gray-900">সবাই</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <Target className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">কঠিনতার মাত্রা</p>
                    <p className="font-semibold text-gray-900">{course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1).toLowerCase() || 'মাঝারি'}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                  <BookOpen className="w-10 h-10 text-purple-600 bg-purple-100 rounded-md p-2" />
                  <div>
                    <p className="text-sm text-gray-600">মডিউল সংখ্যা</p>
                    <p className="font-semibold text-gray-900">{sortedModules.length.toLocaleString("bn-BD")} টি</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            {course.included && course.included.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">কোর্সের সুবিধাসমূহ</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.included.map((item: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {course.requirements && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">কোর্সের যোগ্যতা</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed">{course.requirements}</p>
                </div>
              </div>
            )}

            {/* Course Modules */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">কোর্সের মডিউলসমূহ</h2>
              {sortedModules.length > 0 ? (
                <CourseModules modules={sortedModules} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>কোর্সের মডিউলসমূহ শীঘ্রই যোগ করা হবে।</p>
                </div>
              )}
            </div>

            {/* Topics */}
            {course.topics && course.topics.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">কোর্সের বিষয়বস্তু</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {course.topics.map((topic: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{topic}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {course.faqs && course.faqs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">সাধারণ জিজ্ঞাসা ও উত্তর</h2>
                <div className="space-y-4">
                  {course.faqs.map((faq: { question: string; answer: string }, index: number) => (
                    <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Course Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RecordedCourseEnrollCard course={course} enrolled={enrolled} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Enroll Button for Mobile */}
      <StickyEnrollButton
        courseSlug={course.slug}
        courseType="recorded"
        price={parseInt(course.price_offer)}
        originalPrice={parseInt(course.price_regular)}
        enrolled={enrolled}
      />
    </div>
  );
}
