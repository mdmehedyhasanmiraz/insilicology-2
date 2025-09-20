"use client";

import { ChevronDown, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: string;
  title: string;
  position: number;
  duration?: number; // in seconds
}

interface Module {
  id: string;
  title: string;
  position: number;
  description?: string;
  lessons: Lesson[];
}

interface CourseModulesProps {
  modules: Module[];
}

export default function CourseModules({ modules }: CourseModulesProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    
    const totalMinutes = Math.floor(seconds / 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="space-y-3">
      {modules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No modules available for this course.</p>
        </div>
      ) : (
        modules.map((module) => (
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
                <ul className="divide-y divide-gray-100">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id}>
                      <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Play className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {lesson.title}
                            </p>
                            {lesson.duration && (
                              <p className="text-xs text-gray-500">
                                {formatDuration(lesson.duration)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))
      )}
    </div>
  );
} 