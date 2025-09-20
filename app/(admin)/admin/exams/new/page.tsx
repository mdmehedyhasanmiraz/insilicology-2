"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import React from 'react';

interface Course {
  id: string;
  title: string;
}

interface Question {
  question: string;
  options: string[];
  marks: number;
  correct_answer: string;
  explanation: string;
}

interface Batch {
  id: string;
  batch_code: string;
}

export default function CreateExamPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [form, setForm] = useState({
    course_id: "",
    title: "",
    description: "",
    duration_minutes: "",
    total_marks: "",
    pass_marks: "",
    is_published: false,
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: [""],
      marks: 1,
      correct_answer: "",
      explanation: "",
    },
  ]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchIds, setBatchIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch courses:", error);
      } else {
        setCourses(data || []);
      }
    };

    fetchCourses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!form.course_id) {
      setBatches([]);
      setBatchIds([]);
      return;
    }
    const fetchBatches = async () => {
      const { data, error } = await supabase
        .from('live_batches')
        .select('id, batch_code')
        .eq('course_id', form.course_id);
      if (!error) setBatches(data || []);
    };
    fetchBatches();
  }, [form.course_id]);

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string | number) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        options: [""],
        marks: 1,
        correct_answer: "",
        explanation: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const examPayload = {
      ...form,
      duration_minutes: Number(form.duration_minutes),
      total_marks: Number(form.total_marks),
      pass_marks: Number(form.pass_marks),
      batch_ids: batchIds.length > 0 ? batchIds : null,
    };

    const { data: exam, error: examError } = await supabase
      .from("exams")
      .insert([examPayload])
      .select()
      .single();

    if (examError) {
      toast.error("Failed to create exam.");
      console.error(examError);
      return;
    }

    const questionsPayload = questions.map((q) => ({
      ...q,
      exam_id: exam.id,
    }));

    const { error: questionError } = await supabase
      .from("exam_questions")
      .insert(questionsPayload);

    if (questionError) {
      toast.error("Exam created, but questions failed.");
      console.error(questionError);
    } else {
      toast.success("Exam and questions created!");
      router.push("/admin/exams");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Create Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Course</label>
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
        </div>

        {/* Modern Batch Chip Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Batches (optional)</label>
          {batches.length === 0 ? (
            <div className="text-gray-400 text-sm">No batches available for this course.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {batches.map(batch => {
                const selected = batchIds.includes(batch.id);
                return (
                  <button
                    key={batch.id}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-sm font-medium transition-all duration-150
                      ${selected ? 'bg-purple-600 text-white border-purple-600 shadow' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-400'}
                    `}
                    onClick={() => {
                      setBatchIds(selected ? batchIds.filter(id => id !== batch.id) : [...batchIds, batch.id]);
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Exam Title</label>
          <input name="title" value={form.title} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
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

        <div className="flex items-center space-x-3">
          <Switch
            id="is_published"
            checked={form.is_published}
            onCheckedChange={(val) => setForm((prev) => ({ ...prev, is_published: val }))}
          />
          <label className="block text-sm font-medium text-gray-700">Publish Exam?</label>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-10 mb-4">Questions</h2>

          {questions.map((q, index) => (
            <div key={index} className="p-4 rounded-lg mb-6 space-y-4 bg-white border border-gray-200">
              <div>
                <label className="block text-sm font-bold text-purple-500">Question {index + 1}</label>
                <textarea
                  className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2 mb-2">
                    <input
                      value={opt}
                      onChange={(e) => handleOptionChange(index, oIdx, e.target.value)}
                      placeholder={`Option ${oIdx + 1}`}
                      className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Button type="button" onClick={() => removeOption(index, oIdx)}>-</Button>
                  </div>
                ))}
                <Button type="button" onClick={() => addOption(index)}>
                  + Add Option
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Correct Answer (exact option text)</label>
                    <input
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={q.correct_answer}
                    onChange={(e) => handleQuestionChange(index, "correct_answer", e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Marks</label>
                    <input
                    type="number"
                    className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={q.marks}
                    onChange={(e) => handleQuestionChange(index, "marks", Number(e.target.value))}
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Explanation (optional)</label>
                <textarea
                  className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={q.explanation}
                  onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
                />
              </div>

              <Button type="button" variant="default" className="bg-red-500 text-white" onClick={() => removeQuestion(index)}>
                Remove Question
              </Button>
            </div>
          ))}

          <Button type="button" onClick={addQuestion}>
            + Add Question
          </Button>
        </div>

        <Button type="submit" className="mt-6">Create Exam</Button>
      </form>
    </div>
  );
}
