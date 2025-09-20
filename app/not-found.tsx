"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="font-[family-name:var(--font-hind-siliguri)] min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-100 text-center px-6">
      {/* Ghost Image */}
      <div className="animate-float mb-8">
        <Image
          src="/logos/logo-skilltori.svg"
          alt="404"
          width={180}
          height={180}
        />
      </div>

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-semibold text-purple-700 mb-4">দুঃখিত! পৃষ্ঠা খুঁজে পাওয়া যায়নি</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-xl">
        আপনি যে ঠিকানায় যেতে চেয়েছেন তা হয়তো আর নেই অথবা ভুলভাবে টাইপ করা হয়েছে।
      </p>

      {/* Back Button */}
      <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-200">
        হোমপেইজে ফিরে যান
      </Link>

      {/* Shadow floating animation */}
      <style jsx>{`
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% {
            transform: translatey(0px);
          }
          50% {
            transform: translatey(-20px);
          }
          100% {
            transform: translatey(0px);
          }
        }
      `}</style>
    </div>
  );
}
