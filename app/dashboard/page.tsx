import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { courses, enrollments, users, lessons } from "@/lib/schema";
import { eq, desc, count } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, GraduationCap, TrendingUp, Award, ArrowRight, Clock } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;

  // Student dashboard data
  let myEnrollments: any[] = [];
  let featuredCourses: any[] = [];

  if (role === "student") {
    myEnrollments = await db
      .select({
        id: enrollments.id,
        progress: enrollments.progress,
        isCompleted: enrollments.isCompleted,
        enrolledAt: enrollments.enrolledAt,
        courseId: courses.id,
        courseTitle: courses.title,
        courseCategory: courses.category,
        courseLevel: courses.level,
        totalLessons: courses.totalLessons,
      })
      .from(enrollments)
      .innerJoin(courses, eq(enrollments.courseId, courses.id))
      .where(eq(enrollments.userId, session!.user.id))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(4);
  }

  featuredCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      category: courses.category,
      level: courses.level,
      price: courses.price,
      rating: courses.rating,
      totalStudents: courses.totalStudents,
      totalLessons: courses.totalLessons,
      teacherId: courses.teacherId,
    })
    .from(courses)
    .where(eq(courses.isPublished, true))
    .orderBy(desc(courses.totalStudents))
    .limit(6);

  // Teacher dashboard data
  let myCourses: any[] = [];
  if (role === "teacher") {
    myCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.teacherId, session!.user.id))
      .orderBy(desc(courses.createdAt));
  }

  const LEVEL_COLORS: Record<string, string> = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };

  const CATEGORY_EMOJIS: Record<string, string> = {
    "Web Development": "🌐", "Programming": "💻", "Data Science": "📊",
    "Design": "🎨", "Backend": "⚙️", "Mobile": "📱",
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-semibold mb-1 capitalize">{role} Dashboard</p>
          <h1 className="text-3xl font-black mb-2">
            Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-violet-100 mb-5">
            {role === "student" && "Continue your learning journey today."}
            {role === "teacher" && "Manage your courses and track student progress."}
            {role === "admin" && "Monitor platform activity and manage users."}
          </p>
          <Link href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-bold rounded-xl no-underline hover:bg-violet-50 transition-all text-sm">
            Browse Courses <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Student: My Enrollments */}
      {role === "student" && myEnrollments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen size={20} className="text-violet-600" />
              My Courses
            </h2>
            <Link href="/my-courses" className="text-sm text-violet-600 font-semibold no-underline hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {myEnrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/courses/${enrollment.courseId}`}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-4 no-underline hover:shadow-md hover:border-violet-100 dark:hover:border-violet-500/20 transition-all group">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center text-xl mb-3">
                  {CATEGORY_EMOJIS[enrollment.courseCategory] || "📚"}
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-violet-600 transition-colors mb-2">
                  {enrollment.courseTitle}
                </p>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1.5 mb-1">
                  <div className="bg-violet-600 h-1.5 rounded-full transition-all" style={{ width: `${enrollment.progress}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{enrollment.progress}% complete</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Teacher: My Courses */}
      {role === "teacher" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">My Courses</h2>
            <Link href="/teacher/courses/new" className="px-4 py-2 bg-violet-600 text-white font-bold text-sm rounded-xl no-underline hover:bg-violet-700 transition-all">
              + New Course
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_COLORS[course.level]}`}>{course.level}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${course.isPublished ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"}`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white mb-1">{course.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{course.totalStudents} students · {course.totalLessons} lessons</p>
                <Link href={`/teacher/courses/${course.id}`}
                  className="block text-center py-2 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-semibold text-sm rounded-xl no-underline hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all">
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-violet-600" />
            Popular Courses
          </h2>
          <Link href="/courses" className="text-sm text-violet-600 font-semibold no-underline hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5 no-underline hover:shadow-md hover:border-violet-100 dark:hover:border-violet-500/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-500/20 dark:to-blue-500/20 rounded-2xl flex items-center justify-center text-2xl">
                  {CATEGORY_EMOJIS[course.category] || "📚"}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${LEVEL_COLORS[course.level]}`}>
                  {course.level}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 transition-colors mb-1 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{course.category}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">⭐ {course.rating?.toFixed(1)}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{course.totalLessons} lessons</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {course.price === 0 ? "Free" : `$${(course.price / 1000).toFixed(0)}k`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}