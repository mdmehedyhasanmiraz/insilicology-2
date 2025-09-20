"use client";

import { signupWithEmail } from "./actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Mail, Lock, Eye, EyeOff, Facebook, Linkedin } from "lucide-react";
import BiologicalAnimations from "@/components/auth/BiologicalAnimations";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function SignUp() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (form.password !== form.confirmPassword) {
      setPasswordError(true);
      toast.error("পাসওয়ার্ড মেলেনি। অনুগ্রহ করে মিলিয়ে দেখুন।");
      return;
    }

    setPasswordError(false); // clear error if previously set
  
    startTransition(async () => {
      const { error } = await signupWithEmail(form);
      if (error) {
        toast.error(error.message || "দুঃখিত, আবার চেষ্টা করুন");
      } else {
        toast.success("একাউন্ট সফলভাবে সম্পন্ন হয়েছে");
        router.push("/dashboard");
      }
    });
  };

  async function handleGoogleSignIn() {
    const supabase = createClientComponentClient();
    console.log("Trying to redirect to Google...");
  
    // Use dynamic URL detection for local development
    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`;
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  
    console.log("Redirect URL returned by Supabase:", redirectUrl);
  
    if (error) {
      toast.error(error.message || "দুঃখিত, আবার চেষ্টা করুন");
    }
  
    // OPTIONAL: manually force redirect if it's not happening automatically
    if (data?.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Scrollable form */}
      <div className="w-full md:w-1/2 h-full overflow-y-auto flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md py-8">
          {/* Logo */}
          <div className="flex-shrink-0 mr-2 mb-6">
            <Link href="/" className="flex items-center gap-3 justify-center">
              <Image 
                src="/logos/logo-insilicology.svg" 
                alt="Logo" 
                width={130} 
                height={45} 
                className="h-9 w-auto"
                priority
              />
              <span className="text-2xl font-bold text-gray-900">Insilicology</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-center text-purple-600 mb-6">একাউন্ট খুলুন</h2>

          <button
            onClick={handleGoogleSignIn}
            className="w-full cursor-pointer mt-4 bg-gray-100 hover:bg-gray-200 text-black font-medium py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Image src="/logos/logo-google.svg" alt="Google" width={20} height={20} />
            Google দিয়ে একাউন্ট খুলুন
          </button>

          <p className="text-gray-600 text-center mt-4">
            অথবা,
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block font-semibold">ইমেইল</label>
              <div className="flex items-center bg-gray-100 rounded-lg px-3">
                <Mail className="text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  value={form.email}
                  onChange={handleInput}
                  required
                  className="w-full p-3 bg-transparent focus:ring-0 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold">পাসওয়ার্ড</label>
              <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                <Lock className="text-gray-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="আপনার পাসওয়ার্ড লিখুন"
                  value={form.password}
                  onChange={handleInput}
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
              <label className="block font-semibold">পাসওয়ার্ড আবার লিখুন</label>
              <div className={`flex items-center bg-gray-100 rounded-lg px-3 relative ${passwordError ? "border-2 border-red-500" : ""}`}>
                <Lock className="text-gray-500" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="আপনার পাসওয়ার্ড আবার লিখুন"
                  value={form.confirmPassword}
                  onChange={handleInput}
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
              disabled={isPending}
              className="w-full cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg"
            >
              {isPending ? "একাউন্ট খোলা হচ্ছে..." : "একাউন্ট খুলুন"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            একাউন্ট আছে?{" "}
            <Link href="/login" className="text-purple-600 hover:underline font-semibold">
              লগইন করুন
            </Link>
          </p>

          <div className="flex justify-center mt-16 space-x-4">
            <a href="https://www.facebook.com/insilicology" className="text-gray-800 hover:text-blue-600">
              <Facebook size={24} />
            </a>
            <a href="https://www.linkedin.com/company/insilicology" className="text-gray-800 hover:text-blue-500">
              <Linkedin size={24} />
            </a>
            {/* <a href="#" className="text-gray-800 hover:text-blue-400">
              <Twitter size={24} />
            </a> */}
          </div>
        </div>
      </div>

      {/* Right: Biological Animations */}
      <div className="w-1/2 hidden md:flex sticky top-0 h-screen">
        <BiologicalAnimations />
      </div>
    </div>
  );
}
