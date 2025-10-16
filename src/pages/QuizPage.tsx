import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckIcon, XIcon } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}
interface Quiz {
  topic: string;
  type: string;
  questions: QuizQuestion[];
}
export function QuizPage() {
  const {
    topic,
    type
  } = useParams<{
    topic: string;
    type: string;
  }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  useEffect(() => {
    // Mock quiz data
    let quizData: Quiz;
    if (topic === 'japanese') {
      if (type === 'pretest') {
        quizData = {
          topic: 'Japanese Vocabulary',
          type: 'Pretest',
          questions: [{
            id: 1,
            question: 'What does "おはよう" (ohayou) mean?',
            options: ['Good morning', 'Good evening', 'Good night', 'Hello'],
            correctAnswer: 'Good morning'
          }, {
            id: 2,
            question: 'What is the Japanese word for "cat"?',
            options: ['ねこ (neko)', 'いぬ (inu)', 'とり (tori)', 'さかな (sakana)'],
            correctAnswer: 'ねこ (neko)'
          }, {
            id: 3,
            question: 'What does "ありがとう" (arigatou) mean?',
            options: ['Thank you', 'Sorry', 'Excuse me', 'Goodbye'],
            correctAnswer: 'Thank you'
          }, {
            id: 4,
            question: 'What is the Japanese word for "water"?',
            options: ['みず (mizu)', 'ひ (hi)', 'くうき (kuuki)', 'つち (tsuchi)'],
            correctAnswer: 'みず (mizu)'
          }, {
            id: 5,
            question: 'What does "さようなら" (sayounara) mean?',
            options: ['Goodbye', 'Welcome', 'Please', 'Yes'],
            correctAnswer: 'Goodbye'
          }]
        };
      } else {
        quizData = {
          topic: 'Japanese Vocabulary',
          type: 'Actual Quiz',
          questions: [{
            id: 1,
            question: 'What does "こんにちは" (konnichiwa) mean?',
            options: ['Hello/Good afternoon', 'Good morning', 'Good evening', 'Goodbye'],
            correctAnswer: 'Hello/Good afternoon'
          }, {
            id: 2,
            question: 'What is the Japanese word for "book"?',
            options: ['ほん (hon)', 'えんぴつ (enpitsu)', 'ノート (nooto)', 'かばん (kaban)'],
            correctAnswer: 'ほん (hon)'
          }, {
            id: 3,
            question: 'What does "すみません" (sumimasen) mean?',
            options: ['Excuse me/Sorry', 'Thank you', 'Please', "You're welcome"],
            correctAnswer: 'Excuse me/Sorry'
          }, {
            id: 4,
            question: 'What is the Japanese word for "student"?',
            options: ['がくせい (gakusei)', 'せんせい (sensei)', 'ともだち (tomodachi)', 'かぞく (kazoku)'],
            correctAnswer: 'がくせい (gakusei)'
          }, {
            id: 5,
            question: 'What does "いいえ" (iie) mean?',
            options: ['No', 'Yes', 'Maybe', "I don't know"],
            correctAnswer: 'No'
          }]
        };
      }
    } else {
      // Default quiz
      quizData = {
        topic: 'General Knowledge',
        type: 'Quiz',
        questions: [{
          id: 1,
          question: 'What is the capital of Japan?',
          options: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
          correctAnswer: 'Tokyo'
        }, {
          id: 2,
          question: 'Who wrote "Romeo and Juliet"?',
          options: ['William Shakespeare', 'Charles Dickens', 'Jane Austen', 'Mark Twain'],
          correctAnswer: 'William Shakespeare'
        }, {
          id: 3,
          question: 'What is the chemical formula for water?',
          options: ['H2O', 'CO2', 'NaCl', 'O2'],
          correctAnswer: 'H2O'
        }, {
          id: 4,
          question: 'What is the largest ocean on Earth?',
          options: ['Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
          correctAnswer: 'Pacific Ocean'
        }, {
          id: 5,
          question: 'Who painted the "Starry Night"?',
          options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
          correctAnswer: 'Vincent van Gogh'
        }]
      };
    }
    setQuiz(quizData);
    setUserAnswers(new Array(quizData.questions.length).fill(''));
  }, [topic, type]);
  // Timer
  useEffect(() => {
    if (!completed && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !completed) {
      setCompleted(true);
    }
  }, [timeLeft, completed]);
  if (!quiz) {
    return <div className="max-w-md mx-auto px-4 py-6 pb-20 text-center">
        Loading...
      </div>;
  }
  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = option;
    setUserAnswers(newAnswers);
  };
  const handleNextQuestion = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(userAnswers[currentIndex + 1] || null);
    } else {
      setCompleted(true);
    }
  };
  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(userAnswers[currentIndex - 1] || null);
    }
  };
  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return answer === quiz!.questions[index].correctAnswer ? score + 1 : score;
    }, 0);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  if (completed) {
    const score = calculateScore();
    const percentage = Math.round(score / quiz.questions.length * 100);
    const daysToReview = percentage >= 80 ? 5 : percentage >= 60 ? 3 : 1;
    return <div className="max-w-md mx-auto px-4 py-6 pb-20">
        <header className="flex items-center mb-6">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {quiz.topic} - Results
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
              You scored {score} out of {quiz.questions.length} questions
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
              <li>You have a good understanding of basic vocabulary</li>
              <li>Your recall of common phrases is strong</li>
            </ul> : <p className="mb-4 text-gray-700">
              Keep practicing to develop your vocabulary skills.
            </p>}
          <h3 className="font-medium mb-2">Areas for improvement:</h3>
          <ul className="list-disc list-inside mb-4 text-gray-700">
            {percentage < 80 && <li>Focus on more complex phrases and expressions</li>}
            {percentage < 60 && <li>Review basic vocabulary and common phrases</li>}
            <li>Practice with listening exercises to improve comprehension</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Question Review</h2>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => <div key={question.id} className="border-b border-gray-200 pb-4 last:border-0">
                <p className="font-medium mb-2">
                  {index + 1}. {question.question}
                </p>
                <div className="flex items-center">
                  <p className="text-gray-700">Your answer: </p>
                  <span className={`ml-2 ${userAnswers[index] === question.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                    {userAnswers[index] || 'No answer'}
                  </span>
                  {userAnswers[index] === question.correctAnswer ? <CheckIcon size={16} className="text-green-600 ml-1" /> : <XIcon size={16} className="text-red-600 ml-1" />}
                </div>
                {userAnswers[index] !== question.correctAnswer && <p className="text-gray-700 mt-1">
                    Correct answer:{' '}
                    <span className="text-green-600">
                      {question.correctAnswer}
                    </span>
                  </p>}
              </div>)}
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/study" className="flex-1">
            <button className="w-full bg-gray-100 text-gray-800 py-3 rounded-md hover:bg-gray-200 transition">
              Back to Study
            </button>
          </Link>
          <button className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition" onClick={() => {
          setCurrentIndex(0);
          setSelectedOption(null);
          setUserAnswers(new Array(quiz.questions.length).fill(''));
          setCompleted(false);
          setTimeLeft(300);
        }}>
            Try Again
          </button>
        </div>
      </div>;
  }
  const currentQuestion = quiz.questions[currentIndex];
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.topic}</h1>
            <p className="text-sm text-gray-500">{quiz.type}</p>
          </div>
        </div>
        <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          {formatTime(timeLeft)}
        </div>
      </header>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all" style={{
          width: `${(currentIndex + 1) / quiz.questions.length * 100}%`
        }}></div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-6">
          {currentQuestion.question}
        </h2>
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => <button key={index} className={`w-full text-left p-3 rounded-md border ${selectedOption === option ? 'bg-blue-100 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleSelectOption(option)}>
              {option}
            </button>)}
        </div>
        <div className="flex justify-between">
          <button className="py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition disabled:opacity-50" onClick={handlePrevQuestion} disabled={currentIndex === 0}>
            Previous
          </button>
          <button className={`py-2 px-4 ${selectedOption ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-md transition`} onClick={handleNextQuestion} disabled={!selectedOption}>
            {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>;
}