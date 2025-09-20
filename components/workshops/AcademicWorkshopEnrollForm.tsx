'use client';

import { useParams } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Lock, Mail, Eye, EyeOff, Calendar, GraduationCap, Building, CalendarDays, Clock } from 'lucide-react';
import { loginWithEmail } from '@/app/(auth)/login/actions';
import { signupWithEmail } from '@/app/(auth)/signup/actions';
import { ensureUserProfile } from '@/utils/userProfileUtils';
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
  category?: string;
}

interface AcademicWorkshopEnrollFormProps {
  workshopPricing?: WorkshopPricing;
}

export default function AcademicWorkshopEnrollForm({ workshopPricing }: AcademicWorkshopEnrollFormProps) {
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
    fullName: '',
    email: '', 
    phone: '',
    password: '', 
    confirmPassword: '',
    university: '',
    department: '',
    academic_year: '',
    academic_session: ''
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

      // Verify this is an academic workshop
      if (workshopData.category !== 'academic') {
        toast.error('এই ওয়ার্কশপটি একাডেমিক নয়।');
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
        fullName: signupForm.fullName,
        university: signupForm.university,
        department: signupForm.department,
        academic_year: signupForm.academic_year,
        academic_session: signupForm.academic_session,
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
          // If sign-in fails (e.g., email confirmation required), ensure profile is created
          toast.success('একাউন্ট তৈরি হয়েছে। দয়া করে ইমেইল নিশ্চিত করুন।');
          
          // Try to create/update user profile with academic information
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              const { success, error: profileError } = await ensureUserProfile({
                id: user.id,
                email: user.email!,
                name: signupForm.fullName,
                whatsapp: signupForm.phone,
                university: signupForm.university,
                department: signupForm.department,
                academic_year: signupForm.academic_year,
                academic_session: signupForm.academic_session,
              });
              
              if (!success) {
                console.error('Profile creation failed:', profileError);
              }
            }
          } catch (profileErr) {
            console.error('Profile creation error:', profileErr);
          }
        } else if (signInData?.user) {
          toast.success('সাইনআপ সম্পন্ন হয়েছে');
          
          // Ensure profile is created/updated with academic information
          try {
            const { success, error: profileError } = await ensureUserProfile({
              id: signInData.user.id,
              email: signInData.user.email!,
              name: signupForm.fullName,
              whatsapp: signupForm.phone,
              university: signupForm.university,
              department: signupForm.department,
              academic_year: signupForm.academic_year,
              academic_session: signupForm.academic_session,
            });
            
            if (!success) {
              console.error('Profile creation failed:', profileError);
            }
          } catch (profileErr) {
            console.error('Profile creation error:', profileErr);
          }
          
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
      console.log('Starting bKash payment with:', {
        user_id: user.id,
        workshop_id: workshop.id,
        amount: Number(workshop.price_offer && workshop.price_offer > 0 ? workshop.price_offer : workshop.price_regular),
        email: user.email,
        name: user.user_metadata?.display_name || user.email,
      });

      const { data } = await axios.post('/api/bkash/make-payment', {
        user_id: user.id,
        workshop_id: workshop.id,
        amount: Number(workshop.price_offer && workshop.price_offer > 0 ? workshop.price_offer : workshop.price_regular),
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
            <span className="text-xs text-gray-500 mb-2 rounded-full px-3 py-1 bg-blue-500 text-white">একাডেমিক ওয়ার্কশপ</span>
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
         <span className="font-semibold">Workshop Fee:</span>
         <div className="flex flex-col items-end gap-2">
           {workshop?.price_regular === 0 ? (
             <span className="font-bold text-lg md:text-xl text-green-600">Free</span>
           ) : workshopPricing ? (
             <>
               <div className="flex items-center gap-2">
                 {workshopPricing.originalPrice && workshopPricing.originalPrice > workshopPricing.currentPrice && (
                   <span className="font-bold text-gray-400 line-through text-sm">
                     ৳{workshopPricing.originalPrice.toLocaleString('bn-BD')}
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
           ) : (
             <span className="font-bold text-lg md:text-xl">
               ৳{Number(workshop?.price_regular || 0).toLocaleString('bn-BD')}
             </span>
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
                  Login
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    authMode === 'signup'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Notice about academic workshop */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg">
                <p className="text-sm">
                  <GraduationCap className="w-4 h-4 inline-block mr-2" />
                  This is an academic workshop. Academic information is required for signup.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Create Account</span>
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
                    {loginLoading ? "Logging in..." : "Login"}
                  </button>
                </form>
              )}

              {/* Signup Form */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={signupForm.fullName}
                      onChange={handleSignupInput}
                      required
                      className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your mobile number"
                      value={signupForm.phone}
                      onChange={handleSignupInput}
                      pattern="^(\+?88)?01[3-9]\d{8}$"
                      title="Valid BD number: 01XXXXXXXXX"
                      required
                      className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="flex items-center bg-gray-100 rounded-lg px-3">
                      <Mail className="text-gray-500" size={18} />
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter your email address"
                        value={signupForm.email}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Academic Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Building className="w-4 h-4 inline-block mr-1" />
                        University/College
                      </label>
                      <input
                        type="text"
                        name="university"
                        placeholder="Enter your university/college name"
                        value={signupForm.university}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <GraduationCap className="w-4 h-4 inline-block mr-1" />
                        Department/Faculty
                      </label>
                      <input
                        type="text"
                        name="department"
                        placeholder="Enter your department/faculty name"
                        value={signupForm.department}
                        onChange={handleSignupInput}
                        required
                        className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <CalendarDays className="w-4 h-4 inline-block mr-1" />
                        Academic Year
                      </label>
                      <select
                        name="academic_year"
                        value={signupForm.academic_year}
                        onChange={handleSignupInput as unknown as ChangeEventHandler<HTMLSelectElement>}
                        required
                        className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none"
                      >
                        <option value="">Select academic year</option>
                        <option value="1st year">1st Year</option>
                        <option value="2nd year">2nd Year</option>
                        <option value="3rd year">3rd Year</option>
                        <option value="4th year">4th Year</option>
                        <option value="5th year">5th Year</option>
                        <option value="Masters">Masters</option>
                        <option value="MPhil">MPhil</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="w-4 h-4 inline-block mr-1" />
                        Academic Session
                      </label>
                      <select
                        name="academic_session"
                        value={signupForm.academic_session}
                        onChange={handleSignupInput as unknown as ChangeEventHandler<HTMLSelectElement>}
                        required
                        className="w-full p-3 bg-gray-100 rounded-lg focus:ring-0 outline-none"
                      >
                        <option value="">Select academic session</option>
                        <option value="2017-18 or before">2017-18 or before</option>
                        <option value="2018-19">2018-19</option>
                        <option value="2019-20">2019-20</option>
                        <option value="2020-21">2020-21</option>
                        <option value="2021-22">2021-22</option>
                        <option value="2022-23">2022-23</option>
                        <option value="2023-24">2023-24</option>
                        <option value="2024-25">2024-25</option>
                        <option value="2025-26">2025-26</option>
                        <option value="2026-27">2026-27</option>
                        <option value="Other">Other</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                      <Lock className="text-gray-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                      <Lock className="text-gray-500" size={18} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm your password"
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
                    {signupLoading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              )}

              <div className="text-center">
                <button
                  onClick={() => setShowAuthForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Go Back
                </button>
                <div className="mt-2">
                  <Link 
                    href={`/login?next=${encodeURIComponent(window.location.pathname)}`}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Go to Full Login Page
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
            {paying ? 'Processing...' : <><img src="/logos/logo-bkash-round.svg" alt="bKash" className="w-6 h-6 inline-block mr-2 rounded-full" /> Pay with bKash</>}
          </button>
        </div>
      )}
    </div>
  );
}
