import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckIcon, XIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

type Flashcard = {
  question: string;
  choices: string[];
  answer: string;
};

type FlashcardSet = {
  id: number;
  title: string;
  payload: { flashcards: Flashcard[] };
  created_at: string;
  user_id: string;
};

export function FlashcardPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [setData, setSetData] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const checkAttempts = async () => {
      if (!id) return;

      const now = new Date();
      const { data: flashcardData } = await supabase
        .from("flashcard_sets")
        .select("next_review")
        .eq("id", id)
        .single();
      if (
        flashcardData?.next_review &&
        new Date(flashcardData.next_review) > now
      ) {
        alert("You’re currently locked out from this flashcard. Try again later.");
        navigate("/study");
        return;
      }
    };
    checkAttempts();
  }, [id]);
  
  useEffect(() => {
    const loadFlashcardSet = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("id", id)
        .single();
  
      if (error) console.error("Error loading flashcards:", error);
      else setSetData(data);
  
      setLoading(false);
    };
    loadFlashcardSet();
  }, [id]);

  const handleCheckAnswer = () => {
    if (!selected || checked) return;

    const flashcards = setData?.payload?.flashcards || [];
    const currentCard = flashcards[currentIndex];
    if (selected === currentCard.answer) {
      setScore((prev) => prev + 1);
    }

    setChecked(true);
  };

  const handleNext = async () => {
    setChecked(false);
    setSelected(null);

    const flashcards = setData?.payload?.flashcards || [];
    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setCompleted(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user || !setData) return;

    const percent = Math.round(
      (score / (setData.payload.flashcards.length || 1)) * 100
    );

    const { error } = await supabase.from("flashcard_sessions").insert([
      {
        user_id: user.id,
        set_id: setData.id,
        score: percent,
      },
    ]);

    await supabase
      .from("flashcard_sets")
      .update({ last_accessed: new Date() })
      .eq("id", id);

    const { data: attemptData } = await supabase.rpc(
      "get_today_flashcard_attempts",
      { p_flashcard_id: id }
    );

    if (attemptData.length == 3) {
      const averageScore =
        attemptData
          .map((a: any) => a.percentage)
          .reduce((a: number, b: number) => a + b, 0) /
        attemptData.length;
      const nextReview = nextReviewFromScore(averageScore);
      const { error: updateError } = await supabase
        .from("flashcard_sets")
        .update({ next_review: nextReview })
        .eq("id", id);
      if (updateError) console.error("Update error:", updateError);
    } 

    if (error) console.error("Error saving session:", error);
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading flashcards...</div>
    );

  if (!setData)
    return <div className="p-6 text-center text-red-500">Set not found.</div>;

  const flashcards = setData.payload.flashcards;
  const card = flashcards[currentIndex];

  if (completed) {
    const total = flashcards.length;
    const percentage = Math.round((score / total) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-20">
        <header className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {setData.title} - Results
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
              You scored {score} out of {total} questions
              correctly.
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="flex-1">
            <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-md hover:bg-gray-200 transition">
              Return Home
            </button>
          </Link>
          <button
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
            onClick={() => {
              window.location.reload();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{setData.title}</h1>
        </div>
      </header>

      <div className="bg-white shadow-lg rounded-xl p-6">
        <p className="text-sm text-gray-500 mb-4">
          Question {currentIndex + 1} of {flashcards.length}
        </p>
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          {card.question}
        </h2>

        <div className="space-y-3 mb-6">
          {card.choices.map((choice, i) => {
            const isCorrect = choice === card.answer;
            const isSelected = selected === choice;

            let btnClass =
              "w-full py-3 rounded-lg border text-left px-4 transition";
            if (checked) {
              if (isCorrect) btnClass += " border-green-500 bg-green-100";
              else if (isSelected) btnClass += " border-red-500 bg-red-100";
              else btnClass += " border-gray-200 bg-gray-50";
            } else if (isSelected) {
              btnClass += " border-blue-500 bg-blue-50";
            } else {
              btnClass += " border-gray-300 hover:bg-blue-50 cursor-pointer";
            }

            return (
              <button
                key={i}
                onClick={() => setSelected(choice)}
                disabled={checked}
                className={btnClass}
              >
                <div className="flex justify-between items-center">
                  <span>{choice}</span>
                  {checked && isCorrect && (
                    <CheckIcon size={18} className="text-green-600" />
                  )}
                  {checked && isSelected && !isCorrect && (
                    <XIcon size={18} className="text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        {!checked ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!selected}
            className={`w-full py-3 rounded-lg text-white transition ${
              selected
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            {currentIndex + 1 < flashcards.length ? "Next Question" : "Finish"}
          </button>
        )}
      </div>
    </div>
  );
}
