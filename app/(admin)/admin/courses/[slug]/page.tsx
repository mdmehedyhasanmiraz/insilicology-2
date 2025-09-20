"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import toast, { Toaster } from "react-hot-toast";
import { uploadPoster } from "./actions";


interface Lesson {
  id?: string;
  title: string;
  position: number;
  notes: string;
  video_url: string;
  is_live_session: boolean;
  live_start_time: string;
  duration: number;
  module_id?: string;
}

interface Module {
  id?: string;
  title: string;
  position: number;
  description: string;
  course_id?: string;
  lessons: Lesson[];
}

interface CourseForm {
  id: string;
  title: string;
  slug: string;
  duration: string;
  price_regular: string;
  price_offer: string;
  poster: string;
  og_image: string;
  enroll_link: string;
  certificate: string;
  type: 'live' | 'recorded' | 'hybrid';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  starts_on: string;
  is_published: boolean;
  description: string;
  included: string[];
  for_whom: string[];
  requirements: string[];
  topics: string[];
}

type ArrayFieldName = 'included' | 'for_whom' | 'requirements' | 'topics';

interface FormField {
  name: keyof CourseForm;
  label: string;
  type?: 'text' | 'number' | 'checkbox';
  value?: string | number;
}

export default function EditCoursePage() {
  const { slug } = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [modules, setModules] = useState<Module[]>([]);
  const [form, setForm] = useState<CourseForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [jsonUploadOpen, setJsonUploadOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const formFields: FormField[] = [
    { name: "title", label: "Course Title" },
    { name: "slug", label: "Slug" },
    { name: "price_regular", label: "Regular Price", type: "number" },
    { name: "price_offer", label: "Offer Price", type: "number" },
    { name: "duration", label: "Duration" },
    { name: "poster", label: "Poster Image URL" },
    { name: "og_image", label: "OG Image URL (auto generated)" },
    { name: "enroll_link", label: "Enroll Link" },
    { name: "certificate", label: "Certificate" },
  ];

  const defaultLesson = (): Lesson => ({
    title: "",
    position: 1,
    notes: "",
    video_url: "",
    is_live_session: false,
    live_start_time: "",
    duration: 0,
  });

  const defaultModule = (): Module => ({
    title: "",
    position: modules.length + 1,
    description: "",
    lessons: [defaultLesson()],
  });

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error("Error fetching course:", error);
        toast.error("Error fetching course");
        return router.push("/admin/courses");
      }

      setForm({
        ...data,
        included: data.included || [""],
        for_whom: data.for_whom || [""],
        requirements: data.requirements?.split(",") || [""],
        topics: data.topics || [""],
        starts_on: data.starts_on?.split("T")[0] || "",
      });

      const { data: mods, error: modErr } = await supabase
        .from("modules")
        .select("*, lessons(*)")
        .eq("course_id", data.id)
        .order("position", { ascending: true });

      if (modErr) {
        console.error("Error fetching modules:", modErr);
        toast.error("Error fetching modules");
      }

      // Process modules and ensure lessons are ordered by position
      const processedModules = (mods || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || [])
          .sort((a: Lesson, b: Lesson) => a.position - b.position)
          .map((lesson: Lesson) => ({ ...lesson })),
      }));

      setModules(processedModules);

      setLoading(false);
    };

    fetchData();
  }, [slug, router, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setForm((prev) => {
      if (!prev) return null;
      
      // Handle numeric fields
      if (name === 'price_regular' || name === 'price_offer') {
        return {
          ...prev,
          [name]: value
        };
      }
      
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleArrayChange = (name: ArrayFieldName, idx: number, value: string) => {
    if (!form) return;
    const arr = [...form[name]];
    arr[idx] = value;
    setForm((prev) => prev ? { ...prev, [name]: arr } : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form) return;

    const updateData = {
      ...form,
      included: form.included,
      for_whom: form.for_whom,
      requirements: form.requirements.join(","),
      topics: form.topics,
      starts_on: form.starts_on || null,
      price_regular: Number(form.price_regular),
      price_offer: Number(form.price_offer),
    };

    const { error } = await supabase
      .from("courses")
      .update(updateData)
      .eq("id", form.id);

    if (error) {
      console.error(error);
      toast.error("Update failed");
    } else {
      toast.success("Course updated!");
      router.push("/admin/courses");
    }

    for (const moduleData of modules) {
      let moduleId = moduleData.id;

      if (moduleId) {
        const { error: modError } = await supabase.from("modules").update({
          title: moduleData.title,
          description: moduleData.description,
          position: moduleData.position,
        }).eq("id", moduleId);
        
        if (modError) {
          console.error("Error updating module:", modError);
          toast.error("Error updating module");
        }
      } else {
        const { data: mod, error: modError } = await supabase
          .from("modules")
          .insert({
            course_id: form.id,
            title: moduleData.title,
            description: moduleData.description,
            position: moduleData.position,
          })
          .select()
          .single();
          
        if (modError) {
          console.error("Error creating module:", modError);
          toast.error("Error creating module");
          continue;
        }
        moduleId = mod?.id;
      }

      // Handle lessons for this module
      console.log(`Processing ${moduleData.lessons.length} lessons for module: ${moduleData.title}`);
      
      for (let lessonIndex = 0; lessonIndex < moduleData.lessons.length; lessonIndex++) {
        const lesson = moduleData.lessons[lessonIndex];
        
        // Prepare lesson data
        const lessonData = {
          title: lesson.title,
          position: lessonIndex + 1, // Ensure position is set
          notes: lesson.notes || null,
          video_url: lesson.video_url || null,
          is_live_session: lesson.is_live_session || false,
          live_start_time: lesson.live_start_time ? new Date(lesson.live_start_time).toISOString() : null,
          duration: lesson.duration || 0,
          module_id: moduleId
        };

        console.log(`Processing lesson ${lessonIndex + 1}:`, { 
          id: lesson.id, 
          title: lesson.title, 
          isNew: !lesson.id,
          moduleId 
        });

        if (lesson.id) {
          // Update existing lesson
          const { error: lessonError } = await supabase
            .from("lessons")
            .update(lessonData)
            .eq("id", lesson.id);
            
          if (lessonError) {
            console.error("Error updating lesson:", lessonError);
            toast.error("Error updating lesson");
          } else {
            console.log(`Successfully updated lesson: ${lesson.title}`);
          }
        } else {
          // Insert new lesson
          const { error: lessonError } = await supabase
            .from("lessons")
            .insert(lessonData);
            
          if (lessonError) {
            console.error("Error creating lesson:", lessonError);
            toast.error("Error creating lesson");
          } else {
            console.log(`Successfully created lesson: ${lesson.title}`);
          }
        }
      }
    }
  };

  const getInputValue = (field: FormField, form: CourseForm | null): string => {
    if (!form) return "";
    const value = form[field.name];
    if (value === undefined) return "";
    return String(value);
  };

  const BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/course-banners/`;

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePosterUpload = async (file: File) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadPoster(formData);
    
    if (result.success) {
      const posterUrl = `${BUCKET_URL}${result.fileName}`;
      setForm((prev) => prev ? { 
        ...prev, 
        poster: result.fileName,
        og_image: posterUrl 
      } : null);
      toast.success('Poster uploaded!');
    } else {
      console.error('Upload error:', result.error);
      toast.error(`Upload failed: ${result.error}`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePosterUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePosterUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const jsonDemo = `[
  {
    "title": "Introduction to Web Development",
    "description": "Learn the basics of web development",
    "position": 1,
    "lessons": [
      {
        "title": "What is Web Development?",
        "position": 1,
        "notes": "Introduction to the world of web development",
        "video_url": "https://example.com/video1.mp4",
        "is_live_session": false,
        "live_start_time": "",
        "duration": 1800
      },
      {
        "title": "Setting Up Your Development Environment",
        "position": 2,
        "notes": "Install and configure your development tools",
        "video_url": "https://example.com/video2.mp4",
        "is_live_session": false,
        "live_start_time": "",
        "duration": 2400
      }
    ]
  },
  {
    "title": "HTML Fundamentals",
    "description": "Master the basics of HTML markup",
    "position": 2,
    "lessons": [
      {
        "title": "HTML Structure and Elements",
        "position": 1,
        "notes": "Learn about HTML document structure",
        "video_url": "https://example.com/video3.mp4",
        "is_live_session": true,
        "live_start_time": "2024-01-15T10:00:00",
        "duration": 3600
      }
    ]
  }
]

// Note: If a module with the same title already exists, 
// new lessons will be added to that module instead of creating a duplicate.`;

  const copyDemo = () => {
    navigator.clipboard.writeText(jsonDemo);
    toast.success("Demo JSON copied to clipboard!");
  };

  const handleJsonUpload = () => {
    try {
      const parsedModules = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsedModules)) {
        toast.error("JSON must be an array of modules");
        return;
      }

      // Validate the structure
      for (const moduleData of parsedModules) {
        if (!moduleData.title || !moduleData.description || !Array.isArray(moduleData.lessons)) {
          toast.error("Each module must have title, description, and lessons array");
          return;
        }

        for (const lesson of moduleData.lessons) {
          if (!lesson.title || typeof lesson.position !== 'number') {
            toast.error("Each lesson must have title and position");
            return;
          }
        }
      }

      // Merge with existing modules
      const updatedModules = [...modules];
      
      for (const newModuleData of parsedModules) {
        const existingModuleIndex = updatedModules.findIndex(
          existingModule => existingModule.title.toLowerCase() === newModuleData.title.toLowerCase()
        );

        if (existingModuleIndex !== -1) {
          // Module exists - merge lessons
          const existingModule = updatedModules[existingModuleIndex];
          const existingLessons = existingModule.lessons || [];
          
          // Calculate new positions for the new lessons
          const newLessons = newModuleData.lessons.map((lesson: Lesson, index: number) => ({
            ...lesson,
            position: existingLessons.length + index + 1
          }));

          // Merge lessons
          updatedModules[existingModuleIndex] = {
            ...existingModule,
            lessons: [...existingLessons, ...newLessons]
          };

          toast.success(`Added ${newLessons.length} lessons to existing module: "${newModuleData.title}"`);
        } else {
          // New module - add it
          const newModuleWithLessons = {
            ...newModuleData,
            lessons: newModuleData.lessons.map((lesson: Lesson, index: number) => ({
              ...lesson,
              position: index + 1
            }))
          };
          
          updatedModules.push(newModuleWithLessons);
          toast.success(`Added new module: "${newModuleData.title}" with ${newModuleData.lessons.length} lessons`);
        }
      }

      setModules(updatedModules);
      setJsonUploadOpen(false);
      setJsonInput("");
      toast.success("JSON upload completed successfully!");
    } catch (error) {
      toast.error("Invalid JSON format");
      console.error("JSON parsing error:", error);
    }
  };

  if (loading || !form) return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-12 px-2 md:px-4">
      <Toaster />
      <h1 className="text-3xl font-bold mb-8">Edit Course: {form.title}</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.filter(f => f.name !== 'poster').map((f) => (
          <div key={f.name} className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
            <input
              name={f.name}
              type={f.type || "text"}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={getInputValue(f, form)}
              onChange={handleChange}
            />
          </div>
        ))}

        <div className="mb-2 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Poster</label>
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition cursor-pointer relative"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            style={{ minHeight: 180 }}
          >
            {form?.poster ? (
              <img
                src={form.poster.startsWith('http') ? form.poster : `${BUCKET_URL}${form.poster}`}
                alt="Course Poster"
                className="max-h-40 rounded shadow mb-2 object-contain"
              />
            ) : (
              <span className="text-gray-400">Drag & drop or click to upload poster</span>
            )}
            <input
              type="file"
              accept="image/webp"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="text-xs text-gray-500 mt-2">Must be: 1280x720p, WebP, Max 100KB</span>
            {form?.poster && (
              <button
                type="button"
                className="absolute top-2 right-2 bg-white border border-gray-200 rounded-full p-1 shadow hover:bg-gray-100"
                onClick={e => { e.stopPropagation(); setForm(prev => prev ? { ...prev, poster: "" } : null); }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            {["live","recorded","hybrid"].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
            {["beginner","intermediate","advanced"].map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input type="date" name="starts_on" className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.starts_on} onChange={handleChange} />
        </div>

        <div className="flex items-center space-x-3 md:col-span-2">
          <Switch id="is_published" checked={form.is_published} onCheckedChange={(val: boolean) => setForm((prev) => prev ? { ...prev, is_published: val } : null)} />
          <label className="block text-sm font-medium text-gray-700">Publish Course?</label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea name="description" className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500" value={form.description} rows={5} onChange={handleChange} />
        </div>

        {(['for_whom', 'included', 'requirements', 'topics'] as ArrayFieldName[]).map((name) => (
          <div key={name} className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">{name === "for_whom" ? "Who is this for?" : name}</label>
            {form[name].map((val, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input 
                  value={val} 
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500" 
                  onChange={e => handleArrayChange(name, idx, e.target.value)} 
                />
                <Button type="button" onClick={() => {
                  const arr = [...form[name]];
                  arr.splice(idx, 1);
                  setForm((prev) => prev ? { ...prev, [name]: arr } : null);
                }}>-</Button>
              </div>
            ))}
            <Button type="button" onClick={() => {
              const arr = [...form[name]];
              arr.push("");
              setForm((prev) => prev ? { ...prev, [name]: arr } : null);
            }}>+ Add</Button>
          </div>
        ))}

        <div className="md:col-span-2 mt-8 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Modules & Lessons</h2>
            <Button
              type="button"
              onClick={() => setJsonUploadOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Upload JSON
            </Button>
          </div>

          {modules.map((module, modIndex) => (
            <div key={modIndex} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                  <input
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={module.title}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[modIndex].title = e.target.value;
                      setModules(updated);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-2"
                  onClick={async () => {
                    // If the module has an ID, delete it and its lessons from the database
                    if (module.id) {
                      // Delete all lessons in this module first
                      for (const lesson of module.lessons) {
                        if (lesson.id) {
                          const { error } = await supabase
                            .from("lessons")
                            .delete()
                            .eq("id", lesson.id);
                            
                          if (error) {
                            console.error("Error deleting lesson:", error);
                            toast.error("Error deleting lesson");
                          }
                        }
                      }
                      
                      // Delete the module
                      const { error } = await supabase
                        .from("modules")
                        .delete()
                        .eq("id", module.id);
                        
                      if (error) {
                        console.error("Error deleting module:", error);
                        toast.error("Error deleting module");
                        return;
                      }
                    }
                    
                    // Remove from local state
                    const updated = [...modules];
                    updated.splice(modIndex, 1);
                    setModules(updated);
                    
                    toast.success("Module removed");
                  }}
                >
                  Remove Module
                </Button>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Description</label>
                <textarea
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={module.description || ""}
                  onChange={(e) => {
                    const updated = [...modules];
                    updated[modIndex].description = e.target.value;
                    setModules(updated);
                  }}
                />
              </div>

              {module.lessons.map((lesson: Lesson, lessonIndex: number) => (
                <div key={lessonIndex} className="bg-white border-l-4 border-purple-500 pl-4 my-4 rounded-lg shadow-sm p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lesson Title</label>
                  <input
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={lesson.title}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[modIndex].lessons[lessonIndex].title = e.target.value;
                      setModules(updated);
                    }}
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Notes</label>
                  <textarea
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={lesson.notes || ""}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[modIndex].lessons[lessonIndex].notes = e.target.value;
                      setModules(updated);
                    }}
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Video URL</label>
                  <input
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={lesson.video_url || ""}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[modIndex].lessons[lessonIndex].video_url = e.target.value;
                      setModules(updated);
                    }}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch
                      checked={lesson.is_live_session}
                      onCheckedChange={(val) => {
                        const updated = [...modules];
                        updated[modIndex].lessons[lessonIndex].is_live_session = val;
                        setModules(updated);
                      }}
                    />
                    <label className="block text-sm font-medium text-gray-700">Is Live Session?</label>
                  </div>
                  {lesson.is_live_session && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Live Start Time</label>
                      <input
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="datetime-local"
                        value={lesson.live_start_time || ""}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[modIndex].lessons[lessonIndex].live_start_time = e.target.value;
                          setModules(updated);
                        }}
                      />
                      <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Duration (seconds)</label>
                      <input
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        type="number"
                        value={lesson.duration}
                        onChange={(e) => {
                          const updated = [...modules];
                          updated[modIndex].lessons[lessonIndex].duration = Number(e.target.value);
                          setModules(updated);
                        }}
                      />
                    </>
                  )}
                  <Button
                    variant="default"
                    type="button"
                    className="mt-2 bg-red-500 text-white"
                    onClick={async () => {
                      // If the lesson has an ID, delete it from the database
                      if (lesson.id) {
                        const { error } = await supabase
                          .from("lessons")
                          .delete()
                          .eq("id", lesson.id);
                          
                        if (error) {
                          console.error("Error deleting lesson:", error);
                          toast.error("Error deleting lesson");
                          return;
                        }
                      }
                      
                      // Remove from local state
                      const updated = [...modules];
                      updated[modIndex].lessons.splice(lessonIndex, 1);
                      setModules(updated);
                      
                      toast.success("Lesson removed");
                    }}
                  >
                    Remove Lesson
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                className="mt-2"
                onClick={() => {
                  const updated = [...modules];
                  const newLesson = defaultLesson();
                  newLesson.position = updated[modIndex].lessons.length + 1;
                  updated[modIndex].lessons.push(newLesson);
                  setModules(updated);
                }}
              >
                + Add Lesson
              </Button>
            </div>
          ))}

          <Button
            type="button"
            className="mt-2"
            onClick={() => setModules([...modules, defaultModule()])}
          >
            + Add Module
          </Button>
        </div>

        <div className="md:col-span-2 flex justify-end mt-8">
          <Button type="submit" className="px-8 py-3 text-lg">Save Changes</Button>
        </div>
      </form>

      {/* JSON Upload Modal */}
      {jsonUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setJsonUploadOpen(false)}>
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-7xl p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Modules & Lessons (JSON)</h2>
              <button
                onClick={() => setJsonUploadOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demo Format - Left Side */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Format (Click to copy)
                </label>
                <div className="bg-gray-100 p-3 rounded-lg border cursor-pointer h-96 overflow-y-auto" onClick={copyDemo}>
                  <pre className="text-xs text-gray-600">
                    {jsonDemo}
                  </pre>
                  <p className="text-xs text-blue-600 mt-2">Click to copy demo format</p>
                </div>
              </div>

              {/* JSON Input - Right Side */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your JSON here
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-96 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm resize-none"
                  placeholder="Paste your JSON modules and lessons here..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => setJsonUploadOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleJsonUpload}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
