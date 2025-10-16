import React from 'react';
import { CalendarIcon, TrendingUpIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
export function HomePage() {
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SmartRecall</h1>
      </header>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Activity History
        </h2>
        <div className="space-y-4">
          <Link to="/flashcard/psychology" className="block">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Last accessed 2d ago</p>
                  <h3 className="text-lg font-medium text-gray-900">
                    Psychology 101
                  </h3>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  Next session: 1d 12h
                </div>
              </div>
            </div>
          </Link>
          <Link to="/flashcard/calculus" className="block">
            <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Last accessed 1w ago</p>
                  <h3 className="text-lg font-medium text-gray-900">
                    Calculus II
                  </h3>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                  Next session: 3d 8h
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Progress Overview
        </h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="h-40 w-full bg-gray-100 rounded flex items-center justify-center">
            <TrendingUpIcon size={40} className="text-gray-400" />
          </div>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          AI Recommendation
        </h2>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
              Retake: 2d 18h
            </div>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
              Score: 85%
            </div>
          </div>
          <p className="text-gray-600">
            Based on your learning patterns, we recommend reviewing your
            Psychology flashcards in 2 days.
          </p>
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Streak Tracker
        </h2>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Current Streak
          </h3>
          <div className="flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            <p className="text-gray-800 font-medium">5 days completed</p>
          </div>
          <div className="mt-4 flex">
            {[1, 2, 3, 4, 5, 6, 7].map(day => <div key={day} className="flex-1 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${day <= 5 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                  {day}
                </div>
              </div>)}
          </div>
        </div>
      </section>
    </div>;
}