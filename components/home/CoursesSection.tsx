import CourseArchive from "../courses/CourseArchive";
import { createClient } from "@/utils/supabase/server";

export default async function CoursesSection() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-3 py-16 md:py-20 bg-white">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">আমাদের কোর্সসমূহ</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          গবেষণা-ভিত্তিক কোর্সে অংশগ্রহণ করে আপনার ক্যারিয়ারকে এগিয়ে নিন
        </p>
      </div>
      <CourseArchive courses={courses || []} />
    </div>
  );
}
