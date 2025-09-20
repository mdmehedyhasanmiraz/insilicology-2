import { Metadata } from 'next';

interface WorkshopMetadataProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: WorkshopMetadataProps): Promise<Metadata> {
  // Fetch workshop data for metadata
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      title: 'Workshop - Insilicology',
      description: 'Learn new skills with our workshops',
    };
  }

  try {
    // Create Supabase client with service role key for server-side access
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: workshop, error } = await supabase
      .from('workshops')
      .select('title, description, banner_image_path, speaker_name')
      .eq('slug', params.slug)
      .eq('status', 'published')
      .single();

    if (error || !workshop) {
      return {
        title: 'Workshop Not Found - Insilicology',
        description: 'The requested workshop could not be found.',
      };
    }

    const title = `${workshop.title} - Insilicology`;
    const description = workshop.description || `Join our workshop on ${workshop.title}`;
    const imageUrl = workshop.banner_image_path 
      ? `${supabaseUrl}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`
      : undefined;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://insilicology.org/workshops/${params.slug}`,
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: workshop.title,
          }
        ] : undefined,
        siteName: 'Insilicology',
        locale: 'bn_BD',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
      alternates: {
        canonical: `https://insilicology.org/workshops/${params.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating workshop metadata:', error);
    return {
      title: 'Workshop - Insilicology',
      description: 'Learn new skills with our workshops',
    };
  }
}
