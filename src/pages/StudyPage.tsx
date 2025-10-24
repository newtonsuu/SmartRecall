import { useEffect, useState } from "react";
import { EditIcon, PlayIcon, Trash2Icon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

type Tab = "flashcards" | "quizzes" | "summaries";
dayjs.extend(relativeTime);

type Quiz = {
  id: number;
  title: string;
  last_accessed: string;
  score: number;
  next_quiz?: string;
};

type Flashcard = {
  id: number;
  title: string;
  last_accessed: string;
  score: number;
  next_review?: string;
};

type Summary = {
  id: number;
  title: string;
  last_updated: string;
  next_update?: string;
  word_count: number;
};

export function StudyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    try {
      const v = localStorage.getItem("studyActiveTab");
      if (v === "flashcards" || v === "quizzes" || v === "summaries") return v;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* ignore */
    }
    return "flashcards";
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem("studyActiveTab", activeTab);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      /* ignore */
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchQuizzes() {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          id,
          title,
          last_accessed,
          next_quiz,
          quiz_attempts!quiz_id (
            percentage,
            completed_at
          )
        `)
        .order("completed_at", { referencedTable: "quiz_attempts", ascending: false })
        .limit(1, { foreignTable: "quiz_attempts" }); // latest attempt per quiz
      if (error) {
        console.error(error);
      } else {
        const mapped = (data as any[]).map((q) => ({
          id: q.id,
          title: q.title,
          last_accessed: q.last_accessed,
          next_quiz: q.next_quiz,
          score: q.quiz_attempts?.[0]?.percentage ?? 0,
        }));
        setQuizzes(mapped);
      }
    }
    async function fetchFlashcards() {
      const { data, error } = await supabase
        .from("flashcard_sets")
        .select(
          `
          id,
          title,
          last_accessed,
          next_review,
          flashcard_sessions!set_id (
            score,
            completed_at
          )
        `
        )
        .order("completed_at", {
          referencedTable: "flashcard_sessions",
          ascending: false,
        })
        .limit(1, { foreignTable: "flashcard_sessions" });
      if (error) {
        console.error(error);
      } else {
        const mapped = (data as any[]).map((q) => ({
          id: q.id,
          title: q.title,
          last_accessed: q.last_accessed,
          next_review: q.next_review,
          score: q.flashcard_sessions?.[0]?.score ?? 0,
        }));
        setFlashcards(mapped);
      }
    }
    async function fetchSummaries() {
      const { data, error } = await supabase.from("summaries").select("*");
      if (error) console.error(error);
      else setSummaries(data);
    }

    fetchQuizzes();
    fetchFlashcards();
    fetchSummaries();
  }, []);

  // 🗑️ Delete Handlers with Confirmation
  async function handleDeleteQuiz(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this quiz?")) return;

    const { error } = await supabase.from("quizzes").delete().eq("id", id);
    if (error) console.error(error);
    else setQuizzes((prev) => prev.filter((q) => q.id !== id));
  }

  async function handleDeleteFlashcard(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this flashcard set?")) return;

    const { error } = await supabase
      .from("flashcard_sets")
      .delete()
      .eq("id", id);
    if (error) console.error(error);
    else setFlashcards((prev) => prev.filter((f) => f.id !== id));
  }

  async function handleDeleteSummary(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this summary?")) return;

    const { error } = await supabase.from("summaries").delete().eq("id", id);
    if (error) console.error(error);
    else setSummaries((prev) => prev.filter((s) => s.id !== id));
  }

  function gotoEditQuizPage(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    // window.location.href = `/quiz/${id}/edit`;
    navigate(`/quiz/${id}/edit`);
  }

  function gotoEditFlashcardPage(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    // window.location.href = `/flashcard/${id}/edit`;
    navigate(`/flashcard/${id}/edit`);
  }

  function gotoEditSummaryPage(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    e.preventDefault();
    // window.location.href = `/summary/${id}/edit`;
    navigate(`/summary/${id}/edit`);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
      </header>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          {(["flashcards", "quizzes", "summaries"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 flex-1 text-center ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600 font-medium"
                  : "text-gray-500"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Flashcards */}
      {activeTab === "flashcards" && (
        <div className="space-y-4">
          {flashcards.length === 0 ? (
            <p className="text-gray-500 text-center">
              No flashcards available yet.
            </p>
          ) : (
            flashcards.map((flashcard) => {
              const locked =
                Boolean(flashcard.next_review) &&
                dayjs(flashcard.next_review).isAfter(dayjs());
              return (
                <Link
                  to={`/flashcard/${flashcard.id}`}
                  key={flashcard.id}
                  className={`block ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      alert("You can’t access that right now. Try again later.");
                    }
                  }}
                  aria-disabled={locked}
                >
                <StudyCard
                  title={flashcard.title}
                  lastAccessed={
                    flashcard.last_accessed
                      ? dayjs(flashcard.last_accessed).fromNow()
                      : "Never"
                  }
                  score={flashcard.score || 0}
                  nextReview={flashcard.next_review ?? "Now"}
                  onDelete={(e) => handleDeleteFlashcard(e, flashcard.id)}
                  onEdit={(e) => gotoEditFlashcardPage(e, flashcard.id)}
                />
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Quizzes */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <p className="text-gray-500 text-center">
              No quizzes available yet.
            </p>
          ) : (
            quizzes.map((quiz) => {
              const locked =
                Boolean(quiz.next_quiz) &&
                dayjs(quiz.next_quiz).isAfter(dayjs());
              return (
                <Link
                  to={`/quiz/${quiz.id}`}
                  key={quiz.id}
                  className={`block ${locked ? "opacity-60 cursor-not-allowed" : ""}`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      alert("You can’t access that right now. Try again later.");
                    }
                  }}
                  aria-disabled={locked}
                >
                <StudyCard
                  title={quiz.title}
                  lastAccessed={
                    quiz.last_accessed
                      ? dayjs(quiz.last_accessed).fromNow()
                      : "Never"
                  }
                  score={quiz.score || 0}
                  nextReview={quiz.next_quiz ?? "Now"}
                  isQuiz
                  locked={locked}
                  onDelete={(e) => handleDeleteQuiz(e, quiz.id)}
                  onEdit={(e) => gotoEditQuizPage(e, quiz.id)}
                  id={quiz.id}
                />
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Summaries */}
      {activeTab === "summaries" && (
        <div className="space-y-4">
          {summaries.length === 0 ? (
            <p className="text-gray-500 text-center">
              No summaries available yet.
            </p>
          ) : (
            summaries.map((summary) => (
              <Link
                to={`/summary/${summary.id}`}
                key={summary.id}
                className="block"
              >
                <SummaryCard
                  title={summary.title}
                  lastUpdated={dayjs(summary.last_updated).fromNow() || "N/A"}
                  wordCount={summary.word_count || 0}
                  nextUpdate={summary.next_update || "Soon"}
                  onDelete={(e) => handleDeleteSummary(e, summary.id)}
                  onEdit={(e) => gotoEditSummaryPage(e, summary.id)}
                />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface StudyCardProps {
  title: string;
  lastAccessed: string;
  score: number;
  nextReview: string;
  isQuiz?: boolean;
  locked?: boolean;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  id?: number;
}

function StudyCard({
  title,
  lastAccessed,
  score,
  nextReview,
  isQuiz = false,
  locked = false,
  onDelete,
  onEdit,
  id
}: StudyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">Last accessed: {lastAccessed}</p>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      { isQuiz && ( 
        <div className="flex flex-col sm:flex-row gap-3">
          <Link 
            to={`/quiz/${id}?mode=pretest`} 
            className="flex-1" 
            onClick={(e) => {
              if (locked) {
                e.preventDefault();
                alert("You can’t access that right now. Try again later.");
              }
            }}>
            <button
              className={`w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md transition flex items-center justify-center gap-2 ${
              locked ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-200"
              }`}
              disabled={locked}
              aria-disabled={locked}
            >
              <PlayIcon size={16} />
              <span>Pretest</span>
            </button>
          </Link>
          <Link
            to={`/quiz/${id}?mode=actual`}
            className="flex-1"
            onClick={(e) => {
            if (locked) {
              e.preventDefault();
              alert("You can’t access that right now. Try again later.");
            }
           }}
          >
            <button
              className={`w-full bg-green-100 text-green-700 py-2 px-4 rounded-md transition flex items-center justify-center gap-2 ${
               locked ? "opacity-60 cursor-not-allowed" : "hover:bg-green-200"
              }`}
              disabled={locked}
              aria-disabled={locked}
            >
              <PlayIcon size={16} />
              <span>Actual Quiz</span>
            </button>
          </Link>
        </div>
       )}
      <div className="flex items-center gap-4 mt-2 text-sm">
        <div className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${
              score >= 80
                ? "bg-green-500"
                : score >= 60
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          ></div>
          <span>Score: {score}%</span>
        </div>
        <span className="text-gray-400">|</span>
        <span>
          Next {isQuiz ? "quiz" : "review"}: {nextReview !== "Now" ? dayjs(nextReview).fromNow() : "Now"}
        </span>
      </div>
      <div className="flex mt-4 gap-4">
        <button
          className="text-blue-600 flex items-center gap-1 text-sm"
          onClick={onEdit}
        >
          <EditIcon size={16} />
          <span>Edit</span>
        </button>
        <button
          className="text-red-600 flex items-center gap-1 text-sm"
          onClick={onDelete}
        >
          <Trash2Icon size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  lastUpdated: string;
  wordCount: number;
  nextUpdate: string;
  onDelete: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
}

function SummaryCard({
  title,
  lastUpdated,
  wordCount,
  nextUpdate,
  onDelete,
  onEdit,
}: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="flex items-center gap-4 mt-2 text-sm">
        <span>Words summarized: {wordCount}</span>
        <span className="text-gray-400">|</span>
        <span>Next update: {nextUpdate}</span>
      </div>
      <div className="flex mt-4 gap-4">
        <button
          className="text-blue-600 flex items-center gap-1 text-sm"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEdit(e);
          }}
        >
          <EditIcon size={16} />
          <span>Edit</span>
        </button>
        <button
          className="text-red-600 flex items-center gap-1 text-sm"
          onClick={onDelete}
        >
          <Trash2Icon size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
