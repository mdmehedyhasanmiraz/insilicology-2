"use client";

import { Button } from "../ui/Button";
import { TopicsProps } from "@/types/course.type";

export default function TopicsSection({ topics }: TopicsProps) {
  if (!topics || topics.length === 0) return null;

  return (
    <section className="flex flex-col items-center max-w-7xl mx-auto py-8 px-3 gap-8">
			{/* Heading and Description */}
			<div className="text-center">
				<div className="flex justify-center mb-4">
					<span className="inline-block px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
						Modules
					</span>
				</div>
				<h2 className="text-3xl sm:text-2xl md:text-4xl font-semibold text-gray-900 mb-4">
					এই কোর্সে যা শিখবেন
				</h2>
				<p className="text-base text-gray-600">
					এই কোর্সে আপনি যা শিখবেন তা নিচের তালিকায় দেখুন।
				</p>
			</div>

			{/* Modern UI Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
				{topics.map((topic, index) => (
					<div
						key={index}
						className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
					>
						{/* Icon */}
						<div className="text-green-500 text-xl mt-1">✓</div>

						{/* Text */}
						<div className="text-base font-medium">{topic}</div>
					</div>
				))}
			</div>

			{/* Modules Download Button */}
			<div className="flex justify-center">
				<Button variant="default" size="lg" href="https://drive.google.com/file/d/1ePOxYHBjGsvSuSbStVAtzbpSOlzCojfx/view?usp=sharing" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all duration-200">
					বিস্তারিত সিলেবাস দেখুন
				</Button>
			</div>
    </section>
  );
}
