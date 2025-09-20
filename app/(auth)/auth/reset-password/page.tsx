"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from "lucide-react";
import { resetPassword } from "./actions";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    try {
      const result = await resetPassword(email);
      if (result?.error) {
        setMessage(result.error);
        setIsSuccess(false);
      } else {
        setMessage("ওটিপি আপনার ইমেইলে পাঠানো হয়েছে। ইমেইল চেক করুন।");
        setIsSuccess(true);
        setStep("verify");
      }
    } catch {
      setMessage("একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsSuccess(false);

    if (password !== confirmPassword) {
      setMessage("পাসওয়ার্ড মিলছে না।");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage("পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'recovery',
      });
      if (error) {
        setMessage("ওটিপি সঠিক নয় বা মেয়াদোত্তীর্ণ। আবার চেষ্টা করুন।");
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      const { error: updateErr } = await supabase.auth.updateUser({ password });
      if (updateErr) {
        setMessage(updateErr.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।");
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      setMessage("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে। এখন লগইন করুন।");
      setIsSuccess(true);
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
            {step === 'request' ? <Mail className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">{step === 'request' ? 'পাসওয়ার্ড রিসেট' : 'ওটিপি যাচাই করে পাসওয়ার্ড সেট'}</h1>
          <p className="text-slate-600">{step === 'request' ? 'আপনার ইমেইলে ওটিপি পাঠানো হবে' : `${email} ইমেইলে পাঠানো ওটিপি দিন এবং নতুন পাসওয়ার্ড সেট করুন`}</p>
        </div>

        {/* Step 1: Request OTP */}
        {step === 'request' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleRequest} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  ইমেইল
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder="আপনার ইমেইল লিখুন"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

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
                disabled={isLoading || !email}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? "পাঠানো হচ্ছে..." : "ওটিপি পাঠান"}
              </button>
            </form>

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

        {/* Step 2: Verify OTP and set new password */}
        {step === 'verify' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleVerifyAndUpdate} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-slate-700 mb-2">
                  ওটিপি কোড
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  placeholder="ইমেইলে পাওয়া ৬-সংখ্যার ওটিপি"
                  required
                />
              </div>

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
                disabled={isLoading || !otp || !password || !confirmPassword}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? "যাচাই ও সেট হচ্ছে..." : "ওটিপি যাচাই ও পাসওয়ার্ড সেট করুন"}
              </button>

              <div className="text-sm text-slate-600 text-center">
                <button
                  type="button"
                  onClick={() => { setStep('request'); setMessage(''); setIsSuccess(false); }}
                  className="underline hover:text-indigo-600"
                >
                  ইমেইল ঠিকানা বদলান
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            ইমেইল পাচ্ছেন না?{" "}
            <Link href="/contact" className="text-indigo-600 hover:text-indigo-700 font-medium">
              সাপোর্টে যোগাযোগ করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
