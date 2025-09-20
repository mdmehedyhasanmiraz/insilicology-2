import { Metadata } from 'next';
import { Suspense } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import WorkshopsPageClient from './WorkshopsPageClient';
import ogImage from '@/public/opengraph-image.png';

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch featured workshop for metadata
  const { data: featuredWorkshop } = await supabase
    .from('workshops')
    .select('title, description, banner_image_path')
    .eq('status', 'published')
    .order('start_time', { ascending: true })
    .limit(1)
    .single();

  const title = 'Workshops - Insilicology';
  const description = featuredWorkshop?.description || 'Discover and join our expert-led workshops to learn new skills and advance your career. Live and recorded workshops available.';
  
  const bannerImageUrl = featuredWorkshop?.banner_image_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${featuredWorkshop.banner_image_path}`
    : ogImage.src;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: 'https://insilicology.org/workshops',
      images: [
        {
          url: bannerImageUrl,
          width: 1200,
          height: 630,
          alt: featuredWorkshop?.title || 'Insilicology Workshops',
        },
      ],
      siteName: 'Insilicology',
      locale: 'bn_BD',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [bannerImageUrl],
    },
    alternates: {
      canonical: 'https://insilicology.org/workshops',
    },
  };
}

export default async function WorkshopsPage() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: workshops } = await supabase
    .from('workshops')
    .select('*')
    .eq('status', 'published')
    .order('start_time', { ascending: true });

  const { data: allTagsData } = await supabase
    .from('workshops')
    .select('tags')
    .eq('status', 'published');

  // Extract all unique tags
  const allTags = new Set<string>();
  allTagsData?.forEach((workshop) => {
    if (workshop.tags) {
      workshop.tags.forEach((tag: string) => allTags.add(tag));
    }
  });

  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <WorkshopsPageClient initialWorkshops={workshops || []} initialTags={Array.from(allTags).sort()} />
    </Suspense>
  );
} 