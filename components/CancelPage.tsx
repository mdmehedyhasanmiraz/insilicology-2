"use client";

import Link from "next/link";
import Image from "next/image";

export default function CancelPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 px-4">
			<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center">
				<Image
					src="https://insilicology.org/opengraph-image.webp"
					alt="Cancel Illustration"
					width={180}
					height={180}
					className="mb-6 rounded-xl shadow-md"
				/>
				<h1 className="text-2xl md:text-3xl font-bold text-pink-600 mb-2 text-center">পেমেন্ট বাতিল হয়েছে</h1>
				<p className="text-gray-600 text-center mb-6">
					আপনার পেমেন্টটি বাতিল করা হয়েছে বা সম্পন্ন হয়নি।
					<br />
					যদি এটি ভুলবশত হয়ে থাকে, দয়া করে আবার চেষ্টা করুন।
				</p>
				<Link
					href="/"
					className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors duration-200"
				>
					হোমপেজে ফিরে যান
				</Link>
				<div className="mt-6 text-xs text-gray-400 text-center">
					কোনো সমস্যার জন্য <a href="https://wa.me/8801842221872" className="text-purple-500 hover:underline">সাপোর্টে যোগাযোগ করুন</a>
				</div>
			</div>
		</div>
	);
} 