import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface WorkshopPricing {
  currentPrice: number;
  originalPrice: number;
  isEarlybird: boolean;
  earlybirdSpotsLeft: number;
  totalEnrollments: number;
}

export async function getWorkshopPricing(workshopId: string): Promise<WorkshopPricing | null> {
  try {
    const supabase = createClientComponentClient();
    
    // Get workshop details
    const { data: workshop, error: workshopError } = await supabase
      .from('workshops')
      .select('price_regular, price_offer, price_earlybirds, earlybirds_count')
      .eq('id', workshopId)
      .single();
    
    if (workshopError || !workshop) {
      console.error('Error fetching workshop:', workshopError);
      return null;
    }
    
    // Get current enrollment count
    const { count: enrollmentCount, error: countError } = await supabase
      .from('user_workshops')
      .select('*', { count: 'exact', head: true })
      .eq('workshop_id', workshopId);
    
    if (countError) {
      console.error('Error fetching enrollment count:', countError);
      return null;
    }
    
    const totalEnrollments = enrollmentCount || 0;
    
    // Determine pricing logic
    let currentPrice = workshop.price_regular;
    let isEarlybird = false;
    let earlybirdSpotsLeft = 0;
    
    // Check if earlybird pricing is available and applicable
    if (workshop.price_earlybirds && 
        workshop.price_earlybirds > 0 && 
        workshop.earlybirds_count && 
        workshop.earlybirds_count > 0) {
      
      // If enrollments are less than earlybird count, apply earlybird pricing
      if (totalEnrollments < workshop.earlybirds_count) {
        currentPrice = workshop.price_offer && workshop.price_offer > 0 
          ? Math.min(workshop.price_offer, workshop.price_earlybirds)
          : workshop.price_earlybirds;
        isEarlybird = true;
        earlybirdSpotsLeft = workshop.earlybirds_count - totalEnrollments;
      }
    }
    
    // If not earlybird, check for regular offer pricing
    if (!isEarlybird && workshop.price_offer && workshop.price_offer > 0) {
      currentPrice = workshop.price_offer;
    }
    
    return {
      currentPrice,
      originalPrice: workshop.price_regular,
      isEarlybird,
      earlybirdSpotsLeft,
      totalEnrollments
    };
  } catch (error) {
    console.error('Error getting workshop pricing:', error);
    return null;
  }
}

export function formatPrice(price: number): string {
  return `৳${price.toLocaleString('bn-BD')}`;
}

export function getPriceDisplayText(pricing: WorkshopPricing): {
  mainPrice: string;
  originalPrice?: string;
  badge?: string;
  description?: string;
} {
  const result = {
    mainPrice: formatPrice(pricing.currentPrice),
    originalPrice: undefined as string | undefined,
    badge: undefined as string | undefined,
    description: undefined as string | undefined
  };
  
  if (pricing.isEarlybird) {
    result.badge = '🎯 Earlybird';
    result.description = `${pricing.earlybirdSpotsLeft} spots left`;
    
    if (pricing.currentPrice < pricing.originalPrice) {
      result.originalPrice = formatPrice(pricing.originalPrice);
    }
  } else if (pricing.currentPrice < pricing.originalPrice) {
    result.badge = '💥 Offer';
    result.originalPrice = formatPrice(pricing.originalPrice);
  }
  
  return result;
}
