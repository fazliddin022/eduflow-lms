"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react";
import Navbar from "@/components/Navbar";

type EnrolledCourse = {
  id: string;
  progress: number;
  isCompleted: boolean;
  enrolledAt: string;
  courseId: string;
  courseTitle: string;
  courseCategory: string;
  courseLevel: string;
  totalLessons: number | null;
  teacherName: string;
};

const CATEGORY_EMOJIS: Record<string, string> = {
  "Web Development": "🌐", "Programming": "💻", "Data Science": "📊",
  "Design": "🎨", "Backend": "⚙️", "Mobile": "📱",
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/my-courses")
      .then((r) => r.json())
      .then((data) => { setCourses(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen size={28} className="text-violet-600" />
          My Courses
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No courses yet</h2>
            <p className="text-gray-500 mb-5">Start learning by enrolling in a course</p>
            <Link href="/courses" className="inline-block px-6 py-3 bg-violet-600 text-white font-bold rounded-2xl no-underline hover:bg-violet-700">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {CATEGORY_EMOJIS[course.courseCategory] || "📚"}
                  </div>
                  {course.isCompleted && <CheckCircle size={20} className="text-green-500" />}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2">{course.courseTitle}</h3>
                <p className="text-xs text-gray-400 mb-3">{course.teacherName} · {course.totalLessons} lessons</p>

                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mb-1">
                  <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mb-4">{course.progress}% complete</p>

                <div className="flex gap-2">
                  <Link href={`/courses/${course.courseId}/learn`}
                    className="flex-1 text-center py-2 bg-violet-600 text-white font-bold text-xs rounded-xl no-underline hover:bg-violet-700 transition-all">
                    {course.progress > 0 ? "Continue" : "Start"}
                  </Link>
                  {course.isCompleted && (
                    <Link href={`/courses/${course.courseId}/certificate`}
                      className="flex items-center gap-1 px-3 py-2 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold text-xs rounded-xl no-underline hover:opacity-80 transition-all">
                      <Award size={13} /> Cert
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}