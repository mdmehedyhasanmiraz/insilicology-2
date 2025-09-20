'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Lock, Calendar, Percent, Ticket } from 'lucide-react';
import { getWorkshopPricing, WorkshopPricing } from '@/utils/workshopPricingUtils';

interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_content: string;
  tags: string[] | null;
  speaker_name: string | null;
  speaker_bio: string | null;
  price_regular: number;
  price_offer: number | null;
  price_earlybirds?: number | null;
  earlybirds_count?: number | null;
  capacity: number | null;
  start_time: string;
  end_time: string;
  status: string;
  banner_image_path: string;
  youtube_url?: string | null;
  group_link?: string | null;
}

// Minimal coupon shape needed for client-side validation
type Coupon = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'amount';
  discount_value: number;
  applies_to: 'any' | 'course' | 'workshop' | 'book' | 'other';
  course_id: string | null;
  workshop_id: string | null;
  min_order_amount: number | null;
};

export default function WorkshopPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [workshopPricing, setWorkshopPricing] = useState<WorkshopPricing | null>(null);
  const [paying, setPaying] = useState(false);
  const [tokenPrefetched, setTokenPrefetched] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push(`/workshops/${params.slug}/enroll`);
        return;
      }

      setUser(session.user);

      const { data: ws, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (error || !ws) {
        toast.error('ওয়ার্কশপ পাওয়া যায়নি! সাপোর্টে যোগাযোগ করুন');
        router.push('/workshops');
        return;
      }

      setWorkshop(ws as Workshop);
      
      // Get workshop pricing with earlybird logic
      const pricing = await getWorkshopPricing(ws.id);
      setWorkshopPricing(pricing);
      
      setLoading(false);

      prefetchBkashToken();
    }

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          router.push(`/workshops/${params.slug}/enroll`);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [params.slug, router, supabase.auth]);

  const prefetchBkashToken = async () => {
    try {
      await axios.post('/api/bkash/refresh-token');
      setTokenPrefetched(true);
    } catch (err) {
      console.log('পেমেন্ট করতে অসুবিধা হচ্ছে! সাপোর্টে যোগাযোগ করুন', err);
    }
  };

  const baseAmount = (() => {
    if (workshopPricing?.currentPrice != null) return workshopPricing.currentPrice;
    if (workshop?.price_regular != null) return Number(workshop.price_regular);
    return 0;
  })();

  const payableAmount = Math.max((baseAmount || 0) - (discountAmount || 0), 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('কুপন কোড লিখুন');
      return;
    }
    if (!workshop) return;

    setApplyingCoupon(true);
    try {
      // Only active and valid coupons are visible due to RLS policy
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, applies_to, course_id, workshop_id, min_order_amount')
        .ilike('code', couponCode.trim())
        .limit(1)
        .single<Coupon>();

      if (error || !coupon) {
        toast.error('কুপনটি অবৈধ বা মেয়াদোত্তীর্ণ');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      // Scope checks
      if (coupon.applies_to === 'course') {
        toast.error('এই কুপনটি শুধুমাত্র কোর্সের জন্য প্রযোজ্য');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }
      if (coupon.applies_to === 'workshop' && coupon.workshop_id !== workshop.id) {
        toast.error('এই কুপনটি এই ওয়ার্কশপে প্রযোজ্য নয়');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }
      if (coupon.applies_to !== 'any' && coupon.applies_to !== 'workshop') {
        toast.error('এই কুপনটি এই পেমেন্টে প্রযোজ্য নয়');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      // Min order amount
      if (coupon.min_order_amount != null && baseAmount < Number(coupon.min_order_amount)) {
        toast.error(`ন্যূনতম ${Number(coupon.min_order_amount).toLocaleString('bn-BD')} টাকা ক্রয়ে প্রযোজ্য`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      // Calculate discount
      let calculatedDiscount = 0;
      if (coupon.discount_type === 'percentage') {
        const percent = Number(coupon.discount_value) / 100;
        calculatedDiscount = Math.round(baseAmount * percent * 100) / 100;
      } else {
        calculatedDiscount = Number(coupon.discount_value);
      }
      calculatedDiscount = Math.min(calculatedDiscount, baseAmount);

      setAppliedCoupon(coupon);
      setDiscountAmount(calculatedDiscount);
      toast.success('কুপন প্রয়োগ হয়েছে');
    } catch (e) {
      console.error(e);
      toast.error('কুপন প্রয়োগ করা যায়নি');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const clearCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
  };

  const startPayment = async () => {
    if (!user) {
      toast.error('পেমেন্ট করার জন্য লগইন করুন');
      return;
    }
    if (!workshop) {
      toast.error('ওয়ার্কশপ তথ্য পাওয়া যায়নি! সাপোর্টে যোগাযোগ করুন');
      return;
    }

    // Guard: bKash requires >= 1
    if (payableAmount < 1) {
      toast.error('ডিসকাউন্টের পরিমাণের কারণে পেমেন্টের ন্যূনতম পরিমাণ ১ টাকা হতে হবে');
      return;
    }

    setPaying(true);
    try {
      // Use the calculated pricing (includes earlybird logic) minus coupon discount
      const amount = payableAmount || baseAmount;
      const { data } = await axios.post('/api/bkash/make-payment', {
        user_id: user.id,
        workshop_id: workshop.id,
        amount,
        email: user.email,
        name: (user.user_metadata?.display_name as string) || (user.email as string),
        phone: '',
        coupon_code: appliedCoupon?.code || null,
        coupon_id: appliedCoupon?.id || null,
        discount_amount: discountAmount || 0,
      }, { timeout: 15000 });

      if (data?.statusCode === 200 && data?.data?.bkashURL) {
        window.location.href = data.data.bkashURL as string;
      } else if (data?.statusCode === 200 && data?.url) {
        window.location.href = data.url as string;
      } else {
        toast.error(data?.statusMessage || data?.error || 'পেমেন্ট শুরু করা যায়নি! সাপোর্টে যোগাযোগ করুন');
      }
    } catch (error: unknown) {
      toast.error('পেমেন্ট শুরু করা যায়নি! সাপোর্টে যোগাযোগ করুন');
      console.log('পেমেন্ট শুরু করা যায়নি! সাপোর্টে যোগাযোগ করুন', error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">লোড হচ্ছে...</p>;
  }

  return (
    <section 
      className="flex flex-col items-center w-full md:w-auto mx-auto pt-12 md:pt-14 pb-20 md:pb-22 px-3 gap-2"
      style={{
        backgroundImage: 'radial-gradient(circle, rgb(240, 238, 233) 1.5px, transparent 1px)',
        backgroundSize: '15px 15px',
      }}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-purple-600">পেমেন্ট করুন</h1>
      </div>

      <div className="w-full bg-white md:max-w-xl mx-auto p-6 border border-gray-200 rounded-2xl shadow-sm my-8">
        <div className="flex items-center gap-2 mb-4">
          {workshop?.banner_image_path ? (
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`} 
              alt={workshop?.title} 
              className="w-16 h-16 rounded-lg object-cover" 
            />
          ) : (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 30%, #ffffff 1px, transparent 1px)', backgroundSize: '18px 18px, 18px 18px' }} />
              <span className="relative text-white/90 font-bold text-[10px] text-center px-1 leading-tight line-clamp-3">{workshop?.title}</span>
            </div>
          )}
          <div className="flex flex-col flex-1 gap-2">
            <h2 className="text-lg md:text-2xl font-bold">{workshop?.title}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-yellow-500 text-white">ওয়ার্কশপ</span>
              {workshop?.start_time && (
                <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-gray-800 text-white inline-flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(workshop.start_time).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka' })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2 justify-between border-y border-gray-200 py-4">
          <span className="font-semibold mt-1">ওয়ার্কশপ ফি:</span>
          <div className="flex flex-col items-end gap-2">
            {workshopPricing && (
              <>
                <div className="flex items-center gap-2">
                  {workshopPricing.originalPrice && workshopPricing.originalPrice > workshopPricing.currentPrice && (
                    <span className="font-bold text-gray-400 line-through text-sm">
                      {workshopPricing.originalPrice.toLocaleString('bn-BD')}
                    </span>
                  )}
                  <span className="font-bold text-lg md:text-xl">
                    ৳{workshopPricing.currentPrice.toLocaleString('bn-BD')}
                  </span>
                </div>
                {workshopPricing.isEarlybird && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      🎯 Earlybird
                    </span>
                    <span className="text-xs text-gray-600">
                      {workshopPricing.earlybirdSpotsLeft} spots left
                    </span>
                  </div>
                )}
                {!workshopPricing.isEarlybird && workshop?.price_offer && workshop.price_offer > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    💥 Special Offer
                  </span>
                )}
              </>
            )}
            {!workshopPricing && (
              <span className="font-bold text-lg md:text-xl">
                ৳{Number(workshop?.price_regular || 0).toLocaleString('bn-BD')}
              </span>
            )}

            {discountAmount > 0 && (
              <div className="text-right text-sm text-gray-700">
                <div>কুপন ডিসকাউন্ট: <span className="font-semibold text-green-700">- ৳{discountAmount.toLocaleString('bn-BD')}</span></div>
                <div>পরিশোধযোগ্য মোট: <span className="font-bold">৳{payableAmount.toLocaleString('bn-BD')}</span></div>
              </div>
            )}
          </div>
        </div>

        {/* Coupon input */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">কুপন কোড (ঐচ্ছিক)</label>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 flex-1 bg-gray-100 rounded-lg px-3">
              <Ticket size={16} className="text-gray-500" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="কুপন লিখুন (যদি থাকে)"
                className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                disabled={!!appliedCoupon}
              />
            </div>
            {!appliedCoupon ? (
              <button
                onClick={applyCoupon}
                disabled={applyingCoupon || !couponCode.trim()}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white disabled:opacity-50 whitespace-nowrap"
              >
                {applyingCoupon ? 'প্রসেসিং...' : 'প্রয়োগ করুন'}
              </button>
            ) : (
              <button
                onClick={clearCoupon}
                className="px-4 py-2 rounded-lg bg-red-100 text-red-700 whitespace-nowrap"
              >
                অপসারণ
              </button>
            )}
          </div>
          {appliedCoupon && (
            <div className="mt-2 text-xs text-green-700 flex items-center gap-1">
              <Percent size={12} />
              কুপন প্রয়োগ হয়েছে: <span className="font-semibold">{appliedCoupon.code}</span>
            </div>
          )}
        </div>

        <div className="space-y-4 mt-6">
          <div className="p-4 bg-green-100 border-l-4 border-green-400 text-green-700">
            <p className="font-medium">✅ আপনি সফলভাবে লগইন করেছেন</p>
            <p className="text-sm mt-1">এখন পেমেন্ট করে ওয়ার্কশপে এনরোল করুন</p>
            {tokenPrefetched && (
              <p className="text-xs mt-1 text-green-600">⚡ পেমেন্ট সিস্টেম প্রস্তুত</p>
            )}
          </div>

          <button
            onClick={startPayment}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 disabled:opacity-50 cursor-pointer font-medium transition-colors"
            disabled={paying}
          >
            {paying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                প্রসেসিং হচ্ছে...
              </div>
            ) : (
              <>
                <img src="/logos/logo-bkash-round.svg" alt="bKash" className="w-6 h-6 inline-block mr-2 rounded-full" /> 
                bKash দিয়ে পেমেন্ট করুন
              </>
            )}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push(`/workshops/${params.slug}/enroll`)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← ফিরে যান
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-2">
        <span className="text-xs text-green-500 flex">
          <Lock className="w-3 h-3 inline-block mr-2" />
          সিকিউরড পেমেন্ট
        </span>
      </div>
      <div className="p-4 w-full md:max-w-xl bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg mx-auto">
        <p className="text-sm text-center">
          💡 bKash পেমেন্টে অসুবিধা হলে আমাদের সাথে যোগাযোগ করুন <b><a href="https://wa.me/8801842221872" className="text-purple-600 hover:underline">০১৮৪২২২১৮৭২</a></b> নম্বরে।
        </p>
      </div>
    </section>
  );
}
