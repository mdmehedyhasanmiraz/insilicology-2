// lib/supabase/fetchLastExamScore.ts
import { createClient } from "@/utils/supabase/server"; // adjust path to your client
// import { Database } from "@/types/supabase"; // if using Supabase types

type LastExamScore = {
  exam_id: string;
  score: number;
  attended_at: string;
};

export async function fetchLastExamScore(
  userId: string,
  courseId: string
): Promise<LastExamScore | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_exams")
    .select("exam_id, score, attended_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("attended_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Failed to fetch last exam score:", error.message);
    return null;
  }

  return data;
}
