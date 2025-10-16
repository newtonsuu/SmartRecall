import React from 'react';
import { ArrowLeftIcon, BookOpenIcon, PenIcon } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
export function SummaryPage() {
  const {
    topic
  } = useParams<{
    topic: string;
  }>();
  // Mock summary data based on topic
  const getSummaryData = () => {
    if (topic === 'japanese') {
      return {
        title: 'Japanese Vocabulary Summary',
        content: `
          # Japanese Vocabulary Basics
          ## Greetings and Common Phrases
          - **おはよう** (ohayou) - Good morning
          - **こんにちは** (konnichiwa) - Hello/Good afternoon
          - **こんばんは** (konbanwa) - Good evening
          - **さようなら** (sayounara) - Goodbye
          - **ありがとう** (arigatou) - Thank you
          - **すみません** (sumimasen) - Excuse me/Sorry
          ## Basic Nouns
          - **ねこ** (neko) - Cat
          - **いぬ** (inu) - Dog
          - **みず** (mizu) - Water
          - **ほん** (hon) - Book
          - **がくせい** (gakusei) - Student
          ## Essential Verbs
          - **たべる** (taberu) - To eat
          - **のむ** (nomu) - To drink
          - **いく** (iku) - To go
          - **みる** (miru) - To see/watch
          - **よむ** (yomu) - To read
          ## Useful Adjectives
          - **おおきい** (ookii) - Big
          - **ちいさい** (chiisai) - Small
          - **あたらしい** (atarashii) - New
          - **ふるい** (furui) - Old
          - **おいしい** (oishii) - Delicious
        `,
        lastUpdated: '1 week ago',
        wordCount: 120
      };
    } else {
      return {
        title: 'General Knowledge Summary',
        content: `
          # General Knowledge Summary
          This is a placeholder summary for general knowledge topics. The actual content would depend on the specific topic being studied.
          ## Key Points
          - Point 1: Important information about the topic
          - Point 2: Critical concept to understand
          - Point 3: Historical context or background
          - Point 4: Modern applications or relevance
          ## Common Misconceptions
          - Misconception 1: Why it's incorrect
          - Misconception 2: The actual facts
          ## Study Tips
          - Tip 1: Effective study strategy
          - Tip 2: Memory techniques
          - Tip 3: Practice methods
        `,
        lastUpdated: '3 days ago',
        wordCount: 85
      };
    }
  };
  const summaryData = getSummaryData();
  // Simple markdown-like renderer (very basic implementation)
  const renderMarkdown = (text: string) => {
    const lines = text.trim().split('\n');
    return lines.map((line, index) => {
      line = line.trim();
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold my-4">
            {line.substring(2)}
          </h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold my-3 text-gray-800">
            {line.substring(3)}
          </h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium my-2 text-gray-800">
            {line.substring(4)}
          </h3>;
      } else if (line.startsWith('- ')) {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const parts = line.substring(2).split(boldRegex);
        return <li key={index} className="ml-4 my-1 text-gray-700">
            {parts.map((part, i) => {
            return i % 2 === 0 ? part : <strong key={i}>{part}</strong>;
          })}
          </li>;
      } else if (line === '') {
        return <div key={index} className="my-2"></div>;
      } else {
        return <p key={index} className="my-2 text-gray-700">
            {line}
          </p>;
      }
    });
  };
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {summaryData.title}
          </h1>
        </div>
        <button className="text-blue-600">
          <PenIcon size={20} />
        </button>
      </header>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>Last updated: {summaryData.lastUpdated}</span>
          <span className="mx-2">•</span>
          <span>{summaryData.wordCount} words</span>
        </div>
        <div className="prose max-w-none">
          {renderMarkdown(summaryData.content)}
        </div>
      </div>
      <div className="flex gap-4">
        <Link to={`/quiz/japanese/actual`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
            <BookOpenIcon size={18} />
            <span>Take Quiz on This Topic</span>
          </button>
        </Link>
      </div>
    </div>;
}