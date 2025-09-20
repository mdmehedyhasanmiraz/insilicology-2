// app/admin/exams/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import React from 'react';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: string;
  total_marks: string;
  pass_marks: string;
  is_published: boolean;
  course_id: string;
  batch_ids: string[] | null;
}

interface Question {
  id?: string;
  question: string;
  options: string[];
  marks: number;
  correct_answer: string;
  explanation: string;
  position?: number;
  exam_id?: string;
}

interface Course {
  id: string;
  title: string;
}

interface Batch {
  id: string;
  batch_code: string;
}

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();

  const [form, setForm] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!form?.course_id) {
      setBatches([]);
      return;
    }
    const fetchBatches = async () => {
      const { data: batchesData } = await supabase
        .from('live_batches')
        .select('id, batch_code')
        .eq('course_id', form.course_id);
      setBatches(batchesData || []);
    };
    fetchBatches();
  }, [supabase, form?.course_id]);

  const deleteExamFromDB = async (id: string, idx: number) => {
    const confirmed = confirm('Are you sure you want to delete this exam?');
    if (!confirmed) return;
  
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete exam.');
      return;
    }
  
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    toast.success('Exam deleted!');
  };

  const deleteQuestionFromDB = async (id: string, idx: number) => {
    const confirmed = confirm('Are you sure you want to delete this question?');
    if (!confirmed) return;
  
    const { error } = await supabase.from('exam_questions').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete question.');
      return;
    }
  
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    toast.success('Question deleted!');
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
  
    const updated = [...questions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setQuestions(updated);
  };

  useEffect(() => {
    if (!params.id) return;

    async function fetchData() {
      // Fetch courses first
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title');
      
      setCourses(coursesData || []);

      const { data: exam, error: examErr } = await supabase
        .from('exams')
        .select('id, title, description, duration_minutes, total_marks, pass_marks, is_published, course_id, batch_ids')
        .eq('id', params.id)
        .single();

      if (examErr || !exam) {
        toast.error('Exam not found');
        return router.push('/admin/exams');
      }

      setForm({
        ...exam,
        duration_minutes: exam.duration_minutes?.toString() ?? '',
        total_marks: exam.total_marks?.toString() ?? '',
        pass_marks: exam.pass_marks?.toString() ?? '',
        is_published: Boolean(exam.is_published)
      });

      const { data: qs } = await supabase
        .from('exam_questions')
        .select('*')
        .eq('exam_id', params.id);

      setQuestions(qs || []);
      setLoading(false);
    }

    fetchData();
  }, [params.id, router, supabase]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((p) => p ? {
      ...p,
      [name]: type === 'checkbox' ? checked : value
    } : null);
  };

  const handleQuestionChange = (idx: number, field: keyof Question, value: string | number) => {
    const arr = [...questions];
    arr[idx] = { ...arr[idx], [field]: value };
    setQuestions(arr);
  };

  const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
    const arr = [...questions];
    arr[qIdx].options[oIdx] = value;
    setQuestions(arr);
  };

  const addQuestion = () =>
    setQuestions((p) => [
      ...p,
      { question: '', options: [''], marks: 1, correct_answer: '', explanation: '' }
    ]);

  const removeQuestion = (idx: number) =>
    setQuestions((p) => p.filter((_, i) => i !== idx));

  const addOption = (qIdx: number) => {
    const arr = [...questions];
    arr[qIdx].options.push('');
    setQuestions(arr);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const arr = [...questions];
    arr[qIdx].options.splice(oIdx, 1);
    setQuestions(arr);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form?.id) return;

    const sortedQuestions = questions.map((q, idx) => ({
      ...q,
      position: idx
    }));

    const payload = {
      ...form,
      duration_minutes: Number(form.duration_minutes),
      total_marks: Number(form.total_marks),
      pass_marks: Number(form.pass_marks),
      batch_ids: form.batch_ids && form.batch_ids.length > 0 ? form.batch_ids : null
    };

    const { error: examErr } = await supabase
      .from('exams')
      .update(payload)
      .eq('id', form.id);

    if (examErr) {
      toast.error('Failed to update exam.');
      return;
    }

    // Upsert questions
    for (const q of sortedQuestions) {
      if (q.id) {
        await supabase.from('exam_questions').update(q).eq('id', q.id);
      } else {
        await supabase.from('exam_questions').insert({ ...q, exam_id: form.id });
      }
    }
    
    toast.success('Exam and questions updated!');
    router.push('/admin/exams');
  };

  if (loading || !form) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Exam</h1>
        <Button variant="default" className="bg-red-500 text-white" type="button" onClick={() => deleteExamFromDB(form.id, 0)}>Delete Exam</Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Dropdown */}
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Course</label>
          <select
            name="course_id"
            value={form.course_id}
            onChange={handleFormChange}
            className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">-- Select Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>

          {form.course_id === "" && (
            <p className="text-red-500 text-sm mt-2">Please select a course.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>	
          <input name="title" value={form.title} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Batches (optional)</label>
          {batches.length === 0 ? (
            <div className="text-gray-400 text-sm">No batches available for this course.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {batches.map(batch => {
                const selected = (form.batch_ids || []).includes(batch.id);
                return (
                  <button
                    key={batch.id}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-sm font-medium transition-all duration-150
                      ${selected ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'}
                    `}
                    onClick={() => {
                      setForm((p) => {
                        if (!p) return p;
                        const ids = p.batch_ids || [];
                        return {
                          ...p,
                          batch_ids: selected ? ids.filter(id => id !== batch.id) : [...ids, batch.id]
                        };
                      });
                    }}
                    aria-pressed={selected}
                  >
                    {batch.batch_code}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input name="duration_minutes" type="number" value={form.duration_minutes} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Marks</label>
            <input name="total_marks" type="number" value={form.total_marks} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pass Marks</label>
            <input name="pass_marks" type="number" value={form.pass_marks} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_published}
            onCheckedChange={(checked: boolean) => setForm((p) => p ? { ...p, is_published: checked } : null)}
          />
          <label className="block text-sm font-medium text-gray-700">Publish?</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="p-4 mb-6 space-y-4 bg-white border border-gray-200 rounded-lg">
                <label className="block text-sm font-bold text-purple-500">Question #{qi + 1}</label>
                <textarea
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qi, 'question', e.target.value)}
                  className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700">Options</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex gap-2 items-center mb-2">
                      <input
                        value={opt}
                        onChange={(e) => handleOptionChange(qi, oi, e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <Button type="button" onClick={() => removeOption(qi, oi)}>-</Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => addOption(qi)}>+ Option</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                    <input
                      value={q.correct_answer}
                      onChange={(e) => handleQuestionChange(qi, 'correct_answer', e.target.value)}
                      className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marks</label>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) => handleQuestionChange(qi, 'marks', Number(e.target.value))}
                      className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Explanation</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(qi, 'explanation', e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="default" className="bg-red-500 text-white" type="button" onClick={() => removeQuestion(qi)}>
                    Remove Question
                  </Button>
                  <Button variant="default" className="bg-red-500 text-white" type="button" onClick={() => deleteQuestionFromDB(q.id || '', qi)}>
                    Delete Question
                  </Button>
                  <Button type="button" onClick={() => moveQuestion(qi, qi - 1)}>⬆️ Up</Button>
                  <Button type="button" onClick={() => moveQuestion(qi, qi + 1)}>⬇️ Down</Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={addQuestion}>+ Add Question</Button>
          </div>
        </section>

        <Button type="submit" className="mt-6">Save Exam</Button>
      </form>
    </div>
  );
}
