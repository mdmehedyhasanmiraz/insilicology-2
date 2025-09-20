import Image from 'next/image';
import { Star } from 'lucide-react';

type Review = {
  name: string;
  role: string;
  quote: string;
  platform: 'Facebook' | 'X' | 'Google' | 'Trustpilot' | 'WhatsApp';
  logo: string; // path to /public/logos/icon-___.svg
  rating?: number; // 1-5
  avatar?: string; // optional path to /public/images/reviewer-_.webp
};

const reviews: Review[] = [
  {
    name: 'SH Ashik',
    role: '',
    quote: 'Both their courses & Bioinformatics service are great. Highly Recommended 👍',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Shakeel Hoosdally',
    role: '',
    quote: 'One of the best trusted provider here. Highly recommended. Price very good compared to others',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Nafisa Akter',
    role: '',
    quote: 'I am extremely satisfied with the service provided by the host. They were able to deliver the service exactly as I requested and desired. She also provided quick and excellent responses.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'MD Tamim Iqbal',
    role: '',
    quote: 'Truly impressed in DATA VISUALIZATION, showcasing incredible ATTENTION TO DETAILS and a level of PROFESSIONALISM that exceeded expectations.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Joty Akter',
    role: '',
    quote: 'I had very good experience with my orders. I recommend!',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Angel Lamiya',
    role: '',
    quote: 'They helped me with a full workflow—from docking to DFT. Great experience overall.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Mina Akter',
    role: '',
    quote: 'Support team responded quickly when I got stuck. That made a big difference.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Parvin Akter',
    role: '',
    quote: 'Five stars for the DFT course! It has significantly boosted my publication prospects.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'Shahriar Shresto',
    role: '',
    quote: 'They are reliable... you may consider their service without worries.',
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
  {
    name: 'M S A Sakib',
    role: '',
    quote: "Unlock the complexities of computational biology with Insilicology. As your go-to learning companion, it'll illuminate your in-silico skills on life science. Don't regret later...stay connected! 😉",
    platform: 'Facebook',
    logo: '/logos/logo-facebook.svg',
    rating: 5,
    avatar: '',
  },
];


// Helper function to render quote with line breaks
const renderQuote = (quote: string) => {
  // Split by <br/> tags and filter out empty strings
  const parts = quote.split(/<br\s*\/?>/i).filter(part => part.trim() !== '');
  
  if (parts.length === 1) {
    // Single line quote
    return <span>{parts[0]}</span>;
  }
  
  // Multi-line quote
  return (
    <>
      {parts.map((part, index) => (
        <span key={index}>
          {part.trim()}
          {index < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="px-3 py-20 md:py-24 bg-gradient-to-br from-slate-200 via-blue-200 to-purple-200" id="testimonials">
      <div className="max-w-6xl mx-auto px-2 md:px-0">
        {/* Heading and Description */}
        <div className="text-center mb-16">
          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            আমাদের সম্পর্কে মতামত
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
            আমাদের সেবা ও প্ল্যাটফর্ম সম্পর্কে সাধারণ কিছু প্রশ্নের উত্তর নিচে দেয়া হলো।
          </p>
        </div>

        {/* Masonry using CSS columns */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {reviews.map((r, idx) => (
            <div key={idx} className="mb-6 break-inside-avoid">
              <div className="h-full rounded-3xl border border-gray-100 bg-white p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {r.avatar ? (
                      <Image
                        src={r.avatar}
                        alt={`${r.name} avatar`}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold">
                        {r.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.role}</p>
                    </div>
                  </div>
                  <Image src={r.logo} alt={r.platform} width={24} height={24} className="opacity-80" />
                </div>

                <div className="my-2 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    r.rating ? (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-amber-200 text-amber-400' : 'text-gray-300'}`} />
                    ) : ('')
                  ))}
                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  &quot;{renderQuote(r.quote)}&quot;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


