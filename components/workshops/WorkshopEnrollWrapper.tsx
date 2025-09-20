'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import WorkshopEnrollForm from './WorkshopEnrollForm';
import AcademicWorkshopEnrollForm from './AcademicWorkshopEnrollForm';
import { getWorkshopPricing, WorkshopPricing } from '@/utils/workshopPricingUtils';

interface Workshop {
  id: string;
  title: string;
  slug: string;
  category?: string;
  pricing?: WorkshopPricing;
}

export default function WorkshopEnrollWrapper() {
  const params = useParams();
  const supabase = createClientComponentClient();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkshop() {
      try {
        const { data: workshopData, error } = await supabase
          .from('workshops')
          .select('id, title, slug, category')
          .eq('slug', params.slug)
          .eq('status', 'published')
          .single();

        if (error || !workshopData) {
          console.error('Error loading workshop:', error);
          return;
        }

        // Get workshop pricing with earlybird logic
        const pricing = await getWorkshopPricing(workshopData.id);
        
        setWorkshop({
          ...workshopData,
          pricing: pricing || undefined
        });
      } catch (error) {
        console.error('Error loading workshop:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkshop();
  }, [params.slug, supabase]);

  if (loading) {
    return <p className="p-6 text-center">লোড হচ্ছে...</p>;
  }

  if (!workshop) {
    return <p className="p-6 text-center">ওয়ার্কশপ পাওয়া যায়নি</p>;
  }

  // Render academic form for academic workshops
  if (workshop.category === 'academic') {
    return <AcademicWorkshopEnrollForm workshopPricing={workshop.pricing} />;
  }

  // Render regular form for all other workshops
  return <WorkshopEnrollForm workshopPricing={workshop.pricing} />;
}
