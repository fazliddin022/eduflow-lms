"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, BookOpen, Mail, Plus, X, Check, Trash2, Shield } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  image: string | null;
};

type AllowedEmail = {
  id: string;
  email: string;
  role: string;
};

type Course = {
  id: string;
  title: string;
  isPublished: boolean | null;
  totalStudents: number | null;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  teacher: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  student: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [allowedEmails, setAllowedEmails] = useState<AllowedEmail[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"users" | "emails" | "courses">("users");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"teacher" | "admin">("teacher");
  const [saving, setSaving] = useState(false);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [uRes, eRes, cRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/admin/allowed-emails"),
      fetch("/api/courses"),
    ]);
    setUsers(await uRes.json());
    setAllowedEmails(await eRes.json());
    setCourses(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingUser(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setUsers(users.map((u) => u.id === userId ? { ...u, role } : u));
    setUpdatingUser(null);
  };

  const handleAddEmail = async () => {
    if (!newEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/allowed-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      });
      const data = await res.json();
      if (data) setAllowedEmails([...allowedEmails, data]);
      setNewEmail("");
    } finally { setSaving(false); }
  };

  const handleDeleteEmail = async (email: string) => {
    await fetch("/api/admin/allowed-emails", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setAllowedEmails(allowedEmails.filter((e) => e.email !== email));
  };

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { label: "Teachers", value: users.filter((u) => u.role === "teacher").length, icon: Shield, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { label: "Courses", value: courses.length, icon: BookOpen, color: "text-green-600", bg: "bg-green-50 dark:bg-green-500/10" },
    { label: "Allowed Emails", value: allowedEmails.length, icon: Mail, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Shield size={28} className="text-violet-600" />
        Admin Panel
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {[
          { key: "users", label: "Users" },
          { key: "emails", label: "Allowed Emails" },
          { key: "courses", label: "Courses" },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
              tab === t.key
                ? "border-violet-600 text-violet-600 dark:text-violet-400"
                : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-white/3">
                  {["User", "Email", "Role", "Joined", "Change Role"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id} className={`hover:bg-gray-50 dark:hover:bg-white/3 transition-all ${i < users.length - 1 ? "border-b border-gray-50 dark:border-white/5" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 bg-violet-100 dark:bg-violet-500/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{user.name.charAt(0)}</span>
                          </div>
                        )}
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <select value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingUser === user.id}
                        className="text-xs border border-gray-200 dark:border-white/10 rounded-xl px-3 py-1.5 bg-transparent text-gray-700 dark:text-gray-300 outline-none focus:border-violet-400 cursor-pointer disabled:opacity-50">
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Allowed Emails Tab */}
      {tab === "emails" && (
        <div className="space-y-4">
          {/* Add email */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Add Allowed Email</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Users who register with these emails will automatically get the assigned role.
            </p>
            <div className="flex gap-3 flex-wrap">
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                className="flex-1 min-w-[200px] px-4 py-2.5 border-2 border-gray-200 dark:border-white/10 rounded-xl text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-violet-400 transition-all" />
              <div className="flex gap-2">
                {(["teacher", "admin"] as const).map((r) => (
                  <button key={r} onClick={() => setNewRole(r)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${
                      newRole === r
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
              <button onClick={handleAddEmail} disabled={saving || !newEmail}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all">
                <Plus size={16} /> {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </div>

          {/* Email list */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
            {allowedEmails.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No allowed emails yet</div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-white/5">
                {allowedEmails.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[item.role]}`}>
                        {item.role}
                      </span>
                      <button onClick={() => handleDeleteEmail(item.email)}
                        className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {tab === "courses" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between px-5 py-4">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{course.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{course.totalStudents || 0} students</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    course.isPublished
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400"
                  }`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}