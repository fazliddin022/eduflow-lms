"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen, Users, Plus, Eye, EyeOff,
  TrendingUp, Edit, Globe, Lock,
} from "lucide-react";

type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  price: number;
  isPublished: boolean | null;
  totalLessons: number | null;
  totalStudents: number | null;
  rating: number | null;
  createdAt: string;
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  "Web Development": "🌐", "Programming": "💻", "Data Science": "📊",
  "Design": "🎨", "Backend": "⚙️", "Mobile": "📱",
};

export default function TeacherPage() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    const res = await fetch("/api/teacher/courses");
    setCourseList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleTogglePublish = async (course: Course) => {
    setToggling(course.id);
    await fetch(`/api/teacher/courses/${course.id}/publish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    setCourseList(courseList.map((c) =>
      c.id === course.id ? { ...c, isPublished: !c.isPublished } : c
    ));
    setToggling(null);
  };

  const totalStudents = courseList.reduce((s, c) => s + (c.totalStudents || 0), 0);
  const published = courseList.filter((c) => c.isPublished).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen size={28} className="text-violet-600" />
            My Courses
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courseList.length} courses total</p>
        </div>
        <Link href="/teacher/courses/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-xl no-underline hover:opacity-90 shadow-lg shadow-violet-500/20">
          <Plus size={16} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Courses", value: courseList.length, icon: BookOpen, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Published", value: published, icon: Globe, color: "text-green-600", bg: "bg-green-50 dark:bg-green-500/10" },
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Course list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />)}
        </div>
      ) : courseList.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">No courses yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-5">Create your first course</p>
          <Link href="/teacher/courses/new" className="inline-block px-6 py-3 bg-violet-600 text-white font-bold rounded-2xl no-underline hover:bg-violet-700">
            + Create Course
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courseList.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {CATEGORY_EMOJIS[course.category] || "📚"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{course.title}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${LEVEL_COLORS[course.level]}`}>
                      {course.level}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      course.isPublished
                        ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                    }`}>
                      {course.isPublished ? <><Globe size={10} /> Published</> : <><Lock size={10} /> Draft</>}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>{course.totalLessons || 0} lessons</span>
                    <span>{course.totalStudents?.toLocaleString() || 0} students</span>
                    {course.rating && course.rating > 0 && <span>⭐ {course.rating.toFixed(1)}</span>}
                    <span>{course.price === 0 ? "Free" : `$${(course.price / 1000).toFixed(0)}k`}</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePublish(course)}
                    disabled={toggling === course.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                      course.isPublished
                        ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-500/30"
                        : "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-500/30"
                    }`}>
                    {course.isPublished ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                  </button>
                  <Link href={`/teacher/courses/${course.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400 no-underline hover:bg-violet-200 dark:hover:bg-violet-500/30 transition-all">
                    <Edit size={13} /> Manage
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}