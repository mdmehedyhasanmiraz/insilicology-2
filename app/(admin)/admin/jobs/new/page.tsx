"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from '@supabase/supabase-js';

interface JobFormData {
  title: string;
  description: string;
  type: 'full-time' | 'part-time' | 'internship' | 'volunteer' | 'contract' | 'temporary' | 'other';
  location_type: 'on-site' | 'remote' | 'hybrid';
  location: string;
  application_deadline: string;
  is_published: boolean;
  slug: string;
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    type: "full-time",
    location_type: "remote",
    location: "",
    application_deadline: "",
    is_published: false,
    slug: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create fallback client if admin client not available
      const createFallbackClient = () => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase environment variables not configured');
        }
        
        return createClient(supabaseUrl, supabaseKey);
      };

      let client;
      
      if (supabaseAdmin) {
        client = supabaseAdmin;
      } else {
        console.warn("Admin client not available, using fallback client");
        client = createFallbackClient();
      }

      // Check if slug already exists
      const { data: existingJob } = await client
        .from("jobs")
        .select("slug")
        .eq("slug", formData.slug)
        .single();

      if (existingJob) {
        setError("এই স্লাগ ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য একটি স্লাগ ব্যবহার করুন।");
        setLoading(false);
        return;
      }

      const { error } = await client
        .from("jobs")
        .insert([formData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/jobs");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "চাকরি তৈরি করতে সমস্যা হয়েছে";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPreviewText = () => {
    return formData.description.length > 200 
      ? formData.description.substring(0, 200) + "..." 
      : formData.description;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/jobs">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <h1 className="text-3xl font-bold">💼 নতুন চাকরির বিজ্ঞাপন</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">চাকরির বিজ্ঞাপন সফলভাবে তৈরি হয়েছে!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                চাকরির শিরোনাম *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                placeholder="উদাহরণ: সিনিয়র ওয়েব ডেভেলপার"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL স্লাগ *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                  placeholder="উদাহরণ: senior-web-developer"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const generatedSlug = formData.title
                      .toLowerCase()
                      .replace(/[^a-z0-9\s-]/g, '')
                      .replace(/\s+/g, '-')
                      .replace(/-+/g, '-')
                      .trim();
                    setFormData(prev => ({ ...prev, slug: generatedSlug }));
                  }}
                  className="px-4 py-3 whitespace-nowrap"
                >
                  স্লাগ তৈরি করুন
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                URL: /career/{formData.slug || 'your-slug'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  চাকরির ধরন *
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                >
                  <option value="full-time">ফুল-টাইম</option>
                  <option value="part-time">পার্ট-টাইম</option>
                  <option value="internship">ইন্টার্নশিপ</option>
                  <option value="contract">কন্ট্রাক্ট</option>
                  <option value="volunteer">স্বেচ্ছাসেবক</option>
                  <option value="temporary">অস্থায়ী</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-2">
                  কাজের ধরন *
                </label>
                <select
                  id="location_type"
                  name="location_type"
                  required
                  value={formData.location_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                >
                  <option value="remote">রিমোট</option>
                  <option value="on-site">অফিসে</option>
                  <option value="hybrid">হাইব্রিড</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                অবস্থান (ঐচ্ছিক)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
                placeholder="উদাহরণ: ঢাকা, বাংলাদেশ"
              />
            </div>

            <div>
              <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700 mb-2">
                আবেদনের শেষ তারিখ *
              </label>
              <input
                type="date"
                id="application_deadline"
                name="application_deadline"
                required
                value={formData.application_deadline}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                চাকরির বিবরণ *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={12}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-300 focus:border-orange-300 transition-colors resize-none"
                placeholder="চাকরির বিস্তারিত বিবরণ লিখুন..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {formData.description.length} অক্ষর
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_published"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-300"
              />
              <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
                এখনই প্রকাশ করুন
              </label>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    তৈরি হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    চাকরি তৈরি করুন
                  </>
                )}
              </Button>
              <Link href="/admin/jobs">
                <Button variant="outline">বাতিল</Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={20} className="text-gray-600" />
              <h3 className="text-lg font-semibold">প্রিভিউ</h3>
            </div>

            {formData.title ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.title}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {formData.type.charAt(0).toUpperCase() + formData.type.slice(1).replace('-', ' ')}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {formData.location_type.charAt(0).toUpperCase() + formData.location_type.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {formData.location && (
                  <div className="text-sm text-gray-600">
                    📍 {formData.location}
                  </div>
                )}

                {formData.application_deadline && (
                  <div className="text-sm text-gray-600">
                    ⏰ আবেদনের শেষ: {new Date(formData.application_deadline).toLocaleDateString("bn-BD")}
                  </div>
                )}

                {formData.description && (
                  <div>
                    <p className="text-sm text-gray-600 line-clamp-6">
                      {getPreviewText()}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${formData.is_published ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-sm text-gray-600">
                      {formData.is_published ? 'প্রকাশিত হবে' : 'অপ্রকাশিত থাকবে'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>ফর্ম পূরণ করুন প্রিভিউ দেখতে</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 