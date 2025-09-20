// components/MarqueeTags.tsx
'use client';

import Marquee from 'react-fast-marquee';

export default function MarqueeTags() {
  const tags = [
    'Web Development',
    'SEO',
    'Logo Design',
    'SMM',
    'Email Marketing',
    'Brand Strategy',
    'UI/UX Design',
    'Copywriting',
    'Facebook Marketing',
    'Graphic Design',
  ];

  return (
    <div className="w-full overflow-hidden">
      <Marquee
        gradient={true}
        gradientWidth={50}
        speed={40}
        className="w-full"
      >
        <div className="flex gap-2 items-center flex-nowrap mr-2">
          {tags.map((tag, idx) => (
            <div
              key={idx}
              className="text-gray-700 text-sm whitespace-nowrap px-4 py-1 rounded-full border border-gray-300 bg-white"
            >
              {tag}
            </div>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
