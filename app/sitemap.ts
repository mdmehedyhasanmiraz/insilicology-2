import { getPosts } from "@/sanity/lib/client";
import type { Post } from "@/sanity/types";
import { supabaseAdmin } from "@/lib/supabase/server";

const baseUrl: string = "https://skilltori.com";

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

export default async function sitemap(): Promise<SitemapEntry[]> {
  // Fetch blog posts
  const posts = await getPosts();
  const postsUrls: SitemapEntry[] = posts.map((post: Post) => ({
    url: `${baseUrl}/blog/${post.slug?.current}`,
    lastModified: new Date(post.publishedAt || new Date()).toISOString(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Fetch live and recorded courses from Supabase
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available for sitemap generation');
    return [
      {
        url: `${baseUrl}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 1,
      },
      ...postsUrls,
    ];
  }

  const { data: liveCourses } = await supabaseAdmin
    .from("courses")
    .select("slug, type, updated_at")
    .eq("type", "live")
    .eq("is_published", true);

  const { data: recordedCourses } = await supabaseAdmin
    .from("courses")
    .select("slug, type, updated_at")
    .eq("type", "recorded")
    .eq("is_published", true);

  const courseUrls: SitemapEntry[] = [
    ...(liveCourses || []).map((course) => ({
      url: `${baseUrl}/courses/live/${course.slug}`,
      lastModified: course.updated_at || new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...(recordedCourses || []).map((course) => ({
      url: `${baseUrl}/courses/recorded/${course.slug}`,
      lastModified: course.updated_at || new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  // Fetch published jobs from Supabase
  // Fetch published workshops from Supabase
  const { data: workshops } = await supabaseAdmin
    .from("workshops")
    .select("slug, updated_at")
    .eq("status", "published");

  const workshopUrls: SitemapEntry[] = (workshops || []).map((workshop) => ({
    url: `${baseUrl}/workshops/${workshop.slug}`,
    lastModified: workshop.updated_at || new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const workshopEnrollUrls: SitemapEntry[] = (workshops || []).map((workshop) => ({
    url: `${baseUrl}/workshops/${workshop.slug}/enroll`,
    lastModified: workshop.updated_at || new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const { data: jobs } = await supabaseAdmin
    .from("jobs")
    .select("slug, updated_at")
    .eq("is_published", true)
    .gte("application_deadline", new Date().toISOString().split('T')[0]);

  const jobUrls: SitemapEntry[] = (jobs || []).map((job) => ({
    url: `${baseUrl}/career/${job.slug}`,
    lastModified: job.updated_at || new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const jobApplyUrls: SitemapEntry[] = (jobs || []).map((job) => ({
    url: `${baseUrl}/career/${job.slug}/apply`,
    lastModified: job.updated_at || new Date().toISOString(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const sitemapEntries: SitemapEntry[] = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses/live`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/courses/recorded`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/workshops`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...courseUrls,
    ...workshopUrls,
    ...workshopEnrollUrls,
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...postsUrls,
    {
      url: `${baseUrl}/career`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/career/campus-ambassador`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...jobUrls,
    ...jobApplyUrls,
  ];

  return sitemapEntries;
}
