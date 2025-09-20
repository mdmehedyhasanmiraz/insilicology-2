"use client";

import { TopicsProps } from "@/types/course.type";

export default function TopicsRecorded({ topics }: TopicsProps) {
  return (
    <section className="bg-white py-16 px-6 md:px-10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
          এই কোর্সের সুবিধাসমূহ
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {topics && topics.length > 0 && topics.map((topic, index) => (
            <div
              key={index}
              className="p-5 bg-purple-50 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition"
            >
              <span className="text-purple-600 font-semibold">{index + 1}.</span>{" "}
              {topic}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
