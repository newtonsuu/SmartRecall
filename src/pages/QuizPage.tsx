import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface SupabaseQuiz {
  id: number;
  title: string;
  kind: string;
  payload: {
    title: string;
    questions: {
      question: string;
      choices: string[];
      answer: string;
    }[];
  };
  time_limit: number;
}

export function QuizPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "actual";
  const [quiz, setQuiz] = useState<SupabaseQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(600);

  // Fisher-Yates shuffle (returns a new array)
  function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  useEffect(() => {
    setSelectedOption(userAnswers[currentIndex] || null);
  }, [currentIndex, userAnswers]);

  useEffect(() => {
    const checkAttempts = async () => {
      if (!id) return;

      const now = new Date();
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("next_quiz")
        .eq("id", id)
        .single();
      if (quizData?.next_quiz && new Date(quizData.next_quiz) > now) {
        alert("You’re currently locked out from this quiz. Try again later.");
        navigate("/study");
        return;
      }
    };
    checkAttempts();
  }, [id]);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching quiz:", error);
        return;
      }

      // Shuffle questions and their choices
      const originalQuestions = Array.isArray(data.payload?.questions)
        ? data.payload.questions
        : [];
      let shuffledQuestions = shuffle(originalQuestions).map((q: any) => ({
        ...q,
        choices: Array.isArray(q?.choices) ? shuffle(q.choices) : [],
      }));

      // 🧠 If pretest mode, only show 20% of questions
      if (mode === "pretest") {
        const limit = Math.max(1, Math.floor(shuffledQuestions.length * 0.2));
        shuffledQuestions = shuffledQuestions.slice(0, limit);
      }

      const shuffledQuiz: SupabaseQuiz = {
        ...data,
        payload: { ...data.payload, questions: shuffledQuestions },
      };
      setQuiz(shuffledQuiz);
      setUserAnswers(new Array(shuffledQuestions.length).fill(""));
      setSelectedOption(null);
      const initialSeconds = Number(data.time_limit);
      setTimeLeft(initialSeconds);
    };

    fetchQuiz();
  }, [id]);

  const nextReviewFromScore = (score: number): Date => {
    const d = new Date();
    let hours = 0;
    if (score <= 50) hours = 24;
    else if (score <= 75) hours = 24 * 3;
    else if (score <= 90) hours = 24 * 5;
    else if (score <= 100) hours = 24 * 7;
    d.setHours(d.getHours() + hours);
    return d;
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!quiz || completed) return;
    if (timeLeft <= 0) {
      setCompleted(true);
      return;
    }
    const tid = window.setTimeout(() => {
      setTimeLeft((s) => (typeof s === "number" ? s - 1 : s));
    }, 1000);
    return () => clearTimeout(tid);
  }, [timeLeft, quiz, completed]);

  useEffect(() => {
    if (!completed || !quiz) return;
    if (mode === "pretest") return;

    const saveAttempt = async () => {
      try {
        const score = userAnswers.reduce(
          (s, answer, i) =>
            answer === quiz.payload.questions[i].answer ? s + 1 : s,
          0
        );
        const percentage = Math.round(
          (score / quiz.payload.questions.length) * 100
        );

        const { error } = await supabase.from("quiz_attempts").insert({
          quiz_id: quiz.id,
          percentage,
        });

        await supabase
          .from("quizzes")
          .update({ last_accessed: new Date() })
          .eq("id", quiz.id);

        const { data: attemptData } = await supabase.rpc(
          "get_today_quiz_attempts",
          { p_quiz_id: id }
        );
        if (attemptData.length == 3) {
          const averageScore =
            attemptData
              .map((a: any) => a.percentage)
              .reduce((a: number, b: number) => a + b, 0) / attemptData.length;
          const nextReview = nextReviewFromScore(averageScore);
          const { error: updateError } = await supabase
            .from("quizzes")
            .update({ next_quiz: nextReview })
            .eq("id", quiz.id);
          if (updateError) console.error("Update error:", updateError);
        }

        if (error) {
          console.error("Failed to save quiz attempt:", error);
        }
      } catch (err) {
        console.error("Error saving quiz attempt:", err);
      }
    };
    saveAttempt();
  }, [completed, quiz, userAnswers]);

  // AI recommendation state
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<any>(null);

  // Fire recommendation fetch after quiz completes and attempt saved
  useEffect(() => {
    if (!completed || !quiz) return;
    // only run recommendations for actual quiz mode
    if (mode !== "actual") return;

    const fetchRecommendation = async () => {
      setRecoLoading(true);
      setRecoError(null);
      try {
        // get current user id from supabase auth
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;

        // Use the Functions subdomain like HomePage
        const FUNCTION_URL =
          "https://eoffiddgxjiwiyihczed.supabase.co/functions/v1/quiz-recommendation";
        const start = Date.now();
        const payload = { userId, quizId: String(quiz.id) };
        console.log("[QuizPage] -> fetchRecommendation START", {
          ts: new Date().toISOString(),
          url: FUNCTION_URL,
          userId,
          payload,
        });

        const resp = await fetch(FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });

        const duration = Date.now() - start;
        console.log("[QuizPage] <- fetchRecommendation response headers", {
          status: resp.status,
          ok: resp.ok,
          contentType: resp.headers.get("content-type") || null,
          durationMs: duration,
        });

        const text = await resp.text();
        if (!text) throw new Error(`Empty response (status ${resp.status})`);
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          console.warn("[QuizPage] response not valid JSON, using raw text");
          data = { message: text };
        }
        if (!resp.ok) {
          const errMsg = data.error || data.message || `HTTP ${resp.status}`;
          throw new Error(errMsg);
        }

        console.log("[QuizPage] <- fetchRecommendation parsed response", {
          recommendation: data.recommendation ?? null,
          source: data.source ?? null,
        });
        setRecommendation(data.recommendation ?? data.message ?? null);
      } catch (err: any) {
        console.error("Failed to fetch recommendation:", err?.message ?? err);
        setRecoError(err?.message ?? String(err));
      } finally {
        setRecoLoading(false);
      }
    };

    fetchRecommendation();
  }, [completed, quiz, mode]);

  if (!quiz) return <div className="p-6 text-center">Loading quiz...</div>;

  const questions = quiz.payload.questions;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = option;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const calculateScore = () =>
    userAnswers.reduce(
      (score, answer, i) =>
        answer === questions[i].answer ? score + 1 : score,
      0
    );

  if (completed) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-md mx-auto px-4 py-6 text-black">
        <header className="flex items-center mb-6">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-black text-2xl font-bold">
            {quiz.title} - Results
          </h1>
        </header>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={
                    percentage >= 80
                      ? "#4ade80"
                      : percentage >= 60
                      ? "#facc15"
                      : "#f87171"
                  }
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Quiz Complete!</h2>
            <p className="text-gray-600 mb-4">
              You scored {score} out of {questions.length} questions correctly.
            </p>
          </div>
        </div>
        {/* AI Recommendation block (only for actual quizzes) */}
        {mode === "actual" && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">AI Recommendation</h3>

            {recoLoading && (
              <div className="p-3 rounded-md bg-blue-50 text-blue-700 mb-3">
                Generating recommendation...
              </div>
            )}

            {recoError && (
              <div className="p-3 rounded-md bg-red-100 text-red-800 mb-3">
                {recoError}
              </div>
            )}

            {!recoLoading && !recoError && recommendation && (
              <div>
                {/* friendly summary */}
                <div className="p-3 rounded-md bg-blue-100 text-blue-800 mb-3">
                  {recommendation.retake_in_days != null
                    ? `Based on your performance you should review this material again in ${recommendation.retake_in_days} day(s)`
                    : recommendation.recommendation ??
                      "Review this material again soon."}
                </div>

                <div className="text-sm">
                  {Array.isArray(recommendation.strengths) && (
                    <>
                      <h4 className="font-medium">Strengths:</h4>
                      <ul className="list-disc list-inside ml-4 mb-3">
                        {recommendation.strengths.map(
                          (s: string, i: number) => (
                            <li key={i}>{s}</li>
                          )
                        )}
                      </ul>
                    </>
                  )}

                  {Array.isArray(recommendation.improvements) && (
                    <>
                      <h4 className="font-medium">Areas for Improvements</h4>
                      <ul className="list-disc list-inside ml-4">
                        {recommendation.improvements.map(
                          (s: string, i: number) => (
                            <li key={i}>{s}</li>
                          )
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}

            {!recoLoading && !recoError && !recommendation && (
              <div className="p-3 rounded-md bg-gray-100 text-gray-800 mb-3">
                No recommendation available.
              </div>
            )}
          </div>
        )}
        <div className="flex gap-4 mt-8">
          <Link to="/" className="flex-1">
            <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-md hover:bg-gray-200 transition">
              Return Home
            </button>
          </Link>
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition" onClick={() => {
            window.location.reload();
          }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <header className="items-center justify-between mb-6">
        <div className="flex justify-between items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          {!completed && (
            <div
              className={`px-2 py-1 rounded text-lg font-medium ${
                timeLeft <= 10
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
              aria-live="polite"
            >
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-black text-center">
            {quiz.title}
          </h1>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-black">
          {currentQuestion.question}
        </h2>

        {/* ✅ Option buttons */}
        <div className="space-y-3 mb-6">
          {currentQuestion.choices.map((option, i) => {
            const currentAnswer = userAnswers[currentIndex];
            const isSelected = currentAnswer === option;
            return (
              <button
                key={i}
                className={`w-full text-left p-3 rounded-md border transition-all duration-150 ${
                  isSelected
                    ? "!bg-blue-100 ring-1 ring-blue-400 text-gray-900"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => handleSelectOption(option)}
                aria-pressed={isSelected}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="py-2 px-4 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!selectedOption}
            className={`py-2 px-4 rounded-md ${
              selectedOption
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {currentIndex === questions.length - 1 ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
