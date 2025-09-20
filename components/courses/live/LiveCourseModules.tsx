"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Play, Clock, Video, Calendar } from "lucide-react";
import { CourseModulesProps } from "@/types/course.type";

export default function LiveCourseModules({ modules }: CourseModulesProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ঘ ${mins > 0 ? `${mins}মি` : ""}`;
    }
    return `${mins}মি`;
  };

  const formatDateTime = (dateTime?: string) => {
    if (!dateTime) return "";
    return new Date(dateTime).toLocaleString('bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
  const liveSessionsCount = modules.reduce((total, module) => 
    total + module.lessons.filter(lesson => lesson.is_live_session).length, 0
  );
  const totalDuration = modules.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => 
      moduleTotal + (lesson.duration || 0), 0), 0
  );

  return (
    <div className="space-y-4">
      {/* Course Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">মোট মডিউল</p>
            <p className="text-xl font-bold text-gray-900">{modules.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">মোট লেকচার</p>
            <p className="text-xl font-bold text-gray-900">{totalLessons}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">লাইভ সেশন</p>
            <p className="text-xl font-bold text-green-600">{liveSessionsCount}</p>
          </div>
        </div>
        {totalDuration > 0 && (
          <div className="text-center mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">মোট সময়কাল</p>
            <p className="text-lg font-semibold text-gray-900">{formatDuration(totalDuration)}</p>
          </div>
        )}
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {modules.map((module) => (
          <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Module Header */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center space-x-3">
                {expandedModules.has(module.id) ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">
                    মডিউল {module.position}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{module.lessons.length} লেকচার</span>
                <span className="text-green-600">
                  {module.lessons.filter(l => l.is_live_session).length} লাইভ
                </span>
              </div>
            </button>

            {/* Module Lessons */}
            {expandedModules.has(module.id) && (
              <div className="bg-white border-t border-gray-200">
                <div className="space-y-1">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {lesson.is_live_session ? (
                          <Video className="w-4 h-4 text-green-600" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <span className="text-sm text-gray-700">
                            {lesson.position}. {lesson.title}
                          </span>
                          {lesson.is_live_session && lesson.live_start_time && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Calendar className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600">
                                {formatDateTime(lesson.live_start_time)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.is_live_session && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            লাইভ
                          </span>
                        )}
                        {lesson.duration && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(lesson.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expand All Button */}
      {modules.length > 0 && (
        <div className="text-center pt-4">
          <button
            onClick={() => {
              if (expandedModules.size === modules.length) {
                setExpandedModules(new Set());
              } else {
                setExpandedModules(new Set(modules.map(m => m.id)));
              }
            }}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors"
          >
            {expandedModules.size === modules.length ? "সব বন্ধ করুন" : "সব খুলুন"}
          </button>
        </div>
      )}
    </div>
  );
} 