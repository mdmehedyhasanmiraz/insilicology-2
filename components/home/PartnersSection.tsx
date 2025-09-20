"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";

const partners = [
  { name: "OIMI", logo: "/logos/logo-oimi.svg" },
  { name: "Floramedix", logo: "/logos/logo-floramedix.svg" },
  { name: "Testwhiz", logo: "/logos/logo-testwhiz.svg" },
  { name: "Dresli", logo: "/logos/logo-dresli.webp" },
];

export default function PartnersSection() {
  return (
    <section 
      className="py-20 md:py-24 bg-gradient-to-br from-gray-100 to-gray-50 px-3"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgb(255, 255, 255) 1.5px, transparent 1px)",
        backgroundSize: "15px 15px",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          আমাদের পার্টনার
        </h2>
        <p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto leading-relaxed">
          আমাদের স্ট্র্যাটেজিক পার্টনার হিসেবে রয়েছে দেশ ও বিশ্বের বিভিন্ন প্রতিষ্ঠান।
        </p>

        {/* Marquee */}
        <Marquee
          gradient={true}
          gradientColor="oklch(96.7% 0.003 264.542)"
          speed={40}
          pauseOnHover={false}
          className="overflow-hidden"
          autoFill={true}
        >
          {partners.map((partner, index) => (
            <div key={index} className="mx-8 flex transition-all duration-300 items-center justify-center h-16">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={120}
                height={20}
                className="object-contain h-7 w-auto transition-all duration-300"
              />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
