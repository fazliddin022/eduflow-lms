"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, CheckCircle,
  Circle, Award, ArrowLeft, BookOpen, Play,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  content: string | null;
  duration: number | null;
  order: number | null;
  isFree: boolean | null;
};

type CourseData = {
  id: string;
  title: string;
  lessons: Lesson[];
  quizzes: Array<{ id: string; title: string }>;
  isEnrolled: boolean;
  enrollment: { progress: number; isCompleted: boolean } | null;
};

export default function LearnPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchData = useCallback(async () => {
    const [courseRes, progressRes] = await Promise.all([
      fetch(`/api/courses/${id}`),
      fetch(`/api/courses/${id}/progress`),
    ]);
    const courseData = await courseRes.json();
    const progressData = await progressRes.json();

    if (!courseData.isEnrolled) { router.push(`/courses/${id}`); return; }

    setCourse(courseData);
    setProgress(courseData.enrollment?.progress || 0);
    setCompletedLessons(new Set(progressData.completedLessons || []));
    if (courseData.lessons.length > 0) {
      const firstIncomplete = courseData.lessons.find((l: Lesson) => !progressData.completedLessons?.includes(l.id));
      setCurrentLesson(firstIncomplete || courseData.lessons[0]);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleComplete = async () => {
    if (!currentLesson || completing) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/courses/${id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id }),
      });
      const data = await res.json();
      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]));
      setProgress(data.progress);

      if (data.isCompleted) {
        router.push(`/courses/${id}/certificate`);
        return;
      }

      // Next lesson
      if (course) {
        const currentIdx = course.lessons.findIndex((l) => l.id === currentLesson.id);
        if (currentIdx < course.lessons.length - 1) {
          setCurrentLesson(course.lessons[currentIdx + 1]);
        }
      }
    } finally { setCompleting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>
  );

  if (!course || !currentLesson) return null;

  const currentIdx = course.lessons.findIndex((l) => l.id === currentLesson.id);
  const isCompleted = completedLessons.has(currentLesson.id);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-gray-900 border-b border-white/5 px-4 h-14 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${id}`} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <p className="font-bold text-white text-sm truncate max-w-[300px]">{course.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-32 bg-white/10 rounded-full h-1.5">
              <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-gray-400 font-medium">{progress}%</span>
          </div>
          {course.quizzes.length > 0 && (
            <Link href={`/courses/${id}/quiz/${course.quizzes[0].id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl no-underline hover:bg-violet-700 transition-all">
              <BookOpen size={13} /> Quiz
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-gray-900 border-r border-white/5 overflow-y-auto hidden lg:block flex-shrink-0">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Course Content</p>
          </div>
          <div className="divide-y divide-white/5">
            {course.lessons.map((lesson, i) => {
              const isActive = lesson.id === currentLesson.id;
              const isDone = completedLessons.has(lesson.id);
              return (
                <button key={lesson.id} onClick={() => setCurrentLesson(lesson)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-all ${isActive ? "bg-violet-600/20 border-l-2 border-violet-500" : ""}`}>
                  <div className="flex-shrink-0">
                    {isDone
                      ? <CheckCircle size={18} className="text-green-400" />
                      : <Circle size={18} className={isActive ? "text-violet-400" : "text-gray-600"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? "text-violet-300" : isDone ? "text-gray-400" : "text-gray-300"}`}>
                      {i + 1}. {lesson.title}
                    </p>
                    {lesson.duration && <p className="text-xs text-gray-600 mt-0.5">{lesson.duration} min</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          {/* Video */}
          {currentLesson.videoUrl && (
            <div className="relative w-full bg-black" style={{ paddingBottom: "56.25%" }}>
              <iframe src={currentLesson.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen />
            </div>
          )}

          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* Lesson header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">
                  Lesson {currentIdx + 1} of {course.lessons.length}
                </p>
                <h1 className="text-2xl font-black text-white">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-gray-400 mt-2 text-sm">{currentLesson.description}</p>
                )}
              </div>
              {isCompleted && (
                <div className="flex items-center gap-1.5 text-green-400 text-sm font-bold flex-shrink-0">
                  <CheckCircle size={18} /> Completed
                </div>
              )}
            </div>

            {/* Content */}
            {currentLesson.content && (
              <div className="bg-gray-900 rounded-2xl border border-white/5 p-6 mb-6 text-gray-300 text-sm leading-relaxed">
                {currentLesson.content}
              </div>
            )}

            {/* Navigation + Complete */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => currentIdx > 0 && setCurrentLesson(course.lessons[currentIdx - 1])}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-white/10 transition-all">
                <ChevronLeft size={16} /> Previous
              </button>

              <button onClick={handleComplete} disabled={completing || isCompleted}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:opacity-90 shadow-lg shadow-violet-500/20"
                }`}>
                <CheckCircle size={16} />
                {completing ? "Saving..." : isCompleted ? "Completed" : "Mark Complete"}
              </button>

              <button
                onClick={() => currentIdx < course.lessons.length - 1 && setCurrentLesson(course.lessons[currentIdx + 1])}
                disabled={currentIdx === course.lessons.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-gray-300 rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-white/10 transition-all">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}