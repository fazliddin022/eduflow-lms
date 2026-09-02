"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  GraduationCap, Sun, Moon, BookOpen,
  LayoutDashboard, Users, LogOut, User,
  ChevronDown, Bell,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState("light");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
    teacher: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    student: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-black text-gray-900 dark:text-white text-lg">EduFlow</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {[
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            { href: "/courses", label: "Courses", icon: BookOpen },
            ...(session?.user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: Users }] : []),
            ...(session?.user?.role === "teacher" ? [{ href: "/teacher", label: "My Courses", icon: BookOpen }] : []),
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white no-underline transition-all">
              <link.icon size={16} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {session ? (
            <div className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{session.user.name?.charAt(0)}</span>
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 dark:border-white/10">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{session.user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1 capitalize ${ROLE_COLORS[session.user.role || "student"]}`}>
                      {session.user.role}
                    </span>
                  </div>
                  <Link href="/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 no-underline transition-all">
                    <User size={15} /> Profile
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold text-sm rounded-xl no-underline hover:opacity-90 transition-all">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}