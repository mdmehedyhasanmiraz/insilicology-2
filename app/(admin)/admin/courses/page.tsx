"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: string;
  title: string;
  slug: string;
  type: string;
  duration: string;
  price_regular: number | null;
  price_offer: number | null;
  poster: string | null;
  og_image: string | null;
  enroll_link: string | null;
  certificate: string | null;
  difficulty: string | null;
  starts_on: string | null;
  is_published: boolean;
  description: string | null;
  included: string[] | null;
  for_whom: string[] | null;
  requirements: string[] | null;
  topics: string[] | null;
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    const fetchCourses = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("courses")
        .select(`id, title, slug, type, duration, price_regular, price_offer, poster, og_image, enroll_link, certificate, difficulty, starts_on, is_published, description, included, for_whom, requirements, topics`)
        .order("created_at", { ascending: false });
      if (!error && data) setCourses(data as Course[]);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">🎓 কোর্স তালিকা</h1>
        <Link href="/admin/courses/new">
          <Button>+ নতুন কোর্স</Button>
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-lg bg-white shadow-sm p-4 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <p className="text-gray-500">কোনো কোর্স পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const posterUrl = course.poster || undefined;
            return (
              <div
                key={course.id}
                className="rounded-lg bg-white shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
              >
                {(!imgErrors[course.id] && posterUrl) ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${posterUrl}`}
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                    onError={() => setImgErrors(prev => ({ ...prev, [course.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <h2 className="text-lg font-semibold line-clamp-2">{course.title}</h2>
                  <div className="flex gap-2 items-center text-xs">
                    <span className={`px-2 py-1 rounded-full font-semibold ${course.type === "live" ? "bg-red-100 text-red-700" : course.type === "recorded" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{course.type}</span>
                    {course.difficulty && (
                      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">{course.difficulty}</span>
                    )}
                    {course.starts_on && (
                      <span className="text-gray-500">শুরু: {new Date(course.starts_on).toLocaleDateString("bn-BD")}</span>
                    )}
                  </div>
                  <div className="text-sm">
                    <span className="line-through text-gray-400 mr-2">
                      ৳{course.price_regular ?? "N/A"}
                    </span>
                    <span className="font-bold text-green-600">
                      ৳{course.price_offer ?? course.price_regular ?? "N/A"}
                    </span>
                  </div>
                  <p className={`text-xs font-medium ${course.is_published ? "text-green-600" : "text-red-500"}`}>
                    {course.is_published ? "✅ প্রকাশিত" : "⏳ অপ্রকাশিত"}
                  </p>
                  <Link
                    href={`/admin/courses/${course.slug}`}
                    className="inline-block mt-2 text-purple-600 hover:underline text-sm font-medium"
                  >
                    বিস্তারিত দেখুন →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
