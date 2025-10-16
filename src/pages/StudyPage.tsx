import React, { useState } from 'react';
import { ChevronRightIcon, EditIcon, Trash2Icon, PlayIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
type Tab = 'flashcards' | 'quizzes' | 'summaries';
export function StudyPage() {
  const [activeTab, setActiveTab] = useState<Tab>('flashcards');
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
      </header>
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button className={`py-2 px-4 text-center flex-1 ${activeTab === 'flashcards' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('flashcards')}>
            Flashcards
          </button>
          <button className={`py-2 px-4 text-center flex-1 ${activeTab === 'quizzes' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('quizzes')}>
            Quizzes
          </button>
          <button className={`py-2 px-4 text-center flex-1 ${activeTab === 'summaries' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`} onClick={() => setActiveTab('summaries')}>
            Summaries
          </button>
        </div>
      </div>
      {activeTab === 'flashcards' && <div className="space-y-4">
          <Link to="/flashcard/psychology" className="block">
            <StudyCard title="Japanese Vocabulary" lastAccessed="2 days ago" score={85} nextReview="Tomorrow" />
          </Link>
          <Link to="/flashcard/world-capitals" className="block">
            <StudyCard title="World Capitals" lastAccessed="1 week ago" score={70} nextReview="in 3 days" />
          </Link>
          <Link to="/flashcard/periodic-table" className="block">
            <StudyCard title="Periodic Table" lastAccessed="3 weeks ago" score={60} nextReview="in 1 week" />
          </Link>
        </div>}
      {activeTab === 'quizzes' && <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Japanese Vocabulary
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/quiz/japanese/pretest" className="flex-1">
                <button className="w-full bg-blue-100 text-blue-700 py-2 px-4 rounded-md hover:bg-blue-200 transition flex items-center justify-center gap-2">
                  <PlayIcon size={16} />
                  <span>Pretest</span>
                </button>
              </Link>
              <Link to="/quiz/japanese/actual" className="flex-1">
                <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-md hover:bg-green-200 transition flex items-center justify-center gap-2">
                  <PlayIcon size={16} />
                  <span>Actual Quiz</span>
                </button>
              </Link>
            </div>
          </div>
          <Link to="/quiz/japanese/actual" className="block">
            <StudyCard title="Japanese Vocabulary Quiz" lastAccessed="5 days ago" score={90} nextReview="in 2 days" isQuiz />
          </Link>
        </div>}
      {activeTab === 'summaries' && <div className="space-y-4">
          <Link to="/summary/japanese" className="block">
            <SummaryCard title="Japanese Vocabulary Summary" lastUpdated="1 week ago" wordCount={120} nextUpdate="in 4 days" />
          </Link>
        </div>}
    </div>;
}
interface StudyCardProps {
  title: string;
  lastAccessed: string;
  score: number;
  nextReview: string;
  isQuiz?: boolean;
}
function StudyCard({
  title,
  lastAccessed,
  score,
  nextReview,
  isQuiz = false
}: StudyCardProps) {
  return <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">Last accessed: {lastAccessed}</p>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="flex items-center gap-4 mt-2 text-sm">
        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-2 ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          <span>Score: {score}%</span>
        </div>
        <span className="text-gray-400">|</span>
        <span>
          Next {isQuiz ? 'quiz' : 'review'}: {nextReview}
        </span>
      </div>
      <div className="flex mt-4 gap-4">
        <button className="text-blue-600 flex items-center gap-1 text-sm">
          <EditIcon size={16} />
          <span>Edit</span>
        </button>
        <button className="text-red-600 flex items-center gap-1 text-sm">
          <Trash2Icon size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>;
}
interface SummaryCardProps {
  title: string;
  lastUpdated: string;
  wordCount: number;
  nextUpdate: string;
}
function SummaryCard({
  title,
  lastUpdated,
  wordCount,
  nextUpdate
}: SummaryCardProps) {
  return <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <div className="flex items-center gap-4 mt-2 text-sm">
        <span>Words summarized: {wordCount}</span>
        <span className="text-gray-400">|</span>
        <span>Next update: {nextUpdate}</span>
      </div>
      <div className="flex mt-4 gap-4">
        <button className="text-blue-600 flex items-center gap-1 text-sm">
          <EditIcon size={16} />
          <span>Edit</span>
        </button>
        <button className="text-red-600 flex items-center gap-1 text-sm">
          <Trash2Icon size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>;
}