import { useEffect, useState } from "react";
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface QuizQuestion {
  id: number;
  question: string;
  choices: string[];
  answer: string;
}

interface SupabaseQuiz {
  id: number;
  title: string;
  kind: string;
  payload: {
    title: string;
    questions: QuizQuestion[];
  };
}

export function EditQuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<SupabaseQuiz | null>(null);
  const [title, setTitle] = useState("");
  const [timeLimit, setTimeLimit] = useState(600);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load quiz from Supabase
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching quiz:", error);
        setLoading(false);
        return;
      }

      setQuiz(data);
      setTitle(data.title);
      setTimeLimit(data.timeLimit || 600);
      const normalized: QuizQuestion[] = (data.payload?.questions ?? []).map(
        (q: any, idx: number) => ({
          id: typeof q.id === "number" ? q.id : idx + 1,
          question: q.question ?? "",
          choices: Array.isArray(q.choices) ? q.choices : ["", "", "", ""],
          answer: q.answer ?? "",
        })
      );
      setQuestions(normalized);
      setLoading(false);
    };

    fetchQuiz();
  }, [id]);

  // ✅ Add / Delete / Update question logic
  const handleAddQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      question: "",
      choices: ["", "", "", ""],
      answer: "",
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleDeleteQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: number, field: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleUpdateChoice = (
    questionId: number,
    choiceIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newChoices = [...q.choices];
          newChoices[choiceIndex] = value;
          return { ...q, choices: newChoices };
        }
        return q;
      })
    );
  };

  // ✅ Save changes to Supabase
  const handleSave = async () => {
    if (!quiz) return;

    const payload = {
      title,
      questions,
    };

    const { error } = await supabase
      .from("quizzes")
      .update({
        title,
        payload,
        timeLimit,
      })
      .eq("id", quiz.id);

    if (error) {
      console.error("Error saving quiz:", error);
      alert("Failed to save quiz.");
      return;
    }

    alert("Quiz updated successfully!");
    navigate("/study");
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="p-6 text-center text-gray-600">Quiz not found.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quiz Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter quiz title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Question {index + 1}
              </h3>
              <button  
                type="button"
                onClick={() => handleDeleteQuestion(question.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2Icon size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    handleUpdateQuestion(
                      question.id,
                      "question",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Enter question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Choices
                </label>
                <div className="space-y-2">
                  {question.choices.map((choice, choiceIndex) => (
                    <input
                      key={choiceIndex}
                      type="text"
                      value={choice}
                      onChange={(e) =>
                        handleUpdateChoice(
                          question.id,
                          choiceIndex,
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Choice ${choiceIndex + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <select
                  value={question.answer}
                  onChange={(e) =>
                    handleUpdateQuestion(
                      question.id,
                      "answer",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select correct answer</option>
                  {question.choices.map((choice, i) => (
                    <option key={i} value={choice}>
                      {choice || `choice ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddQuestion}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
      >
        <PlusIcon size={20} />
        <span>Add New Question</span>
      </button>
    </div>
  );
}
