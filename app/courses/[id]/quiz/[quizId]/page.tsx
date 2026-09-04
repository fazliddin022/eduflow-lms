"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Question = {
  id: string;
  question: string;
  type: string;
  options: string[] | null;
  points: number | null;
  order: number | null;
};

type QuizData = {
  id: string;
  title: string;
  description: string | null;
  passingScore: number | null;
  timeLimit: number | null;
  questions: Question[];
};

type QuizResult = {
  score: number;
  totalPoints: number;
  isPassed: boolean;
  passingScore: number;
  results: Array<{
    questionId: string;
    question: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
  }>;
};

export default function QuizPage() {
  const { id, quizId } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data);
        setTimeLeft((data.timeLimit || 30) * 60);
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0 || result) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, result]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, courseId: id }),
      });
      setResult(await res.json());
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-400">
      Loading quiz...
    </div>
  );

  if (!quiz) return null;

  if (result) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-lg">
        <div className={`rounded-3xl p-8 text-center mb-6 ${result.isPassed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-red-500 to-rose-600"} text-white`}>
          <div className="text-6xl mb-4">{result.isPassed ? "🏆" : "📚"}</div>
          <h1 className="text-3xl font-black mb-2">{result.isPassed ? "Congratulations!" : "Keep Studying!"}</h1>
          <p className="text-white/80 mb-4">
            {result.isPassed ? "You passed the quiz!" : `You need ${result.passingScore}% to pass`}
          </p>
          <div className="text-6xl font-black">{result.score}%</div>
          <p className="text-white/70 text-sm mt-1">Your score</p>
        </div>

        <div className="space-y-3 mb-6">
          {result.results.map((r, i) => (
            <div key={r.questionId} className={`bg-white dark:bg-gray-900 rounded-2xl border p-4 ${r.isCorrect ? "border-green-200 dark:border-green-500/20" : "border-red-200 dark:border-red-500/20"}`}>
              <div className="flex items-start gap-3">
                {r.isCorrect
                  ? <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  : <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{i + 1}. {r.question}</p>
                  {!r.isCorrect && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">Correct: {r.correctAnswer}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Your answer: {r.userAnswer || "Not answered"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link href={`/courses/${id}/learn`}
            className="flex-1 text-center py-3.5 bg-violet-600 text-white font-bold rounded-2xl no-underline hover:bg-violet-700 transition-all">
            Continue Learning
          </Link>
          {result.isPassed && (
            <Link href={`/courses/${id}/certificate`}
              className="flex-1 text-center py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-2xl no-underline hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Award size={18} /> Certificate
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/courses/${id}/learn`} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <p className="font-bold text-gray-900 dark:text-white">{quiz.title}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${timeLeft < 60 ? "bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400" : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300"}`}>
            <Clock size={14} /> {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-gray-400">{answeredCount}/{quiz.questions.length}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {quiz.description && (
          <div className="bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 rounded-2xl p-4 text-sm text-violet-700 dark:text-violet-300">
            {quiz.description}
          </div>
        )}

        {quiz.questions.map((q, i) => (
          <div key={q.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-white/5 p-6">
            <p className="font-bold text-gray-900 dark:text-white mb-4 text-sm">
              <span className="text-violet-600 dark:text-violet-400 mr-2">Q{i + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {(q.options || ["True", "False"]).map((option) => (
                <button key={option} onClick={() => setAnswers({ ...answers, [q.id]: option })}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border-2 ${
                    answers[q.id] === option
                      ? "border-violet-500 bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300"
                      : "border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50"
                  }`}>
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button onClick={handleSubmit} disabled={submitting || answeredCount === 0}
          className="w-full py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-violet-500/20">
          {submitting ? "Submitting..." : `Submit Quiz (${answeredCount}/${quiz.questions.length} answered)`}
        </button>
      </div>
    </div>
  );
}