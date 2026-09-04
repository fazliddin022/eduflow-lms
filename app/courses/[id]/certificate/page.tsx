"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Award, Download, Share2, ArrowLeft, CheckCircle } from "lucide-react";

type CertData = {
  courseTitle: string;
  courseCategory: string;
  teacherName: string;
  certificateNumber: string;
  issuedAt: string;
  userName: string;
};

export default function CertificatePage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find((c: { courseId: string }) => c.courseId === id);
        if (found) {
          setCert({ ...found, userName: session?.user?.name || "Student" });
        }
        setLoading(false);
      });
  }, [id, session]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">Loading...</div>
  );

  if (!cert) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Certificate not available</h2>
        <p className="text-gray-500 mb-4">Complete all lessons to earn your certificate.</p>
        <Link href={`/courses/${id}/learn`} className="px-6 py-3 bg-violet-600 text-white font-bold rounded-2xl no-underline hover:bg-violet-700">
          Continue Learning
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href={`/courses/${id}`} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Certificate of Completion</h1>
        </div>

        {/* Certificate */}
        <div className="bg-white rounded-3xl border-4 border-violet-600 p-10 relative overflow-hidden shadow-2xl mb-6">
          {/* Decorative */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-violet-100 rounded-full -translate-x-16 -translate-y-16" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-50 rounded-full translate-x-24 translate-y-24" />
          <div className="absolute top-4 right-4 w-16 h-16 bg-yellow-100 rounded-full" />

          <div className="relative z-10 text-center">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <Award size={24} className="text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900">EduFlow</span>
            </div>

            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">Certificate of Completion</p>
            <p className="text-gray-500 mb-4">This is to certify that</p>
            <h2 className="text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: "Georgia, serif" }}>
              {cert.userName}
            </h2>
            <p className="text-gray-500 mb-2">has successfully completed</p>
            <h3 className="text-2xl font-black text-violet-700 mb-2">{cert.courseTitle}</h3>
            <p className="text-sm text-gray-400 mb-6">{cert.courseCategory}</p>

            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckCircle size={18} className="text-green-500" />
              <span className="text-sm font-semibold text-green-600">Successfully Completed</span>
            </div>

            <div className="border-t-2 border-dashed border-gray-200 pt-6 flex items-center justify-between">
              <div className="text-left">
                <p className="font-black text-gray-900">{cert.teacherName}</p>
                <p className="text-xs text-gray-400">Instructor</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400">Certificate ID</p>
                <p className="font-mono text-xs text-gray-600 font-bold">{cert.certificateNumber}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{new Date(cert.issuedAt!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                <p className="text-xs text-gray-400">Date Issued</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-violet-500/20">
            <Download size={18} /> Download PDF
          </button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-2 px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <Share2 size={18} /> Share
          </button>
        </div>

        {/* Back */}
        <div className="text-center mt-5">
          <Link href="/dashboard" className="text-violet-600 font-semibold text-sm hover:underline no-underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}