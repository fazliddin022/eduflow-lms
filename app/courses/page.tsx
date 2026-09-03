"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Star, Users, Clock, Filter } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  price: number;
  rating: number | null;
  totalReviews: number | null;
  totalStudents: number | null;
  totalLessons: number | null;
  teacherName: string;
  teacherImage: string | null;
};

const CATEGORIES = ["All", "Web Development", "Programming", "Data Science", "Design", "Backend", "Mobile"];
const LEVELS = ["All", "beginner", "intermediate", "advanced"];
const CATEGORY_EMOJIS: Record<string, string> = {
  "Web Development": "🌐", "Programming": "💻", "Data Science": "📊",
  "Design": "🎨", "Backend": "⚙️", "Mobile": "📱", "All": "✨",
};
const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

function CoursesContent() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "All") params.set("category", category);
    if (level !== "All") params.set("level", level);
    const res = await fetch(`/api/courses?${params}`);
    setCourses(await res.json());
    setLoading(false);
  }, [search, category, level]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl text-white">
        <h1 className="text-4xl font-black mb-3">Explore Courses</h1>
        <p className="text-violet-100 mb-6">Learn from expert instructors at your own pace</p>
        <div className="max-w-lg mx-auto relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 text-sm outline-none shadow-xl" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                category === cat
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-violet-300"
              }`}>
              <span>{CATEGORY_EMOJIS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                level === l
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-gray-900 dark:text-white">{courses.length}</span> courses found
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden animate-pulse border border-gray-100 dark:border-white/5">
              <div className="h-40 bg-gray-100 dark:bg-white/5" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-white/5 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-white/5 rounded-full w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-gray-500 font-semibold text-lg">No courses found</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setLevel("All"); }}
            className="mt-3 text-violet-600 font-semibold text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden hover:shadow-xl hover:border-violet-100 dark:hover:border-violet-500/20 transition-all no-underline group">
              {/* Cover */}
              <div className="h-40 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center relative">
                <span className="text-6xl">{CATEGORY_EMOJIS[course.category] || "📚"}</span>
                <div className="absolute top-3 left-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_COLORS[course.level]}`}>
                    {course.level}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${course.price === 0 ? "bg-green-500 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
                    {course.price === 0 ? "Free" : `$${(course.price / 1000).toFixed(0)}k`}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mb-1">{course.category}</p>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-violet-600 transition-colors mb-3 leading-snug">
                  {course.title}
                </h3>

                {/* Teacher */}
                <div className="flex items-center gap-2 mb-3">
                  {course.teacherImage ? (
                    <img src={course.teacherImage} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <div className="w-6 h-6 bg-violet-200 dark:bg-violet-800 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{course.teacherName.charAt(0)}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{course.teacherName}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-white/5 pt-3">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    {course.rating?.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {course.totalStudents?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {course.totalLessons} lessons
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
      <CoursesContent />
    </Suspense>
  );
}