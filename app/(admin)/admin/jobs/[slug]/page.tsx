"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import { Job } from "@/types/job.type";
import { updateJob, checkSlugExists, deleteJob } from "./actions";

interface JobEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function JobEditPage({ params }: JobEditPageProps) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "full-time" as const,
    location_type: "remote" as const,
    location: "",
    application_deadline: "",
    is_published: false,
    slug: "",
  });

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!resolvedParams) return;
    
    const fetchJob = async () => {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("slug", resolvedParams.slug)
        .single();

      if (error) {
        setError("চাকরি পাওয়া যায়নি");
        setLoading(false);
        return;
      }

      setJob(data);
      setFormData({
        title: data.title,
        description: data.description,
        type: data.type,
        location_type: data.location_type,
        location: data.location || "",
        application_deadline: data.application_deadline,
        is_published: data.is_published,
        slug: data.slug,
      });
      setLoading(false);
    };

    fetchJob();
  }, [resolvedParams]);

  // Don't render until params are resolved
  if (!resolvedParams) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/jobs">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-3xl font-bold">💼 চাকরি সম্পাদনা</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

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
    setSaving(true);
    setError("");

    try {
      console.log("Form data:", formData);
      console.log("Job ID:", job?.id);
      console.log("Current slug:", resolvedParams.slug);
      console.log("New slug:", formData.slug);
      
      // Always use job ID for updates to avoid issues with slug changes
      if (!job?.id) {
        setError("চাকরির ID পাওয়া যায়নি");
        setSaving(false);
        return;
      }

      // If slug is changing, check if the new slug already exists
      if (formData.slug !== resolvedParams.slug) {
        console.log("Checking for duplicate slug...");
        const slugCheck = await checkSlugExists(formData.slug, job.id);
        
        if (!slugCheck.success) {
          setError("স্লাগ চেক করতে সমস্যা হয়েছে");
          setSaving(false);
          return;
        }

        if (slugCheck.exists) {
          setError("এই স্লাগ ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য একটি স্লাগ ব্যবহার করুন।");
          setSaving(false);
          return;
        }
      }

      console.log("Updating job with data:", formData);
      
      // Update using server action
      const result = await updateJob(job.id, formData);

      console.log("Update result:", result);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log("Update successful:", result.data);
      setSuccess(true);
      
      // Redirect based on whether slug changed
      if (formData.slug !== resolvedParams.slug) {
        setTimeout(() => {
          router.push(`/admin/jobs/${formData.slug}`);
        }, 2000);
      } else {
        setTimeout(() => {
          router.push("/admin/jobs");
        }, 2000);
      }
    } catch (err: unknown) {
      console.error("Submit error:", err);
      const errorMessage = err instanceof Error ? err.message : "চাকরি আপডেট করতে সমস্যা হয়েছে";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই চাকরিটি মুছে ফেলতে চান?")) {
      return;
    }

    try {
      if (!job?.id) {
        setError("চাকরির ID পাওয়া যায়নি");
        return;
      }
      
      const result = await deleteJob(job.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      router.push("/admin/jobs");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "চাকরি মুছতে সমস্যা হয়েছে";
      setError(errorMessage);
    }
  };

  const getPreviewText = () => {
    return formData.description.length > 200 
      ? formData.description.substring(0, 200) + "..." 
      : formData.description;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/jobs">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-3xl font-bold">💼 চাকরি সম্পাদনা</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">চাকরি পাওয়া যায়নি</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/admin/jobs">
            <Button>চাকরির তালিকায় ফিরে যান</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/jobs">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-3xl font-bold">💼 চাকরি সম্পাদনা</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/career/${job.slug}`} target="_blank">
            <Button variant="outline" className="flex items-center gap-2">
              <Eye size={16} />
              দেখুন
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 size={16} />
            মুছুন
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">চাকরির বিজ্ঞাপন সফলভাবে আপডেট হয়েছে!</p>
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
                প্রকাশিত করুন
              </label>
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    আপডেট হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    আপডেট করুন
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
                      {formData.is_published ? 'প্রকাশিত' : 'অপ্রকাশিত'}
                    </span>
                  </div>
                </div>

                {job.job_code && (
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    কোড: {job.job_code}
                  </div>
                )}
                
                <div className="text-xs bg-blue-100 px-2 py-1 rounded">
                  স্লাগ: {formData.slug || 'not-set'}
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