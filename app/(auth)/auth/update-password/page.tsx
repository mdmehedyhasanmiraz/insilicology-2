"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { updatePassword } from "./actions";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function UpdatePasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1) Fallback for hash-based links (when PKCE for email OTP is disabled)
        if (typeof window !== 'undefined' && window.location.hash) {
          const hash = new URLSearchParams(window.location.hash.replace('#', ''));
          const accessToken = hash.get('access_token');
          const refreshToken = hash.get('refresh_token');
          if (accessToken && refreshToken) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setErr) {
              console.error('Set session error:', setErr);
            }
          }
        }

        // 2) PKCE flow for links with `code` (when PKCE for email OTP is enabled)
        const code = searchParams?.get('code');

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setMessage("অবৈধ বা মেয়াদোত্তীর্ণ লিংক। নতুন রিসেট লিংক চেয়ে আবার চেষ্টা করুন।");
            setIsSuccess(false);
            return;
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth check error:', error);
          setMessage("অবৈধ বা মেয়াদোত্তীর্ণ লিংক। নতুন রিসেট লিংক চেয়ে আবার চেষ্টা করুন।");
          setIsSuccess(false);
        } else if (session) {
          setIsAuthenticated(true);
          setMessage("");
        } else {
          setMessage("অবৈধ বা মেয়াদোত্তীর্ণ লিংক। নতুন রিসেট লিংক চেয়ে আবার চেষ্টা করুন।");
          setIsSuccess(false);
        }
      } catch {
        console.error('Auth check error');
        setMessage("অবৈধ বা মেয়াদোত্তীর্ণ লিংক। নতুন রিসেট লিংক চেয়ে আবার চেষ্টা করুন।");
        setIsSuccess(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [supabase.auth, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validation
    if (password !== confirmPassword) {
      setMessage("পাসওয়ার্ড মিলছে না।");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      const result = await updatePassword(password);
      
      if (result.error) {
        setMessage(result.error);
        setIsSuccess(false);
      } else {
        setMessage("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে।");
        setIsSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch {
      setMessage("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">নতুন পাসওয়ার্ড সেট করুন</h1>
          <p className="text-slate-600">আপনার নতুন পাসওয়ার্ড লিখুন</p>
        </div>

        {/* Loading State */}
        {isCheckingAuth && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">লিংক যাচাই করা হচ্ছে...</p>
          </div>
        )}

        {/* Form - Only show when authenticated */}
        {!isCheckingAuth && isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                নতুন পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                পাসওয়ার্ড নিশ্চিত করুন
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                isSuccess 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "সেট করা হচ্ছে..." : "পাসওয়ার্ড সেট করুন"}
            </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          </div>
        )}

        {/* Error State - When not authenticated */}
        {!isCheckingAuth && !isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">লিংক বৈধ নয়</h2>
            <p className="text-slate-600 mb-6">এই লিংকটি অবৈধ বা মেয়াদোত্তীর্ণ। নতুন পাসওয়ার্ড রিসেট লিংক চেয়ে আবার চেষ্টা করুন।</p>
            
            <div className="space-y-3">
              <Link 
                href="/reset-password" 
                className="inline-block w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
              >
                নতুন রিসেট লিংক চান
              </Link>
              
              <Link 
                href="/login" 
                className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                লগইন পেজে ফিরে যান
              </Link>
            </div>
          </div>
        )}

        {/* Password Requirements - Only show when authenticated */}
        {!isCheckingAuth && isAuthenticated && (
          <div className="mt-6 bg-white rounded-xl p-4 border border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-2">পাসওয়ার্ডের প্রয়োজনীয়তা:</h3>
            <ul className="text-xs text-slate-600 space-y-1">
              <li>• কমপক্ষে ৬ অক্ষর হতে হবে</li>
              <li>• সংখ্যা এবং অক্ষর মিশ্রিত করুন</li>
              <li>• বিশেষ অক্ষর ব্যবহার করুন (ঐচ্ছিক)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}
