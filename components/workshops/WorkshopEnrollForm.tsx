'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Lock, Mail, Eye, EyeOff, Calendar } from 'lucide-react';
import { loginWithEmail } from '@/app/(auth)/login/actions';
import { signupWithEmail } from '@/app/(auth)/signup/actions';
import { WorkshopPricing } from '@/utils/workshopPricingUtils';
import Link from 'next/link';

interface Workshop {
  id: string;
  title: string;
  slug: string;
  description: string;
  full_content: string;
  tags: string[];
  speaker_name: string;
  speaker_bio: string;
  price_regular: number;
  price_offer: number;
  price_earlybirds?: number;
  earlybirds_count?: number;
  capacity: number;
  start_time: string;
  end_time: string;
  status: string;
  banner_image_path: string;
  youtube_url?: string;
  group_link?: string;
}

interface WorkshopEnrollFormProps {
  workshopPricing?: WorkshopPricing;
}

export default function WorkshopEnrollForm({ workshopPricing }: WorkshopEnrollFormProps) {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [paying, setPaying] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ 
    email: '', 
    phone: '',
    password: '', 
    confirmPassword: '' 
  });
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // If already authenticated, go directly to pay route
        router.push(`/workshops/${params.slug}/enroll/pay`);
        return;
      }

      const { data: workshopData, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('slug', params.slug)
        .eq('status', 'published')
        .single();

      if (error || !workshopData) {
        toast.error('ওয়ার্কশপ পাওয়া যায়নি।');
        router.push('/workshops');
        return;
      }

      setWorkshop(workshopData);
      setLoading(false);
    }

    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          // Redirect to pay route after successful login/signup
          router.push(`/workshops/${params.slug}/enroll/pay`);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [params.slug, router, supabase.auth]);

  const handleLoginInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
    // Clear password error when user starts typing
    if (passwordError) {
      setPasswordError(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const { error } = await loginWithEmail(loginForm);

      if (error) {
        toast.error(error.message || 'দুঃখিত, আবার চেষ্টা করুন');
      } else {
        toast.success('লগইন সফলভাবে সম্পন্ন হয়েছে');
        // Redirect to pay route immediately after login
        router.push(`/workshops/${params.slug}/enroll/pay`);
      }
    } catch (error) {
      toast.error('লগইনে সমস্যা হয়েছে');
      console.log(error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setPasswordError(true);
      toast.error("পাসওয়ার্ড মেলেনি। অনুগ্রহ করে মিলিয়ে দেখুন।");
      return;
    }

    setPasswordError(false);
    setSignupLoading(true);

    try {
      const { error } = await signupWithEmail({
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone,
      });

      if (error) {
        toast.error(error.message || 'দুঃখিত, আবার চেষ্টা করুন');
      } else {
        // Try immediate sign-in so we can access pay page
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: signupForm.email,
          password: signupForm.password,
        });
        if (signInError) {
          toast.success('একাউন্ট তৈরি হয়েছে। দয়া করে ইমেইল নিশ্চিত করুন।');
        } else if (signInData?.user) {
          toast.success('সাইনআপ সম্পন্ন হয়েছে');
          router.push(`/workshops/${params.slug}/enroll/pay`);
          return;
        }
        // If not signed in (e.g., email confirmation required), still attempt redirect
        router.push(`/workshops/${params.slug}/enroll/pay`);
      }
    } catch (error) {
      toast.error('সাইনআপে সমস্যা হয়েছে');
      console.log(error);
    } finally {
      setSignupLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/workshops/${params.slug}/enroll/pay`)}`,
        },
      });

      console.log(data);

      if (error) {
        toast.error(error.message || 'দুঃখিত, আবার চেষ্টা করুন');
        console.log(error);
      }
    } catch (error) {
      toast.error('Google লগইনে সমস্যা হয়েছে');
      console.log(error);
    }
  };

  const startPayment = async () => {
    if (!user) {
      toast.error('পেমেন্ট করার জন্য লগইন করুন');
      return;
    }

    if (!workshop) {
      toast.error('ওয়ার্কশপ তথ্য পাওয়া যায়নি');
      return;
    }

    setPaying(true);

    try {
      // Use earlybird pricing if available, otherwise fall back to regular logic
      const amount = workshopPricing?.currentPrice || 
        Number(workshop.price_offer && workshop.price_offer > 0 ? workshop.price_offer : workshop.price_regular);
      
      console.log('Starting bKash payment with:', {
        user_id: user.id,
        workshop_id: workshop.id,
        amount,
        email: user.email,
        name: user.user_metadata?.display_name || user.email,
      });

      const { data } = await axios.post('/api/bkash/make-payment', {
        user_id: user.id,
        workshop_id: workshop.id,
        amount,
        email: user.email,
        name: user.user_metadata?.display_name || user.email,
        phone: '', // Empty phone - bKash will handle phone input
      });

      console.log('bKash payment response:', data);

      // Check for successful response and redirect URL
      if (data?.statusCode === 200 && data?.url) {
        console.log('Redirecting to bKash URL:', data.url);
        // Redirect to bKash payment page
        window.location.href = data.url;
      } else if (data?.statusCode === 200 && data?.data?.bkashURL) {
        console.log('Redirecting to bKash URL (fallback):', data.data.bkashURL);
        // Fallback to check data.bkashURL
        window.location.href = data.data.bkashURL;
      } else {
        console.error('bKash payment failed:', data);
        toast.error(data?.statusMessage || data?.error || 'পেমেন্ট শুরু করা যায়নি');
      }
    } catch (error) {
      console.error('bKash payment exception:', error);
      toast.error('পেমেন্ট শুরু করা যায়নি');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <p className="p-6 text-center">লোড হচ্ছে...</p>;
  }

  return (
    <div className="w-full bg-white md:max-w-xl mx-auto p-6 border border-gray-200 rounded-2xl shadow-sm my-8">
      <div className="flex items-center gap-2 mb-4">
        {workshop?.banner_image_path ? (
          <img 
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${workshop.banner_image_path}`} 
            alt={workshop?.title} 
            className="w-16 h-16 rounded-lg object-cover" 
          />
        ) : (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 relative flex items-center justify-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 30%, #ffffff 1px, transparent 1px)", backgroundSize: "18px 18px, 18px 18px" }} />
            <span className="relative text-white/90 font-bold text-[10px] text-center px-1 leading-tight line-clamp-3">{workshop?.title}</span>
          </div>
        )}
        <div className="flex flex-col flex-1 gap-2">
          <h2 className="text-lg md:text-2xl font-bold">{workshop?.title}</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-yellow-500 text-white">ওয়ার্কশপ</span>
            <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-gray-800 text-white">স্পিকার: {workshop?.speaker_name}</span>
            {workshop?.start_time && (
              <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-gray-100 text-gray-800 inline-flex items-center gap-1">
                <Calendar size={12} />
                {new Date(workshop.start_time).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Dhaka' })}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-between border-y border-gray-200 py-4">
        <span className="font-semibold">ওয়ার্কশপ ফি:</span>
        <div className="flex items-center gap-2">
          {workshop?.price_regular === 0 ? (
            <span className="font-bold text-lg md:text-xl text-green-600">বিনামূল্যে</span>
          ) : workshop?.price_offer && workshop.price_offer > 0 ? (
            <>
              <span className="font-bold text-gray-400 line-through">৳{Number(workshop?.price_regular).toLocaleString('bn-BD')}</span>
              <span className="font-bold text-lg md:text-xl">৳{Number(workshop?.price_offer).toLocaleString('bn-BD')}</span>
            </>
          ) : (
            <span className="font-bold text-lg md:text-xl">৳{Number(workshop?.price_regular).toLocaleString('bn-BD')}</span>
          )}
        </div>
      </div>

      {!user ? (
        <div className="mt-6">
          {!showAuthForm ? (
            <div className="p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700">
              <p>আপনি লগইন করেননি। পেমেন্ট করতে লগইন করুন।</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {/* Auth Mode Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'login'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  লগইন করুন
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'signup'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  একাউন্ট খুলুন
                </button>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={handleGoogleSignIn}
                className="w-full bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <img src="/logos/logo-google.svg" alt="Google" className="w-5 h-5" />
                Google দিয়ে {authMode === 'login' ? 'লগইন করুন' : 'একাউন্ট খুলুন'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">অথবা</span>
                </div>
              </div>

              {/* Login Form */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                    <div className="flex items-center bg-gray-100 rounded-lg px-3">
                      <Mail className="text-gray-500" size={18} />
                      <input
                        type="email"
                        name="email"
                        placeholder="আপনার ইমেইল লিখুন"
                        value={loginForm.email}
                        onChange={handleLoginInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                    <div className="flex items-center bg-gray-100 rounded-lg px-3 relative">
                      <Lock className="text-gray-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                        value={loginForm.password}
                        onChange={handleLoginInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {loginLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
                  </button>
                </form>
              )}

              {/* Signup Form */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নম্বর</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="আপনার মোবাইল নম্বর লিখুন"
                      value={signupForm.phone}
                      onChange={handleSignupInput}
                      pattern="^(\+?88)?01[3-9]\d{8}$"
                      title="Valid BD number: 01XXXXXXXXX"
                      required
                      className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                    <div className="flex items-center bg-gray-100 rounded-lg px-3">
                      <Mail className="text-gray-500" size={18} />
                      <input
                        type="email"
                        name="email"
                        placeholder="আপনার ইমেইল লিখুন"
                        value={signupForm.email}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
                    <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                      <Lock className="text-gray-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="আপনার পাসওয়ার্ড লিখুন"
                        value={signupForm.password}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড আবার লিখুন</label>
                    <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                      <Lock className="text-gray-500" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="আপনার পাসওয়ার্ড আবার লিখুন"
                        value={signupForm.confirmPassword}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={signupLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                  >
                    {signupLoading ? "একাউন্ট খোলা হচ্ছে..." : "একাউন্ট খুলুন"}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← ফিরে যান
                </button>
                <div className="mt-2">
                  <Link 
                    href={`/login?next=${encodeURIComponent(window.location.pathname)}`}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    সম্পূর্ণ লগইন পেজে যান
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <button
            onClick={startPayment}
            className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50 cursor-pointer"
            disabled={paying}
          >
            {paying ? 'প্রসেসিং হচ্ছে...' : <><img src="/logos/logo-bkash-round.svg" alt="bKash" className="w-6 h-6 inline-block mr-2 rounded-full" /> bKash দিয়ে পেমেন্ট করুন</>}
          </button>
        </div>
      )}
    </div>
  );
} 