"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { WorkshopForm } from "@/types/workshop.type";

// Utility function to format datetime for datetime-local input (force Asia/Dhaka time)
const formatDateTimeForInput = (dateTimeString: string | null): string => {
  if (!dateTimeString) return "";
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return "";
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || "00";
    const year = get('year');
    const month = get('month');
    const day = get('day');
    const hour = get('hour');
    const minute = get('minute');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return "";
  }
};

// Ensure timestamptz in DB is saved with explicit GMT+6 offset
const toDhakaOffsetIso = (localDateTime: string): string => {
  if (!localDateTime) return localDateTime;
  return `${localDateTime}:00+06:00`;
};

export default function EditWorkshopPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [form, setForm] = useState<WorkshopForm>({
    title: "",
    slug: "",
    description: "",
    full_content: "",
    tags: [""],
    speaker_name: "",
    speaker_bio: "",
    price_regular: 0,
    price_offer: 0,
    price_earlybirds: undefined,
    earlybirds_count: undefined,
    capacity: 50,
    start_time: "",
    end_time: "",
    status: "draft",
    banner_image_path: "",
    youtube_url: "",
    group_link: "",
    category: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [bannerOptions, setBannerOptions] = useState<string[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<boolean>(true);
  const [uploadingBanner, setUploadingBanner] = useState<boolean>(false);

  useEffect(() => {
    const fetchWorkshop = async () => {
      const supabase = createClientComponentClient();
      
      const { data, error } = await supabase
        .from("workshops")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error || !data) {
        console.error("Error fetching workshop:", error);
        router.push("/admin/workshops");
        return;
      }
      
      setForm({
        ...data,
        tags: data.tags || [""],
        start_time: formatDateTimeForInput(data.start_time),
        end_time: formatDateTimeForInput(data.end_time),
      });
      setLoading(false);
    };
    fetchWorkshop();
  }, [slug, router]);

  // Load banner images from Supabase Storage (images/workshop-banners)
  useEffect(() => {
    const loadBannerOptions = async () => {
      try {
        setLoadingBanners(true);
        const supabase = createClientComponentClient();
        const { data, error } = await supabase.storage
          .from('images')
          .list('workshop-banners', { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
        if (error) {
          console.error('Error listing banner images:', error);
          setBannerOptions([]);
        } else {
          type StorageItem = { name: string; id?: string | null };
          const items: StorageItem[] = (data ?? []) as StorageItem[];
          const names = items
            .map((item) => item?.name)
            .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);
          setBannerOptions(names);
        }
      } catch (e) {
        console.error('Unexpected error listing banner images:', e);
        setBannerOptions([]);
      } finally {
        setLoadingBanners(false);
      }
    };
    loadBannerOptions();
  }, []);

  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    try {
      setUploadingBanner(true);
      const supabase = createClientComponentClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
      const timestamp = Date.now();
      const fileName = `${timestamp}-${safeName}`;
      const path = `workshop-banners/${fileName}`;
      const { error } = await supabase.storage
        .from('images')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) {
        console.error('Upload failed:', error.message);
        alert('Failed to upload banner image.');
        return;
      }
      setForm(prev => ({ ...prev, banner_image_path: fileName }));
      setBannerOptions(prev => [fileName, ...prev.filter(n => n !== fileName)]);
    } catch (e) {
      console.error('Unexpected upload error:', e);
      alert('Unexpected error during upload.');
    } finally {
      setUploadingBanner(false);
    }
  };

  const onBannerInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleBannerUpload(file);
    // reset input so selecting the same file again triggers change
    e.currentTarget.value = '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const generateSlug = () => {
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setForm(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClientComponentClient();
    
    const workshopData = {
      ...form,
      tags: form.tags.filter(tag => tag.trim() !== ""),
      price_regular: Number(form.price_regular),
      price_offer: Number(form.price_offer),
      price_earlybirds: form.price_earlybirds ? Number(form.price_earlybirds) : null,
      earlybirds_count: form.earlybirds_count ? Number(form.earlybirds_count) : null,
      capacity: Number(form.capacity),
      start_time: toDhakaOffsetIso(form.start_time),
      end_time: toDhakaOffsetIso(form.end_time),
    };

    const { error } = await supabase
      .from("workshops")
      .update(workshopData)
      .eq("slug", slug);

    if (error) {
      console.error("Error updating workshop:", error);
      alert("Error updating workshop. Please try again.");
    } else {
      router.push("/admin/workshops");
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/workshops">
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Workshop</h1>
          <p className="text-gray-600 mt-2">Update workshop information and content</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workshop Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Enter workshop title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  placeholder="workshop-slug"
                  required
                />
                <Button
                  type="button"
                  onClick={generateSlug}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="">Select category...</option>
              <option value="academic">Academic</option>
              <option value="professional">Professional</option>
              <option value="technical">Technical</option>
              <option value="creative">Creative</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Academic workshops require additional student information
            </p>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Brief description of the workshop"
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Content *
            </label>
            <textarea
              name="full_content"
              value={form.full_content}
              onChange={handleChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Detailed content about the workshop..."
              required
            />
          </div>
        </div>

        {/* Speaker Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Speaker Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker Name *
              </label>
              <input
                type="text"
                name="speaker_name"
                value={form.speaker_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Enter speaker name"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speaker Bio *
            </label>
            <textarea
              name="speaker_bio"
              value={form.speaker_bio}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Brief bio about the speaker"
              required
            />
          </div>
        </div>

        {/* Workshop Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workshop Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Regular Price (৳) *
              </label>
              <input
                type="number"
                name="price_regular"
                value={form.price_regular}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Price (৳)
              </label>
              <input
                type="number"
                name="price_offer"
                value={form.price_offer}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Earlybird Price (৳)
              </label>
              <input
                type="number"
                name="price_earlybirds"
                value={form.price_earlybirds || ''}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Earlybird Spots
              </label>
              <input
                type="number"
                name="earlybirds_count"
                value={form.earlybirds_count || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tags</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="Add a tag"
            />
            <Button
              type="button"
              onClick={addTag}
              variant="outline"
              className="whitespace-nowrap"
            >
              <Plus size={16} className="mr-2" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-2 text-yellow-600 hover:text-yellow-800"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL
              </label>
              <input
                type="url"
                name="youtube_url"
                value={form.youtube_url}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Group Link
              </label>
              <input
                type="url"
                name="group_link"
                value={form.group_link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                WhatsApp group link for workshop participants
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Banner Image
            </label>
            <div className="grid grid-cols-1 gap-2">
              <div
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleBannerUpload(file);
                }}
                className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => document.getElementById('banner-file-input')?.click()}
              >
                <div className="text-sm">Drag & drop banner image here, or click to upload</div>
                <div className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to ~5MB</div>
              </div>
              <input
                id="banner-file-input"
                type="file"
                accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onBannerInputChange}
                disabled={uploadingBanner}
              />
              {uploadingBanner && (
                <div className="text-xs text-gray-500">Uploading banner...</div>
              )}
              <select
                name="banner_image_path"
                value={form.banner_image_path}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
              >
                <option value="">Select banner image...</option>
                {loadingBanners ? (
                  <option value="" disabled>Loading images...</option>
                ) : (
                  bannerOptions.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))
                )}
              </select>
              <p className="text-sm text-gray-500">
                Files are listed from bucket <span className="font-mono">images/workshop-banners</span>.
              </p>
              {form.banner_image_path && (
                <div className="mt-1">
                  <div className="text-xs text-gray-500 mb-1">Preview</div>
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/workshop-banners/${form.banner_image_path}`}
                    alt="Banner preview"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/workshops">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 border-0"
          >
            <Save size={16} className="mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
} 