
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type HeroProps = { courseSlug: string };

export default async function Hero({ courseSlug }: HeroProps) {
  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", courseSlug)
    .single();

  if (!course || error) {
    return <section className="py-10 text-center text-red-600">কোর্স পাওয়া যায়নি।</section>;
  }

  return (
    <>
      <div className="md:hidden sticky top-16 bg-white px-3 py-2 z-10">
        <Link
          href={`/courses/${course.slug}/enroll`}
          className="block w-full text-center bg-red-500 text-white font-medium py-2 rounded-md hover:bg-red-600 transition"
        >
          এখনই ভর্তি হোন
        </Link>
      </div>
      <section className="grid grid-cols-1 md:grid-cols-2 pt-0 md:pt-10 pb-8 items-center gap-10 px-3 md:px-2">
        <div className="w-full md:max-w-sm md:mx-auto">
          <Image
            src={course.poster}
            alt={`${course.title} Poster`}
            width={320}
            height={320}
            className="rounded-lg object-cover w-full"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div className="space-y-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-full">
                {course.type}
              </span>
              <span className="inline-block mt-2 px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-full">
                {course.duration}
              </span>
            </div>
          </div>
          <p className="text-gray-600 text-center md:text-left max-w-xl whitespace-pre-line">
            {course.hero_description}
          </p>
          <div className="hidden md:block">
            <Link
              href={`/courses/${course.slug}/enroll`}
              className="inline-block px-6 py-3 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition"
            >
              এখনই ভর্তি হোন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
