'use client'

import Link from 'next/link'
import { MessageCircle, Bot } from 'lucide-react'

export default function SupportSection() {
  return (
    <div className="p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">সাপোর্ট সেন্টার</h1>

      <div className="space-y-6">
        {/* AI Agent Support Box */}
        <div className="bg-white border border-transparent hover:border-purple-300 shadow-sm hover:shadow-lg transition rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="bg-purple-100 text-purple-800 p-4 rounded-full">
            <Bot size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">এআই এজেন্টের মাধ্যমে দ্রুত সহায়তা</h2>
            <p className="text-gray-700 mb-4">
              সাধারণ প্রশ্ন বা টেকনিক্যাল সমস্যার সমাধান এখনই পেতে আমাদের এআই সহকারীকে মেসেজ দিন।
              এটি ২৪/৭ কাজ করে এবং দ্রুততম সময়ে উত্তর দেয়।
            </p>
            <Link
              href="https://wa.me/8801842221872?text=Hi!%20I%20need%20support%20from%20AI"
              target="_blank"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm px-4 py-2 rounded"
            >
              এআই সহকারীর সাথে চ্যাট করুন
            </Link>
          </div>
        </div>

        {/* Human Support Box */}
        <div className="bg-white border border-transparent hover:border-green-300 shadow-sm hover:shadow-lg transition rounded-xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="bg-green-100 text-green-800 p-4 rounded-full">
            <MessageCircle size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">মানব সহকারীর মাধ্যমে ব্যক্তিগত সহায়তা</h2>
            <p className="text-gray-700 mb-4">
              যদি আপনার জটিল কোনো প্রশ্ন থাকে বা এআই এজেন্টে সমাধান না পান, তাহলে আমাদের
              রিয়েল হিউম্যান সাপোর্ট টিমের সাথে যোগাযোগ করুন।
            </p>
            <Link
              href="https://wa.me/8801842221872?text=Hi!%20I%20want%20to%20talk%20to%20a%20human%20support%20agent"
              target="_blank"
              className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded"
            >
              হিউম্যান সাপোর্টে মেসেজ করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
