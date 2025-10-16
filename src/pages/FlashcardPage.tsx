import React, { useEffect, useState, memo } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XIcon } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
interface Flashcard {
  id: number;
  question: string;
  answer: string;
  options: string[];
}
interface FlashcardSet {
  topic: string;
  cards: Flashcard[];
}
export function FlashcardPage() {
  const {
    topic
  } = useParams<{
    topic: string;
  }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardSet | null>(null);
  useEffect(() => {
    // Mock flashcard data based on topic
    let cards: FlashcardSet;
    if (topic === 'psychology') {
      cards = {
        topic: 'Psychology 101',
        cards: [{
          id: 1,
          question: 'What is the definition of classical conditioning?',
          answer: 'A learning process that occurs when two stimuli are repeatedly paired',
          options: ['A learning process that occurs when two stimuli are repeatedly paired', 'Learning by observing others', 'Learning through rewards and punishments', 'The study of unconscious processes']
        }, {
          id: 2,
          question: 'Who conducted the famous "Little Albert" experiment?',
          answer: 'John B. Watson',
          options: ['John B. Watson', 'B.F. Skinner', 'Ivan Pavlov', 'Sigmund Freud']
        }, {
          id: 3,
          question: 'What is the recency effect in memory?',
          answer: 'The tendency to remember items at the end of a list better',
          options: ['The tendency to remember items at the end of a list better', 'The tendency to remember items at the beginning of a list better', 'The tendency to remember emotionally charged events better', 'The tendency to forget information over time']
        }, {
          id: 4,
          question: 'What part of the brain is primarily responsible for decision making and planning?',
          answer: 'Prefrontal cortex',
          options: ['Prefrontal cortex', 'Amygdala', 'Hippocampus', 'Cerebellum']
        }, {
          id: 5,
          question: 'What is cognitive dissonance?',
          answer: 'Mental discomfort that results from holding two conflicting beliefs',
          options: ['Mental discomfort that results from holding two conflicting beliefs', 'The inability to form new memories', 'A state of heightened awareness', 'A type of learning disability']
        }]
      };
    } else if (topic === 'calculus') {
      cards = {
        topic: 'Calculus II',
        cards: [{
          id: 1,
          question: 'What is the derivative of e^x?',
          answer: 'e^x',
          options: ['e^x', 'x*e^(x-1)', '1/x', 'ln(x)']
        }, {
          id: 2,
          question: 'What is the integral of 1/x?',
          answer: 'ln|x| + C',
          options: ['ln|x| + C', 'x^2/2 + C', 'e^x + C', '1/x + C']
        }, {
          id: 3,
          question: 'What is the derivative of sin(x)?',
          answer: 'cos(x)',
          options: ['cos(x)', '-sin(x)', 'tan(x)', '-cos(x)']
        }, {
          id: 4,
          question: 'What is the chain rule used for?',
          answer: 'Finding the derivative of a composite function',
          options: ['Finding the derivative of a composite function', 'Finding the integral of a function', 'Solving differential equations', 'Finding limits of functions']
        }, {
          id: 5,
          question: 'What is the integral of cos(x)?',
          answer: 'sin(x) + C',
          options: ['sin(x) + C', '-cos(x) + C', '-sin(x) + C', 'tan(x) + C']
        }]
      };
    } else {
      // Default set
      cards = {
        topic: 'General Knowledge',
        cards: [{
          id: 1,
          question: 'What is the capital of France?',
          answer: 'Paris',
          options: ['Paris', 'London', 'Berlin', 'Rome']
        }, {
          id: 2,
          question: 'Who painted the Mona Lisa?',
          answer: 'Leonardo da Vinci',
          options: ['Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Michelangelo']
        }, {
          id: 3,
          question: 'What is the chemical symbol for gold?',
          answer: 'Au',
          options: ['Au', 'Ag', 'Fe', 'Cu']
        }, {
          id: 4,
          question: 'What planet is known as the Red Planet?',
          answer: 'Mars',
          options: ['Mars', 'Venus', 'Jupiter', 'Saturn']
        }, {
          id: 5,
          question: 'What is the largest mammal on Earth?',
          answer: 'Blue whale',
          options: ['Blue whale', 'African elephant', 'Giraffe', 'Polar bear']
        }]
      };
    }
    setFlashcards(cards);
  }, [topic]);
  if (!flashcards) {
    return <div className="max-w-md mx-auto px-4 py-6 pb-20 text-center">
        Loading...
      </div>;
  }
  const handleNextCard = () => {
    if (selectedOption === flashcards.cards[currentIndex].answer) {
      setScore(score + 1);
    }
    if (currentIndex < flashcards.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsFlipped(false);
    } else {
      setCompleted(true);
    }
  };
  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setIsFlipped(false);
    }
  };
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
  };
  const currentCard = flashcards.cards[currentIndex];
  if (completed) {
    const percentage = Math.round(score / flashcards.cards.length * 100);
    const daysToReview = percentage >= 80 ? 5 : percentage >= 60 ? 3 : 1;
    return <div className="max-w-md mx-auto px-4 py-6 pb-20">
        <header className="flex items-center mb-6">
          <Link to="/" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {flashcards.topic} - Results
          </h1>
        </header>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 relative">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={percentage >= 80 ? '#4ade80' : percentage >= 60 ? '#facc15' : '#f87171'} strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{percentage}%</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Quiz Complete!</h2>
            <p className="text-gray-600 mb-4">
              You scored {score} out of {flashcards.cards.length} questions
              correctly.
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">AI Recommendation</h2>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-blue-800">
              Based on your performance, you should review this material again
              in <span className="font-semibold">{daysToReview} days</span>.
            </p>
          </div>
          <h3 className="font-medium mb-2">Strengths:</h3>
          {percentage >= 60 ? <ul className="list-disc list-inside mb-4 text-gray-700">
              <li>You have a good understanding of basic concepts</li>
              <li>Your recall of key definitions is strong</li>
            </ul> : <p className="mb-4 text-gray-700">
              Keep practicing to develop your strengths in this topic.
            </p>}
          <h3 className="font-medium mb-2">Areas for improvement:</h3>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            {percentage < 80 && <li>Focus on more complex concepts</li>}
            {percentage < 60 && <li>Review core definitions and principles</li>}
            <li>Practice with more varied question formats</li>
          </ul>
        </div>
        <div className="flex gap-4">
          <Link to="/" className="flex-1">
            <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-md hover:bg-gray-200 transition">
              Return Home
            </button>
          </Link>
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition" onClick={() => {
          setCurrentIndex(0);
          setScore(0);
          setSelectedOption(null);
          setIsFlipped(false);
          setCompleted(false);
        }}>
            Try Again
          </button>
        </div>
      </div>;
  }
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {flashcards.topic}
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          {currentIndex + 1}/{flashcards.cards.length}
        </div>
      </header>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">{currentCard.question}</h2>
        <div className="space-y-3 mb-6">
          {currentCard.options.map((option, index) => <button key={index} className={`w-full text-left p-3 rounded-md border ${selectedOption === option ? isFlipped ? option === currentCard.answer ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500' : 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleSelectOption(option)} disabled={isFlipped}>
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isFlipped && selectedOption === option && (option === currentCard.answer ? <CheckIcon className="text-green-600" size={20} /> : <XIcon className="text-red-600" size={20} />)}
              </div>
            </button>)}
        </div>
        <div className="flex justify-between">
          <button className="py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition disabled:opacity-50" onClick={handlePrevCard} disabled={currentIndex === 0}>
            Previous
          </button>
          {!isFlipped && selectedOption ? <button className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition" onClick={() => setIsFlipped(true)}>
              Check Answer
            </button> : isFlipped ? <button className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition" onClick={handleNextCard}>
              {currentIndex === flashcards.cards.length - 1 ? 'Finish' : 'Next'}
            </button> : <button className="py-2 px-4 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed" disabled={true}>
              Select an Answer
            </button>}
        </div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-600 transition-all" style={{
        width: `${(currentIndex + 1) / flashcards.cards.length * 100}%`
      }}></div>
      </div>
    </div>;
}