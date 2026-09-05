"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";

const CATEGORIES = ["Web Development", "Programming", "Data Science", "Design", "Backend", "Mobile"];
const LEVELS = ["beginner", "intermediate", "advanced"];

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", description: "", category: "Web Development",
    level: "beginner", price: "0",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.title) { setError("Title is required!"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/teacher/courses/${data.id}`);
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teacher" className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create New Course</h1>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-white/5 p-7 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Course Title *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Complete React & Next.js Course" className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will students learn?" rows={4} className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  form.category === cat
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Level</label>
            <div className="space-y-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setForm({ ...form, level: l })}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                    form.level === l
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Price (UZS)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0 for free" className={inputClass} />
            <p className="text-xs text-gray-400 mt-1.5">Enter 0 for free course</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button onClick={handleCreate} disabled={saving || !form.title}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2">
          <Check size={18} />
          {saving ? "Creating..." : "Create Course"}
        </button>
      </div>
    </div>
  );
}