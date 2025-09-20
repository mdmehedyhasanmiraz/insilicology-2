import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import WorkshopEnrollPageClient from './WorkshopEnrollPageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: workshop } = await supabase
    .from('workshops')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!workshop) {
    return {
      title: 'Workshop Not Found',
      description: 'The requested workshop could not be found.',
    };
  }

  const bannerImageUrl = workshop.banner_image_path 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`
    : '/opengraph-image.png';

  return {
    title: `Enroll in ${workshop.title} - Insilicology`,
    description: workshop.description,
    openGraph: {
      title: `Enroll in ${workshop.title}`,
      description: workshop.description,
      images: [
        {
          url: bannerImageUrl,
          width: 1200,
          height: 630,
          alt: workshop.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Enroll in ${workshop.title}`,
      description: workshop.description,
      images: [bannerImageUrl],
    },
  };
}

export default async function WorkshopEnrollPage({ params }: Props) {
  const { slug } = await params;
  const supabase = createServerComponentClient({ cookies });
  
  const { data: workshop } = await supabase
    .from('workshops')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!workshop) {
    notFound();
  }

  return <WorkshopEnrollPageClient />;
} 