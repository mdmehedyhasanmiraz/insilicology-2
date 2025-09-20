// app/(dashboard)/dashboard/my-exams/[id]/result/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import dayjs from 'dayjs';
import {
  CircularProgressbar,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

type AnswerItem = {
  question_id: string;
  user_answer: string;  // your DB stores this key, NOT selected_answer
  obtained_marks: number;
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  marks: number;
  explanation?: string;
};

type Course = {
  title: string;
};

type Exam = {
  id: string;
  title: string;
  total_marks: number;
  pass_marks: number;
  courses?: Course;
};

type ExamResponse = {
  id: string;
  exam_id: string;
  user_id: string;
  total_marks: number;
  created_at: string;
  answers: AnswerItem[];
};

export default function ExamResultPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams(); // this is exam_id

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [response, setResponse] = useState<ExamResponse | null>(null);

  useEffect(() => {
		const fetchResult = async () => {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user?.id || !id) return;
		
			// Step 1: Fetch exam response
			const { data: responseData, error: responseError } = await supabase
				.from('exam_responses')
				.select('*')
				.eq('exam_id', id)
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(1)
				.single();
		
			if (responseError || !responseData) {
				console.error('Failed to fetch result:', responseError);
				setLoading(false);
				return;
			}
		
			setResponse(responseData);
		
			// Step 2: Fetch exam info with course info
			const { data: examData, error: examError } = await supabase
				.from('exams')
				.select('*, courses(title)')
				.eq('id', id)
				.single();
		
			if (examError || !examData) {
				console.error('Failed to fetch exam data:', examError);
				setLoading(false);
				return;
			}
		
			setExam(examData);
		
			// Step 3: Fetch questions based on question_ids from answers
			const questionIds = responseData.answers.map((a: AnswerItem) => a.question_id);
		
			if (questionIds.length > 0) {
				const { data: qs, error: qsError } = await supabase
					.from('exam_questions')
					.select('*')
					.in('id', questionIds);
		
				if (qsError) {
					console.error('Failed to fetch questions:', qsError);
				}
		
				setQuestions(qs || []);
			}
		
			setAnswers(responseData.answers || []);
			setLoading(false);
		};		

    fetchResult();
  }, [id, supabase]);

  const getAnswerForQuestion = (questionId: string) =>
		answers.find((a) => a.question_id === questionId);

	return (
		<div className="p-2 md:p-6">
			<h1 className="text-2xl md:text-3xl font-bold mb-8 text-gray-900 text-center tracking-tight font-display">
				🎉 আপনার পরীক্ষার ফলাফল
			</h1>

			{loading ? (
				<p className="text-center text-gray-600">লোড হচ্ছে...</p>
			) : !exam ? (
				<p className="text-center text-red-500">ফলাফল পাওয়া যায়নি।</p>
			) : (
				<>
					<div className="max-w-3xl mx-auto mb-12 rounded-3xl bg-white/70 backdrop-blur-lg border border-purple-100 p-4 flex flex-col md:flex-row items-center gap-8 relative shadow-sm">
						<div className="flex flex-col items-center gap-4 flex-1">
							<div className="w-36 h-36 rounded-full flex items-center justify-center font-bold">
								<CircularProgressbar
									value={response?.total_marks ?? 0}
									maxValue={exam.total_marks}
									text={`${response?.total_marks ?? 0}/${exam.total_marks}`}
									styles={buildStyles({
										textSize: '20px',
										pathColor: '#a21caf',
										textColor: '#0f172a',
										trailColor: '#e0e7ff',
										backgroundColor: '#f3f4f6',
									})}
								/>
							</div>
							<div className="mt-2">
								<span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold shadow-sm ${response && response.total_marks >= (exam.pass_marks ?? 0) ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
									{response && response.total_marks >= (exam.pass_marks ?? 0) ? 'পাস করেছেন 🎉' : 'পাস করেননি'}
								</span>
							</div>
						</div>
						<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 col-span-2">
								<div>
									<div className="text-xs text-gray-500 font-medium">কোর্স</div>
									<div className="text-gray-900 font-bold">{exam.courses?.title || 'অজানা'}</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
								<div>
									<div className="text-xs text-gray-500 font-medium">পরীক্ষা</div>
									<div className="text-gray-900 font-bold">{exam.title}</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
								<div>
									<div className="text-xs text-gray-500 font-medium">তারিখ</div>
									<div className="font-bold">{response ? dayjs(response.created_at).format('DD MMM YYYY') : 'N/A'}</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
								<div>
									<div className="text-xs text-gray-500 font-medium">পূর্ণমান</div>
									<div className="font-bold">{exam.total_marks}</div>
								</div>
							</div>
							<div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
								<div>
									<div className="text-xs text-gray-500 font-medium">পাস নম্বর</div>
									<div className="font-bold">{exam.pass_marks}</div>
								</div>
							</div>
						</div>
					</div>

					<div className="max-w-3xl mx-auto space-y-6">
						{questions.map((q) => {
							const userAnswer = getAnswerForQuestion(q.id);
							const isCorrect = userAnswer?.user_answer === q.correct_answer;

							return (
								<div
									key={q.id}
									className={`rounded-2xl p-6 transition shadow-sm border-2 ${
										isCorrect ? 'bg-gradient-to-br from-green-50 to-white border-green-300' : 'bg-gradient-to-br from-red-50 to-white border-red-200'
									}`}
								>
									<p className="font-semibold text-lg text-gray-800 mb-2 flex items-center gap-2">
										<span className="inline-block w-7 h-7 rounded-full flex items-center justify-center bg-purple-100 text-purple-700 font-bold shadow-sm">{isCorrect ? '✔' : '✗'}</span>
										{q.question}
									</p>

									<div className="text-base space-y-1 text-gray-700">
										<p>
											<strong>আপনার উত্তর:</strong>{' '}
											<span
												className={`font-semibold ${
													isCorrect ? 'text-green-600' : 'text-red-600'
												}`}
											>
												{userAnswer?.user_answer || 'উত্তর নেই'}
											</span>
										</p>

										<p>
											<strong>সঠিক উত্তর:</strong>{' '}
											<span className="text-green-700 font-semibold">
												{q.correct_answer}
											</span>
										</p>

										<p>
											<strong>এই প্রশ্নে প্রাপ্ত নম্বর:</strong>{' '}
											<span className="font-semibold text-blue-700">{userAnswer?.obtained_marks || 0}</span>
										</p>

										{q.explanation && (
											<p className="mt-2 text-gray-600 text-base">
												💡 <strong>ব্যাখ্যা:</strong> {q.explanation}
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}