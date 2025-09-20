'use client';

import React from 'react';

const stats = [
  {
    number: "1100+",
    label: "শিক্ষার্থী"
  },
  {
    number: "10+",
    label: "প্রশিক্ষক"
  },
  {
    number: "5+",
    label: "ওয়ার্কশপ"
  },
  {
    number: "4+",
    label: "কোর্স"
  }
];

const StatsSection: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="relative">
                <div className="text-4xl md:text-5xl font-thin text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="text-sm text-gray-600 font-medium tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
