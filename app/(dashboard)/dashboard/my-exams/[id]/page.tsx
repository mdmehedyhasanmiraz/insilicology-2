'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Clock } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  duration_minutes: number;
  pass_marks: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  marks: number;
  correct_answer?: string;
}

export default function ExamPage() {
  const supabase = createClientComponentClient();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [k: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const { data: ex } = await supabase
        .from('exams')
        .select('id, title, duration_minutes, pass_marks')
        .eq('id', id)
        .single();

      const { data: qs } = await supabase
        .from('exam_questions')
        .select('id, question, options, marks')
        .eq('exam_id', id)
        .order('position');

      if (ex) {
        setExam(ex);
        setTimeLeft((ex.duration_minutes || 0) * 60);
        setIsExamActive(true);
      }
      setQuestions(qs || []);
      setLoading(false);
    };

    fetch();
  }, [id, supabase]);

  useEffect(() => {
    if (!isExamActive || timeLeft <= 0) {
      if (timeLeft === 0 && isExamActive) {
        console.log('Time is up! Auto-submitting exam...');
        submitExam();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { 
          console.log('Timer reached 0, clearing interval and deactivating exam');
          clearInterval(timerRef.current!); 
          setIsExamActive(false); 
          return 0; 
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [timeLeft, isExamActive]);

  useEffect(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (isExamActive) { e.preventDefault(); e.returnValue = ''; }
    };

    const onPop = () => {
      if (isExamActive && !confirm('আপনি পরীক্ষার মাঝেই বাহিরে যাচ্ছেন! নিশ্চিত?')) {
        history.pushState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPop);
    };
  }, [isExamActive]);

  const handleChange = (qId: string, opt: string) => {
    if (!isExamActive) return;
    setAnswers((prev) => ({ ...prev, [qId]: opt }));
  };

  const submitExam = async () => {
    if (!exam) {
      alert("পরীক্ষা পাওয়া যায়নি");
      return;
    }
  
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) return alert("লগইন থাকতে হবে।");
  
    // Fetch correct answers server-side for accuracy
    const { data: correctQs, error: fetchError } = await supabase
      .from('exam_questions')
      .select('id, correct_answer, marks')
      .eq('exam_id', exam.id);
  
    if (fetchError || !correctQs) {
      console.error(fetchError);
      alert("প্রশ্ন লোড করতে সমস্যা হয়েছে");
      return;
    }
  
    const detailed = correctQs.map((q) => {
      const userAnswer = answers[q.id] || '';
      const obtained = userAnswer === q.correct_answer ? q.marks : 0;
      return {
        question_id: q.id,
        user_answer: userAnswer,
        obtained_marks: obtained,
      };
    });
  
    const totalMarks = detailed.reduce((acc, curr) => acc + curr.obtained_marks, 0);
  
    const { error: insertError } = await supabase.from('exam_responses').insert({
      exam_id: exam.id,
      user_id: user.id,
      answers: detailed,
      total_marks: totalMarks,
    });
  
    if (insertError) {
      if (insertError.code === '23505') {
        alert("আপনি ইতোমধ্যে এই পরীক্ষা দিয়েছেন।");
      } else {
        console.error(insertError);
        alert("উত্তর জমা দিতে সমস্যা হয়েছে।");
      }
      return;
    }
  
    // Redirect to results page
    router.replace(`/dashboard/my-exams/${exam.id}/result`);
  };  

  const handleSubmitClick = () => {
    if (!confirm("আপনি কি নিশ্চিত পরীক্ষাটি জমা দিতে চান?")) return;
    clearInterval(timerRef.current!);
    setIsExamActive(false);
    submitExam();
  };

  if (loading) return <p className="p-4">লোড হচ্ছে...</p>;

  if (!exam) return <p className="p-4">পরীক্ষা পাওয়া যায়নি</p>;

  const percent = Math.floor((timeLeft / (exam.duration_minutes * 60)) * 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 120; // less than 2 minutes

  return (
    <div className="p-2 md:p-4">
      {/* Sticky Timer & Progress */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-gray-100 mb-6 py-3 px-2 sm:px-4 flex flex-col gap-2 shadow-sm rounded-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-700 flex-1 truncate">{exam.title}</h1>
          <div className={`flex items-center gap-2 font-mono text-lg sm:text-xl px-3 py-1 rounded-lg transition-colors ${isLowTime ? 'bg-red-100 text-red-700' : 'bg-purple-50 text-purple-700'}`}
            title="Remaining Time">
            <Clock className={`w-5 h-5 ${isLowTime ? 'text-red-500 animate-pulse' : 'text-purple-500'}`} />
            <span>{`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>
          </div>
        </div>
        <Progress value={percent} />
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="bg-white border border-gray-200 rounded-2xl shadow-md p-4 md:p-6 mb-8 transition-shadow hover:shadow-lg">
          <div className="mb-4 font-semibold text-purple-600 text-lg flex items-center gap-1">
            <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1 text-sm font-bold">{idx + 1}</span>
            <span>{q.question}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            {q.options.map((opt: string, i: number) => {
              const selected = answers[q.id] === opt;
              return (
                <button
                  type="button"
                  key={i}
                  className={`flex items-center w-full p-4 border rounded-xl transition-all duration-150 focus:outline-none text-left gap-3 shadow-sm hover:border-purple-400 hover:bg-purple-50 ${selected ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-300' : 'bg-white border-gray-200'}`}
                  onClick={() => handleChange(q.id, opt)}
                  disabled={!isExamActive}
                >
                  <span className={`inline-block w-5 h-5 rounded-full border-2 flex-shrink-0 mr-2 ${selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 bg-white'}`}></span>
                  <span className="text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-10 flex justify-center">
        <Button
          onClick={handleSubmitClick}
          disabled={!isExamActive && timeLeft > 0}
          className="px-8 py-3 text-lg rounded-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 shadow-lg transition-all duration-150"
        >
          পরীক্ষা জমা দিন
        </Button>
      </div>
    </div>
  );
}
