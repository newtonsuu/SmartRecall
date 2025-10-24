import { useEffect, useState } from "react";
import { ArrowLeftIcon, BookOpenIcon, PenIcon } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../lib/supabaseClient";

type Summary = {
  id: number;
  topic_id: number | null;
  title: string;
  content_markdown: string | object;
  last_updated: string | null;
  word_count: number | null;
};

export function SummaryPage() {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing quiz...");
  const navigate = useNavigate();
  const { profile } = useAuth();
  const userId = profile?.id ?? "";
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const loadingMessages = [
    "Preparing quiz...",
    "Sending content to AI service...",
    "Generating questions and answers...",
  ];

  useEffect(() => {
    if (!processing) return;
    let index = 0;
    setLoadingMessage(loadingMessages[index]);
    const interval = setInterval(() => {
      index = Math.min(index + 1, loadingMessages.length - 1);
      setLoadingMessage(loadingMessages[index]);
    }, 4000);
    return () => clearInterval(interval);
  }, [processing]);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("summaries")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching summary:", error);
      } else {
        setSummary(data);
      }

      setLoading(false);
    };

    fetchSummary();
  }, [id]);

  const renderMarkdown = (text: string) => {
    const lines = text.trim().split("\n");
    return lines.map((line, index) => {
      line = line.trim();

      if (line.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-semibold my-3 text-gray-800">
            {line.substring(3)}
          </h2>
        );
      } else if (line.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold my-4">
            {line.substring(2)}
          </h1>
        );
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = line.substring(2).split(boldRegex);
        return (
          <li key={index} className="ml-4 my-1 text-gray-700 list-disc">
            {parts.map((part, i) =>
              i % 2 === 0 ? part : <strong key={i}>{part}</strong>
            )}
          </li>
        );
      } else if (line === "") {
        return <div key={index} className="my-2"></div>;
      } else {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = line.split(boldRegex);
        return (
          <p key={index} className="my-2 text-gray-700">
            {parts.map((part, i) =>
              i % 2 === 0 ? part : <strong key={i}>{part}</strong>
            )}
          </p>
        );
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading summary...</div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-center text-red-500">Summary not found.</div>
    );
  }

  const contentText =
    typeof summary.content_markdown === "string"
      ? summary.content_markdown
      : JSON.stringify(summary.content_markdown, null, 2);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{summary.title}</h1>
        </div>
        <button className="text-blue-600">
          <PenIcon size={20} />
        </button>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>
            Last updated:{" "}
            {summary.last_updated
              ? new Date(summary.last_updated).toLocaleDateString()
              : "N/A"}
          </span>
          <span className="mx-2">•</span>
          <span>{summary.word_count || 0} words</span>
        </div>

        <div className="prose max-w-none">{renderMarkdown(contentText)}</div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <button
            onClick={async () => {
              // send summary text to generate-content as text input and create quiz
              try {
                setProcessing(true);
                const FUNCTION_URL =
                  "https://eoffiddgxjiwiyihczed.functions.supabase.co/generate-content";

                const formData = new FormData();
                formData.append("contentType", "quiz");
                formData.append("materialSource", "text");
                formData.append("text", contentText);
                formData.append("userId", userId);

                const res = await fetch(FUNCTION_URL, {
                  method: "POST",
                  body: formData,
                });

                const data = await res.json();
                if (!res.ok)
                  throw new Error(data.error || JSON.stringify(data));

                // data should include topic_id
                const topicId = data.topic_id;
                if (!topicId)
                  throw new Error("No topic_id returned from generate-content");

                // find the created quiz for this topic and user
                const { data: quizRows, error: quizErr } = await supabase
                  .from("quizzes")
                  .select("*")
                  .eq("topic_id", topicId)
                  .eq("user_id", userId)
                  .eq("kind", "auto")
                  .limit(1);

                if (quizErr) throw quizErr;
                const quiz =
                  Array.isArray(quizRows) && quizRows[0] ? quizRows[0] : null;

                if (!quiz) {
                  // Try fallback: find by topic_id only
                  const { data: fallbackRows, error: fallbackErr } =
                    await supabase
                      .from("quizzes")
                      .select("*")
                      .eq("topic_id", topicId)
                      .limit(1);
                  if (fallbackErr) throw fallbackErr;
                  if (Array.isArray(fallbackRows) && fallbackRows[0]) {
                    // @ts-ignore
                    quiz = fallbackRows[0];
                  }
                }

                if (!quiz)
                  throw new Error("Created quiz not found in database");

                // create an initial quiz_attempt (percentage 0) to mark the start
                const { data: attemptData, error: attemptErr } = await supabase
                  .from("quiz_attempts")
                  .insert({ quiz_id: quiz.id, percentage: 0 })
                  .select()
                  .single();

                if (attemptErr)
                  console.warn("Could not create initial attempt:", attemptErr);

                // navigate to quiz page
                navigate(`/quiz/${quiz.id}`);
                setPopup({
                  message: "Quiz generated — opening quiz...",
                  type: "success",
                });
              } catch (err: any) {
                console.error("Error generating quiz from summary:", err);
                setPopup({
                  message: `Failed to generate quiz: ${err.message ?? err}`,
                  type: "error",
                });
              } finally {
                setProcessing(false);
                setTimeout(() => setPopup(null), 3000);
              }
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          >
            <BookOpenIcon size={18} />
            <span>Take Quiz on This Topic</span>
          </button>
        </div>
      </div>
      {/* processing overlay */}
      {processing && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-40">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin mb-3"></div>
          <div className="text-gray-700 font-medium">{loadingMessage}</div>
        </div>
      )}

      {/* popup */}
      {popup && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}
    </div>
  );
}
