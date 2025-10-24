import { useEffect, useState } from "react";
import { ArrowLeftIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface FlashcardItem {
  id: number;
  question: string;
  answer: string;
  options: string[];
}

export function EditFlashcardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<FlashcardItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch flashcard set by id
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching flashcard set:", error);
      } else if (data) {
        setTitle(data.title);
        const payload = data.payload || { flashcards: [] };
        setCards(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          payload.flashcards.map((f: any, i: number) => ({
            id: i + 1,
            question: f.question,
            answer: f.answer,
            options: f.choices,
          }))
        );
      }
      setLoading(false);
    };

    fetchFlashcardSet();
  }, [id]);

  const handleAddCard = () => {
    const newCard: FlashcardItem = {
      id: Date.now(),
      question: "",
      answer: "",
      options: ["", "", "", ""],
    };
    setCards([...cards, newCard]);
  };

  const handleDeleteCard = (cardId: number) => {
    setCards(cards.filter((c) => c.id !== cardId));
  };

  const handleUpdateCard = (
    cardId: number,
    field: keyof FlashcardItem,
    value: string
  ) => {
    setCards(
      cards.map((c) => (c.id === cardId ? { ...c, [field]: value } : c))
    );
  };

  const handleUpdateOption = (
    cardId: number,
    optionIndex: number,
    value: string
  ) => {
    setCards(
      cards.map((card) => {
        if (card.id === cardId) {
          const newOptions = [...card.options];
          newOptions[optionIndex] = value;
          return { ...card, options: newOptions };
        }
        return card;
      })
    );
  };

  const handleSave = async () => {
    const payload = {
      flashcards: cards.map((c) => ({
        question: c.question,
        answer: c.answer,
        choices: c.options,
      })),
    };

    const { error } = await supabase
      .from("flashcard_sets")
      .update({
        title,
        payload,
      })
      .eq("id", id);

    if (error) {
      console.error("Error saving flashcards:", error);
      alert("Failed to save changes.");
    } else {
      alert("Flashcards saved successfully!");
      navigate("/study");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-10">
        Loading flashcards...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Edit Flashcard Set
          </h1>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Flashcard Set Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter flashcard set title"
        />
      </div>

      <div className="space-y-4 mb-6">
        {cards.map((card, index) => (
          <div key={card.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Card {index + 1}
              </h3>
              <button
                onClick={() => handleDeleteCard(card.id)}
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
                  value={card.question}
                  onChange={(e) =>
                    handleUpdateCard(card.id, "question", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Enter question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correct Answer
                </label>
                <input
                  type="text"
                  value={card.answer}
                  onChange={(e) =>
                    handleUpdateCard(card.id, "answer", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter correct answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
                </label>
                <div className="space-y-2">
                  {card.options.map((option, optionIndex) => (
                    <input
                      key={optionIndex}
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleUpdateOption(card.id, optionIndex, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddCard}
        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
      >
        <PlusIcon size={20} />
        <span>Add New Card</span>
      </button>
    </div>
  );
}
