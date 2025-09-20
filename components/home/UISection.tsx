'use client';

import Image from 'next/image';
import MarqueeTags from './MarqueeTags';

export default function UISection() {
  return (
    <section className="py-20 md:py-24 text-center bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-3">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          আপনার শেখার যাত্রা এখান থেকেই শুরু
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          দক্ষতা অর্জনের জন্য আর অপেক্ষা নয়। আধুনিক UI, এক্সাম সিস্টেম, প্রোগ্রেস ট্র্যাকিং – সব একসাথে একটি প্ল্যাটফর্মে।
        </p>
        <div className="mt-8 max-w-xs md:max-w-2xl mb-8 mx-auto">
          <MarqueeTags />
        </div>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="overflow-hidden max-w-4xl mx-auto rounded-2xl shadow-xl">
            <Image
              src="/images/ui-demo.webp"
              alt="Platform UI"
              width={1200}
              height={800}
              className="w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
