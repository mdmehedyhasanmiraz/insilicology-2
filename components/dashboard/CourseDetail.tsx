"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Progress } from "@/components/ui/Progress";
import Image from "next/image";
import { Button } from "../ui/Button";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CourseExams from "./CourseExamTable";
import { Course, UserCourse } from "@/types/course.type";

export default function CourseDetailPage() {
  const { slug } = useParams();
  const supabase = createClientComponentClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [userCourse, setUserCourse] = useState<UserCourse | null>(null);
  const [averageMark, setAverageMark] = useState<number>(0);
  const [position, setPosition] = useState<{ rank: number; total: number }>({ rank: 0, total: 0 });
	const [avgPosition, setAvgPosition] = useState<{ rank: number; total: number }>({ rank: 0, total: 0 });
  const [examAttendeeCount, setExamAttendeeCount] = useState<number>(0);
  const [totalAttended, setTotalAttended] = useState<number>(0);
  const [lastExam, setLastExam] = useState<{
    id: string;
    exam_title: string;
    mark: number;
    exam_date: string;
    percentage: number;
  } | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user) return;
	
			// 🔹 Fetch course by slug
			const { data: courseData } = await supabase
				.from("courses")
				.select("*")
				.eq("slug", slug)
				.single();
	
			if (!courseData) return;
			setCourse(courseData);
	
			// 🔹 Fetch user-course relation
			const { data: ucData } = await supabase
				.from("user_courses")
				.select("*")
				.eq("user_id", user.id)
				.eq("course_id", courseData.id)
				.single();
	
			if (!ucData) return;
			setUserCourse(ucData);
	
			// 🔹 Get all exams in this course
			const { data: courseExams } = await supabase
				.from("exams")
				.select("id, total_marks, created_at, title")
				.eq("course_id", courseData.id)
				.order("created_at", { ascending: false });
	
			if (!courseExams || courseExams.length === 0) return;
	
			const courseExamIds = courseExams.map(e => e.id);
			const latestExam = courseExams[0]; // 👈 Latest exam based on created_at
	
			// 🔹 Get user's responses to these exams
			const { data: userResponses } = await supabase
				.from("exam_responses")
				.select("total_marks, exam_id, created_at")
				.eq("user_id", user.id)
				.in("exam_id", courseExamIds)
				.order("created_at", { ascending: false });
	
			if (!userResponses || userResponses.length === 0) return;
	
			// 🔹 Last exam user response
			const lastUserResponse = userResponses.find(r => r.exam_id === latestExam.id);
			if (lastUserResponse) {
				const percentage = (lastUserResponse.total_marks / latestExam.total_marks) * 100;
				setLastExam({
					id: latestExam.id,
					mark: lastUserResponse.total_marks,
					percentage: parseFloat(percentage.toFixed(2)),
					exam_title: latestExam.title,
					exam_date: latestExam.created_at,
				});
			}
	
			// 🔹 Calculate rank in latest exam
			const { data: latestExamResponses } = await supabase
				.from("exam_responses")
				.select("user_id, total_marks")
				.eq("exam_id", latestExam.id);
	
			if (latestExamResponses) {
				const sorted = latestExamResponses.sort((a, b) => b.total_marks - a.total_marks);
				const rank = sorted.findIndex(r => r.user_id === user.id) + 1;
				setPosition({ rank, total: sorted.length });
			}
	
			// 🔹 Calculate course-wide average rank
			const { data: allExamResponses } = await supabase
				.from("exam_responses")
				.select("user_id, exam_id, total_marks")
				.in("exam_id", courseExamIds);
	
			if (allExamResponses) {
				const userTotals: Record<string, number> = {};
	
				allExamResponses.forEach(r => {
					userTotals[r.user_id] = (userTotals[r.user_id] || 0) + r.total_marks;
				});
	
				const totalMarksPossible = courseExams.reduce((sum, exam) => sum + exam.total_marks, 0);
				const thisUserTotal = userTotals[user.id] || 0;
				const userAvgPercentage = (thisUserTotal / totalMarksPossible) * 100;
	
				setAverageMark(parseFloat(userAvgPercentage.toFixed(2)));
	
				const sortedTotals = Object.entries(userTotals)
					.map(([uid, total]) => ({ user_id: uid, total }))
					.sort((a, b) => b.total - a.total);
	
				const avgRank = sortedTotals.findIndex(u => u.user_id === user.id) + 1;
				setAvgPosition({ rank: avgRank, total: sortedTotals.length });
			}
	
			// ✅ Total unique users who attended ANY exam in the course
			const { count: courseAttendeeCount } = await supabase
				.from("exam_responses")
				.select("user_id", { count: "exact", head: false })
				.in("exam_id", courseExamIds);
	
			setTotalAttended(courseAttendeeCount || 0);
	
			// ✅ Total unique users who attended the latest exam
			const { count: latestExamAttendeeCount } = await supabase
				.from("exam_responses")
				.select("user_id", { count: "exact", head: false })
				.eq("exam_id", latestExam.id);
	
			setExamAttendeeCount(latestExamAttendeeCount || 0);
		};
	
		fetchData();
	}, [slug]);
	
  if (!course || !userCourse) {
    return (
      <div className="p-2 md:p-4 flex flex-col md:flex-row gap-8 w-full">
        {/* Main Content Skeleton */}
        <div className="flex-1">
          {/* Course Header Skeleton */}
          <div className="flex flex-col gap-2 mb-4 bg-white rounded-xl shadow-sm p-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>

          {/* Progress Bar Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
          </div>

          {/* Circles Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-2"></div>
                <div className="relative w-24 h-24">
                  <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-center flex-col">
                    <div className="h-6 bg-gray-300 rounded animate-pulse w-8 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Exam Section Skeleton */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-40"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sticky Poster Skeleton */}
        <div className="w-64 hidden lg:block sticky top-0 self-start">
          <div className="bg-white rounded-xl shadow-lg shadow-purple-100 p-3 flex flex-col gap-2">
            <div className="w-full h-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    );
  }

	return (
		<div className="p-2 md:p-4 flex flex-col md:flex-row gap-8 w-full">
			{/* Main Content */}
			<div className="flex-1">
				<div className="flex flex-col gap-2 mb-4 bg-white rounded-xl shadow-sm p-4">
					<h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
					<div className="flex gap-2">
						<span
							className={`text-xs px-3 py-1 rounded-full text-white ${
								course.type === "live"
									? "bg-red-600"
									: "bg-blue-600"
							}`}
						>
							{course.type.charAt(0).toUpperCase() + course.type.slice(1).toLowerCase()}
						</span>
						<span className="text-xs bg-gray-600 text-white px-3 py-1 rounded-full">
							{course.duration}
						</span>
					</div>
					<span className="text-sm text-gray-500 block">
						{course.description}
					</span>
					<span className="text-sm text-gray-500 block">
						<span className="font-bold">ভর্তি:</span>{" "}
						{new Date(userCourse.enrolled_at).toLocaleDateString("bn-BD", {
							day: "2-digit",
							month: "long",
							year: "numeric",
						})}
					</span>
				</div>
	
				<div className="bg-white rounded-xl shadow-sm p-3 mb-4">
					<p className="mb-1 font-bold">প্রোগ্রেস:</p>
					<Progress value={userCourse.progress} />
					<p className="text-sm text-gray-600 mt-1">{userCourse.progress}%</p>
				</div>
	
				{/* Circles */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					{/* ✅ Last Exam Mark (%) */}
					<div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
						<p className="text-sm mb-2">সর্বশেষ পরীক্ষার নম্বর (%)</p>
						<div className="relative w-24 h-24">
							<CircularProgressbar
								value={lastExam?.percentage || 0}
								styles={{
									path: { stroke: "rgb(123, 69, 232)" },
									trail: { stroke: "#eee" },
								}}
								strokeWidth={10}
							/>
							<div className="absolute inset-0 flex items-center justify-center text-center flex-col text-sm font-semibold">
								<span className="text-xl font-bold mt-2 -mb-1">{lastExam?.percentage.toFixed(1) || "–"}</span>
								<span className="text-xs text-gray-500">
									%
								</span>
							</div>
						</div>
					</div>

					{/* ✅ Last Exam Rank */}
					<div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
						<p className="text-sm mb-2">সর্বশেষ পরীক্ষায় অবস্থান</p>
						<div className="relative w-24 h-24">
							<CircularProgressbar
								value={position.total > 0 ? 100 - ((position.rank - 1) / position.total) * 100 : 0}
								styles={{
									path: { stroke: "rgb(123, 69, 232)" },
									trail: { stroke: "#eee" },
								}}
								strokeWidth={10}
							/>
							<div className="absolute inset-0 flex items-center justify-center text-center flex-col text-sm font-semibold">
								<span className="text-2xl font-bold mt-1 -mb-1">{position.rank || "–"}</span>
								<span className="text-xs text-gray-500">
									of {examAttendeeCount || "–"}
								</span>
							</div>
						</div>
					</div>

					{/* ✅ Average Mark % */}
					<div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
						<p className="text-sm mb-2">গড় নম্বর (%)</p>
						<div className="relative w-24 h-24">
							<CircularProgressbar
								value={averageMark}
								styles={{
									path: { stroke: "rgb(123, 69, 232)" },
									trail: { stroke: "#eee" },
								}}
								strokeWidth={10}
							/>
							<div className="absolute inset-0 flex items-center justify-center text-center flex-col text-sm font-semibold">
								<span className="text-xl font-bold mt-2 -mb-1">{averageMark.toFixed(1) || "–"}</span>
								<span className="text-xs text-gray-500">
									%
								</span>
							</div>
						</div>
					</div>

					{/* ✅ Average Rank in Course */}
					<div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center">
						<p className="text-sm mb-2">গড় অবস্থান</p>
						<div className="relative w-24 h-24">
							<CircularProgressbar
								value={avgPosition.total > 0 ? 100 - ((avgPosition.rank - 1) / avgPosition.total) * 100 : 0}
								styles={{
									path: { stroke: "rgb(123, 69, 232)" },
									trail: { stroke: "#eee" },
								}}
								strokeWidth={10}
							/>
							<div className="absolute inset-0 flex items-center justify-center text-center flex-col text-sm font-semibold">
								<span className="text-2xl font-bold mt-1 -mb-1">{avgPosition.rank || "–"}</span>
								<span className="text-sm text-gray-500 block text-xs">
									of {totalAttended || "–"}
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Exam Section */}
				<CourseExams courseId={course.id} />
			</div>
	
			{/* Sticky Poster */}
			<div className="w-64 hidden lg:block sticky top-0 self-start">
				<div className="bg-white rounded-xl shadow-lg shadow-purple-100 p-3 flex flex-col gap-2">
					<Image
						src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/${course.poster}`}
						alt="Course Poster"
						className="rounded"
						width={300}
						height={300}
					/>
					<span className="text-sm text-gray-500 block">
					  ক্লাস শুরুর তারিখ: {" "}
						{new Date(course.starts_on).toLocaleDateString("bn-BD", {
							day: "2-digit",
							month: "long",
							year: "numeric",
						})}
					</span>
					<Button variant="default" className="w-full" href={`/courses/${course.type.toLowerCase()}/${course.slug}`}>
						মূল কোর্স পেজ
					</Button>
				</div>
			</div>
		</div>
	);	
}