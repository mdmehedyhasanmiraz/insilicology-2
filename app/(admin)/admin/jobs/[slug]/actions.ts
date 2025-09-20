"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";
import { Job } from "@/types/job.type";

// Fallback client using public key (for read operations)
const createFallbackClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export async function updateJob(jobId: string, formData: Partial<Job>) {
  try {
    let client;
    
    if (supabaseAdmin) {
      client = supabaseAdmin;
    } else {
      console.warn("Admin client not available, using fallback client");
      client = createFallbackClient();
    }

    const { data, error } = await client
      .from("jobs")
      .update(formData)
      .eq("id", jobId)
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      throw error;
    }

    // Revalidate the jobs pages
    revalidatePath("/admin/jobs");
    revalidatePath(`/admin/jobs/${formData.slug}`);
    revalidatePath(`/career/${formData.slug}`);

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Server action error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function checkSlugExists(slug: string, excludeJobId?: string) {
  try {
    let client;
    
    if (supabaseAdmin) {
      client = supabaseAdmin;
    } else {
      client = createFallbackClient();
    }

    let query = client
      .from("jobs")
      .select("slug")
      .eq("slug", slug);

    if (excludeJobId) {
      query = query.neq("id", excludeJobId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return { exists: !!data, success: true };
  } catch (error: unknown) {
    console.error("Slug check error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function getJobApplications(jobId: string) {
  try {
    let client;
    
    if (supabaseAdmin) {
      client = supabaseAdmin;
    } else {
      client = createFallbackClient();
    }

    const { data, error } = await client
      .from("applications")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Get applications error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

export async function deleteJob(jobId: string) {
  try {
    let client;
    
    if (supabaseAdmin) {
      client = supabaseAdmin;
    } else {
      client = createFallbackClient();
    }

    const { error } = await client
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (error) {
      console.error("Delete error:", error);
      throw error;
    }

    // Revalidate the jobs pages
    revalidatePath("/admin/jobs");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete server action error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage };
  }
} 