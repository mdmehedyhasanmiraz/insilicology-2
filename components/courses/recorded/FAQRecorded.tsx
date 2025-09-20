"use client";

import { useState } from "react";
import { FAQSectionProps } from "@/types/course.type";

export default function FAQRecorded({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-6 md:px-10 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-10">
          সাধারণ প্রশ্নোত্তর
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-5">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left font-semibold text-gray-900 flex justify-between items-center"
              >
                {faq.question}
                <span className="text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              <div
                className={`mt-3 text-gray-700 text-sm leading-relaxed transition-all duration-300 ${
                  openIndex === index ? "block" : "hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
