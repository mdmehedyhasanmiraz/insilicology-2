"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Module, Lesson, UserCourseProgress, ModuleData, LessonData } from "@/types/course.type";
import { ChevronDown, ChevronRight, CheckCircle, Play, CheckCircle2 } from "lucide-react";

export default function RecCourseDetail() {
  const params = useParams();
  const slug = params.slug;
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserCourseProgress[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (!slug) return;
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get course by slug
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .single();
      
      if (courseError || !course) {
        console.error("Course not found:", courseError);
        setLoading(false);
        return;
      }

      // 2. Get modules for course
      const { data: modulesData, error: modulesError } = await supabase
        .from("modules")
        .select("id, title, position, description")
        .eq("course_id", course.id)
        .order("position", { ascending: true });
      
      if (modulesError || !modulesData) {
        console.error("Modules error:", modulesError);
        setLoading(false);
        return;
      }

      // 3. Get all lessons for the course
      const moduleIds = modulesData.map((m: ModuleData) => m.id);
      const { data: lessonsData, error: lessonsError } = await supabase
        .from("lessons")
        .select("id, module_id, title, video_url, notes, position, duration")
        .in("module_id", moduleIds)
        .order("position", { ascending: true });
      
      if (lessonsError || !lessonsData) {
        console.error("Lessons error:", lessonsError);
        setLoading(false);
        return;
      }

      // 4. Get user progress
      const { data: { user } } = await supabase.auth.getUser();
      let progressData: UserCourseProgress[] = [];
      if (user) {
        const { data: userProgressData } = await supabase
          .from("user_course_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id);
        
        progressData = userProgressData || [];
        setUserProgress(progressData);
      }

      // 5. Attach lessons to modules
      const modulesWithLessons: Module[] = modulesData.map((mod: ModuleData) => ({
        ...mod,
        lessons: lessonsData.filter((l: LessonData) => l.module_id === mod.id),
      }));

      setModules(modulesWithLessons);
      setAllLessons(lessonsData);
      
      // 6. Find the first incomplete lesson or default to first lesson
      let defaultLesson = lessonsData[0] || null;
      
      if (user && progressData && progressData.length > 0) {
        // Find the first incomplete lesson
        const incompleteLesson = lessonsData.find(lesson => 
          !progressData.some((progress: UserCourseProgress) => 
            progress.lesson_id === lesson.id && progress.completed
          )
        );
        
        if (incompleteLesson) {
          defaultLesson = incompleteLesson;
        }
      }
      
      setSelectedLesson(defaultLesson);
      
      // Open the module containing the default lesson
      if (defaultLesson) {
        const moduleContainingDefaultLesson = modulesWithLessons.find(module => 
          module.lessons.some(lesson => lesson.id === defaultLesson.id)
        );
        setOpenModule(moduleContainingDefaultLesson?.id || null);
        
        // Set the correct lesson index
        const lessonIndex = lessonsData.findIndex(lesson => lesson.id === defaultLesson.id);
        setCurrentLessonIndex(lessonIndex >= 0 ? lessonIndex : 0);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    if (!selectedLesson) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Get course ID from the first module
      const courseId = modules[0]?.id ? 
        (await supabase.from("modules").select("course_id").eq("id", modules[0].id).single()).data?.course_id : null;
      
      if (!courseId) return;

      const { error } = await supabase
        .from("user_course_progress")
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lesson_id: selectedLesson.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });

      if (!error) {
        // Update local state
        setUserProgress(prev => {
          const existing = prev.find(p => p.lesson_id === selectedLesson.id);
          if (existing) {
            return prev.map(p => p.lesson_id === selectedLesson.id ? { ...p, completed: true } : p);
          } else {
            return [...prev, {
              id: Date.now().toString(),
              user_id: user.id,
              course_id: courseId,
              lesson_id: selectedLesson.id,
              completed: true,
              completed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }];
          }
        });

        // If all lessons completed, trigger auto certificate issuance for recorded courses
        try {
          // Determine course id again
          const courseId = modules[0]?.id ? 
            (await supabase.from("modules").select("course_id").eq("id", modules[0].id).single()).data?.course_id : null;
          if (courseId) {
            // Check if all lessons complete locally
            const newlyCompletedIds = new Set([
              ...userProgress.filter(p => p.completed).map(p => p.lesson_id),
              selectedLesson.id
            ]);
            const allDone = allLessons.every(l => newlyCompletedIds.has(l.id));
            if (allDone) {
              await fetch('/api/certificates/auto/recorded', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, courseId })
              });
            }
          }
        } catch (e) {
          console.error('Auto certificate error:', e);
        }
      }
    } catch (error) {
      console.error("Error marking as complete:", error);
    }
  };

  const navigateToLesson = (direction: 'prev' | 'next') => {
    const currentIndex = allLessons.findIndex(lesson => lesson.id === selectedLesson?.id);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(allLessons.length - 1, currentIndex + 1);
    }

    const newLesson = allLessons[newIndex];
    setSelectedLesson(newLesson);
    setCurrentLessonIndex(newIndex);

    // Auto-open the module containing the new lesson
    openModuleForLesson(newLesson);
  };

  const openModuleForLesson = (lesson: Lesson) => {
    const moduleContainingLesson = modules.find(module => 
      module.lessons.some(l => l.id === lesson.id)
    );
    if (moduleContainingLesson) {
      setOpenModule(moduleContainingLesson.id);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress.some(progress => progress.lesson_id === lessonId && progress.completed);
  };

  // YouTube URL helpers
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    // Handle youtu.be URLs
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1];
    }
    // Handle youtube.com URLs
    else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1];
    }
    // Handle youtube.com/embed URLs
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1];
    }
    
    // Remove any additional parameters
    if (videoId.includes('&')) {
      videoId = videoId.split('&')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Helper function to render video content
  const renderVideoContent = () => {
    if (!selectedLesson?.video_url) {
      return (
        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-center">
            <Play className="h-16 w-16 mx-auto mb-2" />
            <p>Select a lesson to watch the video</p>
          </div>
        </div>
      );
    }

    if (isYouTubeUrl(selectedLesson.video_url)) {
      return (
        <iframe
          src={getYouTubeEmbedUrl(selectedLesson.video_url)}
          title={selectedLesson.title}
          className="w-full aspect-video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }

    return (
      <video
        src={selectedLesson.video_url}
        controls
        className="w-full aspect-video bg-black"
        poster="/images/video-placeholder.webp"
        preload="metadata"
        onError={(e) => console.error("Video error:", e)}
        onLoadStart={() => console.log("Video loading started")}
        onCanPlay={() => console.log("Video can play")}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
        {/* Left: Video Section Skeleton */}
        <div className="flex-1 space-y-4">
          {/* Lesson Title Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
              <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Video Player Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="w-full aspect-video bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="text-gray-400">
                <div className="h-16 w-16 mx-auto mb-2 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 rounded animate-pulse w-32 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
            </div>
          </div>

          {/* Notes Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Right: Course Contents Skeleton */}
        <div className="w-full lg:w-[30%]">
          <div className="lg:sticky lg:top-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4 flex-shrink-0"></div>
            
            <div className="space-y-3 flex-1">
              {/* Module Skeletons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="w-full flex items-center justify-between px-4 py-3 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  {/* Lesson Skeletons */}
                  <div className="bg-white border-t border-gray-200">
                    <div className="divide-y divide-gray-100">
                      {[1, 2].map((j) => (
                        <div key={j} className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-full mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* Left: Video Section */}
      <div className="flex-1 space-y-4">
        {/* Lesson Title */}
        {selectedLesson && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedLesson.title}
                </h2>
                {selectedLesson.duration && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {formatDuration(selectedLesson.duration)} min
                  </span>
                )}
              </div>
              {isLessonCompleted(selectedLesson.id) && (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              )}
            </div>
          </div>
        )}

        {/* Video Player */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div>
            {renderVideoContent()}
          </div>
        </div>

        {/* Navigation Buttons - Just below video */}
        {selectedLesson && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateToLesson('prev')}
                disabled={currentLessonIndex === 0}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              
              <button
                onClick={markAsComplete}
                disabled={isLessonCompleted(selectedLesson.id)}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLessonCompleted(selectedLesson.id) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </button>
              
              <button
                onClick={() => navigateToLesson('next')}
                disabled={currentLessonIndex === allLessons.length - 1}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Lesson Notes */}
        {selectedLesson?.notes && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-medium text-gray-900 mb-2">Notes:</h3>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {selectedLesson.notes}
            </div>
          </div>
        )}
      </div>

      {/* Right: Course Contents */}
      <div className="w-full lg:w-[30%]">
        <div className="lg:sticky lg:top-0 bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-h-[calc(100vh-3rem)] flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex-shrink-0">Course Contents</h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto">
            {modules.map((module) => (
              <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpenModule(openModule === module.id ? null : module.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900">{module.title}</span>
                    <span className="text-xs text-gray-500">
                      {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {openModule === module.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {openModule === module.id && (
                  <div className="bg-white border-t border-gray-200">
                    {module.lessons.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">No lessons available</div>
                    ) : (
                      <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                        {module.lessons.map((lesson) => {
                          const isCompleted = isLessonCompleted(lesson.id);
                          const isSelected = selectedLesson?.id === lesson.id;
                          
                          return (
                            <li key={lesson.id}>
                              <button
                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                  isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                                onClick={() => {
                                  setSelectedLesson(lesson);
                                  setCurrentLessonIndex(allLessons.findIndex(l => l.id === lesson.id));
                                  openModuleForLesson(lesson);
                                }}
                              >
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  {isCompleted ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                  ) : (
                                    <Play className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      isSelected ? 'text-blue-900' : 'text-gray-900'
                                    }`}>
                                      {lesson.title}
                                    </p>
                                    {lesson.duration && (
                                      <p className="text-xs text-gray-500">
                                        {formatDuration(lesson.duration)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 