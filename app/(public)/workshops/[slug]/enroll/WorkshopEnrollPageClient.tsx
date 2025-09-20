"use client";

import { Lock } from 'lucide-react';
import WorkshopEnrollWrapper from '@/components/workshops/WorkshopEnrollWrapper';

export default function WorkshopEnrollPageClient() {
  return (
    <section 
      className="flex flex-col items-center w-full md:w-auto mx-auto pt-12 md:pt-14 pb-20 md:pb-22 px-3 gap-2"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(240, 238, 233) 1.5px, transparent 1px)",
        backgroundSize: "15px 15px",
      }}
    >
      {/* <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-purple-600">পেমেন্ট করুন</h1>
      </div> */}
      
      <WorkshopEnrollWrapper />
      
      <div className="flex justify-center pt-2">
        <span className="text-xs text-green-500 flex"><Lock className="w-3 h-3 inline-block mr-2" />সিকিউরড পেমেন্ট</span>
      </div>
      <div className="p-4 w-full md:max-w-xl bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg mx-auto">
        <p className="text-sm text-center">
          💡 bKash পেমেন্টে অসুবিধা হলে আমাদের সাথে যোগাযোগ করুন <b><a href="https://wa.me/8801842221872" className="text-purple-600 hover:underline">০১৮৪২২২১৮৭২</a></b> নম্বরে।
        </p>
      </div>
    </section>
  );
}
