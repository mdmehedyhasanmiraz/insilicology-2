'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

export default function BkashButton({ courseId, amount }: { courseId: string; amount: number }) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('দয়া করে লগইন করুন');
        setLoading(false);
        return;
      }

      console.log('Creating payment for:', { user_id: user.id, course_id: courseId, amount });

      const res = await fetch('/api/bkash/make-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          course_id: courseId, 
          amount,
          email: user.email,
          name: user.user_metadata?.display_name || user.email,
          phone: '' // Empty phone - bKash will handle phone input
        }),
      });

      const body = await res.json();
      console.log('Payment creation response:', { status: res.status, body });

      // Check for successful response and redirect URL
      if (res.ok && body?.statusCode === 200 && body?.url) {
        console.log('Redirecting to bKash URL:', body.url);
        // Redirect to bKash payment page
        window.location.href = body.url;
      } else if (res.ok && body?.statusCode === 200 && body?.data?.bkashURL) {
        console.log('Redirecting to bKash URL (fallback):', body.data.bkashURL);
        // Fallback to check data.bkashURL
        window.location.href = body.data.bkashURL;
      } else {
        const errorMessage = body?.statusMessage || body?.error || 'পেমেন্ট শুরু করা যায়নি';
        console.error('Payment creation failed:', errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('পেমেন্ট শুরু করা যায়নি - নেটওয়ার্ক সমস্যা');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={loading}
    >
      {loading ? 'ক্রয় হচ্ছি...' : `৳${amount} দিয়ে কিনুন (bKash)`}
    </button>
  );
}
