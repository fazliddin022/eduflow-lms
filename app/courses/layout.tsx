import Navbar from "@/components/Navbar";

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">{children}</div>
    </div>
  );
}