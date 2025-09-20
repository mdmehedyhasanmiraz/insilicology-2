"use client";

import Image from "next/image";
import Link from "next/link";
import { HeroRecordedProps } from "@/types/course.type";

export default function HeroRecorded({
  title,
  description,
  poster,
  enrollLink,
  startsOn,
}: HeroRecordedProps) {
  return (
    <section className="bg-gradient-to-br from-purple-50 to-white py-16 px-6 md:px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        {/* Content */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {description}
          </p>

          {startsOn && (
            <p className="text-sm text-gray-600 mb-4">
              📅 শুরু হচ্ছে: <strong>{startsOn}</strong>
            </p>
          )}

					{enrollLink && (
						<Link
							href={enrollLink}
							target="_blank"
							className="inline-block bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition"
						>
							এখনই এনরোল করুন
						</Link>
					)}
        </div>

        {/* Poster */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-xl">
          {poster && (
            <Image
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${poster}`}
              alt={title}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
      </div>
    </section>
  );
}
