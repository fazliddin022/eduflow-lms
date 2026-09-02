"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, Sun, Moon, Info } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) return;
    if (form.password.length < 6) { setError("Password must be at least 6 characters!"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      router.push("/dashboard");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-violet-950 flex items-center justify-center p-4 transition-colors duration-300">

      <button onClick={toggleTheme} className="fixed top-4 right-4 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/login" className="inline-flex items-center gap-2 no-underline">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mx-auto mb-3">
              <GraduationCap size={24} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Join EduFlow</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Create your account and start learning</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 p-8">
          {/* Info box */}
          <div className="flex items-start gap-2.5 p-3.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl mb-5">
            <Info size={15} className="text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700 dark:text-violet-300">
              If your email is pre-approved as a teacher or admin, you'll get the appropriate role automatically.
            </p>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 dark:border-white/10 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all mb-5 disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? "Signing up..." : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          <div className="space-y-4">
            <div className="relative">
              <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name *"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all" />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email *"
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all" />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Password (min 6 chars) *"
                className="w-full pl-11 pr-11 py-3 border-2 border-gray-200 dark:border-white/10 rounded-2xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all" />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</div>}

            <button onClick={handleSubmit} disabled={loading || !form.name || !form.email || !form.password}
              className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl hover:from-violet-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/20">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 font-bold no-underline hover:text-violet-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}