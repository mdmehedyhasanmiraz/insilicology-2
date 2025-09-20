"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "কিভাবে আমি একাউন্ট তৈরি করবো?",
    answer: (
      <>
        আপনি আমাদের <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">সাইন আপ পেজ</a> থেকে খুব সহজেই একাউন্ট তৈরি করতে পারেন।
      </>
    ),
  },
  {
    question: "ভর্তি হওয়ার জন্য পেমেন্ট কিভাবে করবো?",
    answer: "আপনি আমাদের কোর্স পেজে যান এবং ভর্তি হওয়ার জন্য পেমেন্ট করতে পারবেন।",
  },
  {
    question: "সাপোর্টের সময়সূচী কী?",
    answer: "আমাদের সাপোর্ট সপ্তাহে ৭ দিন, সকাল ১০টা থেকে রাত ১০টা পর্যন্ত চালু থাকে।",
  },
  {
    question: "আমি কি আমার তথ্য পরবর্তীতে পরিবর্তন করতে পারবো?",
    answer: "হ্যাঁ, আপনি আপনার প্রোফাইল থেকে যেকোনো সময় তথ্য পরিবর্তন করতে পারবেন।",
  },
  {
    question: "কোনো সমস্যা হলে আমি কার সাথে যোগাযোগ করবো?",
    answer: (
      <>
        সমস্যা হলে আমাদের <a href="/contact" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">যোগাযোগ পেজ</a> থেকে টিকিট সাবমিট করুন বা সরাসরি চ্যাটে বার্তা দিন।
      </>
    ),
  },
  {
    question: "আপনাদের কোর্স কি শুধুমাত্র বাংলাদেশে সীমাবদ্ধ?",
    answer: "না, আমাদের কোর্সসমূহ পৃথিবীর যেকোনো দেশে বসেই করতে পারবেন।",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-24 bg-gradient-to-br from-gray-50 to-white px-3" id="faq">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading and Description */}
        <div className="text-center mb-20">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            আপনার প্রশ্ন, আমাদের উত্তর
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
            আমাদের সেবা ও প্ল্যাটফর্ম সম্পর্কে সাধারণ কিছু প্রশ্নের উত্তর নিচে দেয়া হলো।
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="flex justify-between items-center w-full text-left p-6 cursor-pointer group hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <HelpCircle className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 text-lg group-hover:text-purple-600 transition-colors">
                        {faq.question}
                      </h3>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Answer Panel */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-gray-700 leading-relaxed text-base">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Help Section */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                আরও প্রশ্ন আছে?
              </h3>
              <p className="text-gray-600 mb-6">
                আপনার প্রশ্নের উত্তর না পেলে আমাদের সাথে সরাসরি যোগাযোগ করুন
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  যোগাযোগ করুন
                </a>
                <a
                  href="https://wa.me/8801842221872"
                  className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  WhatsApp এ মেসেজ করুন
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
