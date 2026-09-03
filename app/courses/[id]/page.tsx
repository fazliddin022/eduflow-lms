"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft, Star, Users, Clock, BookOpen,
  CheckCircle, Play, Lock, Award, ChevronDown, ChevronUp,
} from "lucide-react";

type CourseDetail = {
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
  teacherBio: string | null;
  lessons: Array<{
    id: string;
    title: string;
    description: string | null;
    duration: number | null;
    order: number | null;
    isFree: boolean | null;
  }>;
  quizzes: Array<{ id: string; title: string; passingScore: number | null; timeLimit: number | null }>;
  isEnrolled: boolean;
  enrollment: { progress: number; isCompleted: boolean } | null;
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showAllLessons, setShowAllLessons] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => { setCourse(data); setLoading(false); });
  }, [id]);

  const handleEnroll = async () => {
    if (!session) { router.push("/login"); return; }
    setEnrolling(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: "POST" });
      if (res.ok) {
        setCourse((prev) => prev ? { ...prev, isEnrolled: true, enrollment: { progress: 0, isCompleted: false } } : prev);
      }
    } finally { setEnrolling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-white/10 rounded-full w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-gray-200 dark:bg-white/10 rounded-2xl" />
            <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />
          </div>
          <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (!course) return null;

  const visibleLessons = showAllLessons ? course.lessons : course.lessons.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero */}
      <div className="bg-gradient-to-r from-violet-700 to-blue-700 text-white py-12">
        <div className="max-w-5xl mx-auto px-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-violet-200 hover:text-white mb-6 transition-colors text-sm">
            <ArrowLeft size={16} /> Back to courses
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_COLORS[course.level]}`}>
                  {course.level}
                </span>
                <span className="text-xs text-violet-200 font-medium">{course.category}</span>
              </div>
              <h1 className="text-3xl font-black mb-4 leading-tight">{course.title}</h1>
              {course.description && <p className="text-violet-100 mb-5 leading-relaxed">{course.description}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-violet-100">
                {course.rating && course.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <strong className="text-white">{course.rating.toFixed(1)}</strong>
                    <span>({course.totalReviews} reviews)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {course.totalStudents?.toLocaleString()} students
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={14} />
                  {course.totalLessons} lessons
                </span>
              </div>

              {/* Teacher */}
              <div className="flex items-center gap-3 mt-5 p-3 bg-white/10 rounded-2xl">
                {course.teacherImage ? (
                  <img src={course.teacherImage} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {course.teacherName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{course.teacherName}</p>
                  {course.teacherBio && <p className="text-xs text-violet-200 line-clamp-1">{course.teacherBio}</p>}
                </div>
              </div>
            </div>

            {/* Enrollment card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 text-gray-900 dark:text-white shadow-2xl">
              <div className="text-center mb-5">
                <p className="text-4xl font-black text-violet-600 dark:text-violet-400">
                  {course.price === 0 ? "Free" : `$${(course.price / 1000).toFixed(0)}k`}
                </p>
              </div>

              {course.isEnrolled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm justify-center">
                    <CheckCircle size={18} /> Enrolled
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                    <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${course.enrollment?.progress || 0}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{course.enrollment?.progress || 0}% complete</p>
                  <Link href={`/courses/${course.id}/learn`}
                    className="block w-full text-center py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl no-underline hover:opacity-90 transition-all shadow-lg shadow-violet-500/20">
                    Continue Learning →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button onClick={handleEnroll} disabled={enrolling}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/20">
                    {enrolling ? "Enrolling..." : course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                  </button>
                  {!session && (
                    <p className="text-xs text-gray-400 text-center">
                      <Link href="/login" className="text-violet-600 font-semibold">Sign in</Link> to enroll
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2.5 mt-5 pt-5 border-t border-gray-100 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">
                {[
                  { icon: BookOpen, text: `${course.totalLessons} lessons` },
                  { icon: Clock, text: "Learn at your own pace" },
                  { icon: Award, text: "Certificate on completion" },
                ].map((f) => (
                  <div key={f.text} className="flex items-center gap-2">
                    <f.icon size={15} className="text-violet-500" />
                    {f.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            {/* Lessons */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5">
                <h2 className="font-black text-gray-900 dark:text-white text-xl">Course Content</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{course.lessons.length} lessons</p>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {visibleLessons.map((lesson, i) => {
                  const canAccess = course.isEnrolled || lesson.isFree;
                  return (
                    <div key={lesson.id} className="flex items-center gap-4 px-6 py-4">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${canAccess ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400" : "bg-gray-100 dark:bg-white/5 text-gray-400"}`}>
                        {canAccess ? <Play size={16} /> : <Lock size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{i + 1}. {lesson.title}</p>
                        {lesson.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{lesson.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 text-xs text-gray-400">
                        {lesson.isFree && <span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">Free</span>}
                        {lesson.duration && <span className="flex items-center gap-1"><Clock size={11} />{lesson.duration}m</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {course.lessons.length > 4 && (
                <div className="px-6 py-4 border-t border-gray-50 dark:border-white/5">
                  <button onClick={() => setShowAllLessons(!showAllLessons)}
                    className="flex items-center gap-1.5 text-violet-600 dark:text-violet-400 font-semibold text-sm hover:underline">
                    {showAllLessons ? <><ChevronUp size={16} /> Show less</> : <><ChevronDown size={16} /> Show all {course.lessons.length} lessons</>}
                  </button>
                </div>
              )}
            </div>

            {/* Quiz */}
            {course.quizzes.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 p-6">
                <h2 className="font-black text-gray-900 dark:text-white text-xl mb-4">📝 Course Quiz</h2>
                {course.quizzes.map((quiz) => (
                  <div key={quiz.id} className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-500/10 rounded-2xl border border-violet-100 dark:border-violet-500/20">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{quiz.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Passing score: {quiz.passingScore}% · {quiz.timeLimit} min
                      </p>
                    </div>
                    {course.isEnrolled ? (
                      <Link href={`/courses/${course.id}/quiz/${quiz.id}`}
                        className="px-4 py-2 bg-violet-600 text-white font-bold text-sm rounded-xl no-underline hover:bg-violet-700 transition-all">
                        Take Quiz
                      </Link>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                        <Lock size={13} /> Enroll to unlock
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">What you'll learn</h3>
              <div className="space-y-2">
                {course.lessons.slice(0, 5).map((lesson) => (
                  <div key={lesson.id} className="flex items-start gap-2">
                    <CheckCircle size={15} className="text-violet-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}