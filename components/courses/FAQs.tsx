"use client";

import React, { useState } from "react";
import { FAQSectionProps } from "@/types/course.type";

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="flex flex-col items-center max-w-7xl mx-auto py-8 px-3 gap-8">
      {/* Heading and Description */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            FAQs
          </span>
        </div>
        <h2 className="text-3xl sm:text-2xl md:text-4xl font-semibold text-gray-900 mb-4">
          কোর্স সম্পর্কে জিজ্ঞাসা
        </h2>
        <p className="text-base text-gray-600">
          কোর্স সম্পর্কে জিজ্ঞাসা থাকলে নিচের প্রশ্নগুলো পড়ুন।
        </p>
      </div>

      {/* FAQ List */}
      <div className="w-full md:max-w-3xl">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleFAQ(index)}
              className="flex justify-between items-center w-full text-left font-semibold text-gray-900 py-4 cursor-pointer"
            >
              {faq.question}
              <span className="text-gray-500 cursor-pointer">
                {openIndex === index ? "−" : "+"}
              </span>
            </button>
            {openIndex === index && (
              <div
                className="text-gray-600 mb-4 whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
