"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Check, X, BookOpen,
  Globe, Lock, Trash2, GripVertical,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number | null;
  isFree: boolean | null;
};

type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  price: number;
  isPublished: boolean | null;
};

const EMPTY_LESSON = {
  title: "", description: "", videoUrl: "",
  content: "", duration: "10", isFree: false,
};

export default function ManageCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchData = useCallback(async () => {
    const [cRes, lRes] = await Promise.all([
      fetch(`/api/courses/${id}`),
      fetch(`/api/teacher/courses/${id}/lessons`),
    ]);
    const courseData = await cRes.json();
    setCourse(courseData);
    setLessons(await lRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddLesson = async () => {
    if (!lessonForm.title) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/courses/${id}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lessonForm),
      });
      const newLesson = await res.json();
      setLessons([...lessons, newLesson]);
      setLessonForm(EMPTY_LESSON);
      setShowAddLesson(false);
    } finally { setSaving(false); }
  };

  const handlePublish = async () => {
    if (!course) return;
    setPublishing(true);
    await fetch(`/api/teacher/courses/${id}/publish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    });
    setCourse({ ...course, isPublished: !course.isPublished });
    setPublishing(false);
  };

  const inputClass = "w-full px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all";

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-white/10 rounded-2xl w-1/2" />
      <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-3xl" />
    </div>
  );

  if (!course) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/teacher" className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white line-clamp-1">{course.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{lessons.length} lessons</p>
          </div>
        </div>

        <button onClick={handlePublish} disabled={publishing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
            course.isPublished
              ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30"
              : "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20"
          }`}>
          {course.isPublished ? <><Lock size={16} /> Unpublish</> : <><Globe size={16} /> Publish</>}
        </button>
      </div>

      {/* Course Info */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 dark:text-white text-lg">Course Info</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            course.isPublished
              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
          }`}>
            {course.isPublished ? "✓ Published" : "Draft"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Category", value: course.category },
            { label: "Level", value: course.level },
            { label: "Price", value: course.price === 0 ? "Free" : `$${(course.price / 1000).toFixed(0)}k` },
            { label: "Lessons", value: lessons.length },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="font-bold text-gray-900 dark:text-white capitalize">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center justify-between">
          <h2 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
            <BookOpen size={20} className="text-violet-600" />
            Lessons ({lessons.length})
          </h2>
          <button onClick={() => setShowAddLesson(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white font-bold text-sm rounded-xl hover:bg-violet-700 transition-all">
            <Plus size={15} /> Add Lesson
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p>No lessons yet. Add your first lesson!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {lessons.map((lesson, i) => (
              <div key={lesson.id} className="flex items-center gap-4 px-6 py-4">
                <div className="text-gray-300 dark:text-gray-700">
                  <GripVertical size={18} />
                </div>
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-500/20 rounded-xl flex items-center justify-center text-sm font-black text-violet-600 dark:text-violet-400 flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{lesson.title}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                    {lesson.duration && <span>{lesson.duration} min</span>}
                    {lesson.videoUrl && <span>📹 Video</span>}
                    {lesson.isFree && <span className="text-green-500 font-semibold">Free Preview</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg border border-gray-100 dark:border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-gray-900 dark:text-white text-xl">Add Lesson</h2>
              <button onClick={() => setShowAddLesson(false)} className="p-2 bg-gray-100 dark:bg-white/10 rounded-xl text-gray-500">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                placeholder="Lesson title *" className={inputClass} />
              <textarea value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Description" rows={2} className={`${inputClass} resize-none`} />
              <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                placeholder="Video URL (YouTube embed)" className={inputClass} />
              <textarea value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                placeholder="Lesson content (text)" rows={3} className={`${inputClass} resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Duration (minutes)</label>
                  <input type="number" value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className={inputClass} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-gray-50 dark:bg-white/5 rounded-xl w-full">
                    <input type="checkbox" checked={lessonForm.isFree}
                      onChange={(e) => setLessonForm({ ...lessonForm, isFree: e.target.checked })}
                      className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free Preview</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddLesson(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-white/10 rounded-2xl text-sm font-semibold text-gray-600 dark:text-gray-400">
                Cancel
              </button>
              <button onClick={handleAddLesson} disabled={saving || !lessonForm.title}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Adding..." : "Add Lesson"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}