// components/HeroSection.tsx
'use client';

import React from "react";
import Link from "next/link";
import { motion } from 'framer-motion';

const HeroSection: React.FC = () => {

  return (
    <section
      className="pt-20 pb-16 text-center max-w-6xl mx-auto relative overflow-hidden px-3"
    >
      {/* Moving background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-15"
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-20"
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-yellow-200 rounded-full opacity-15"
          animate={{
            x: [0, -100, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center space-y-8">
        {/* Centered Content */}
        <div className="space-y-6 flex flex-col items-center justify-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight text-center space-y-4">
            <div className="flex flex-col items-center gap-2">
              <span className="text-gray-800">Bioinformatics</span>
              <span className="text-purple-600">at Next Level</span>
            </div>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl text-center leading-relaxed">
            বিজ্ঞান ও প্রযুক্তির মাধ্যমে আধুনিক শিক্ষা। গবেষণা-ভিত্তিক কোর্সে অংশগ্রহণ করে 
            আপনার ক্যারিয়ারকে এগিয়ে নিন।
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
            <Link href="/courses">
              <button className="group px-10 py-4 cursor-pointer rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
                <span className="flex items-center gap-2">
                  কোর্স দেখুন
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </Link>

            <Link href="/signup">
              <button className="group px-10 py-4 cursor-pointer rounded-2xl border-2 border-purple-600 text-purple-600 font-semibold hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <span className="flex items-center gap-2">
                  শুরু করুন
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
              </button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
