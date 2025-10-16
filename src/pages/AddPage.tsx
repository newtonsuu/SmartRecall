import React, { useState } from 'react';
import { FileIcon, FileTextIcon, FileTypeIcon, TextIcon } from 'lucide-react';
type ContentType = 'flashcards' | 'quiz' | 'summary' | null;
type MaterialSource = 'pdf' | 'ppt' | 'word' | 'text' | null;
export function AddPage() {
  const [contentType, setContentType] = useState<ContentType>(null);
  const [materialSource, setMaterialSource] = useState<MaterialSource>(null);
  return <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Material</h1>
      </header>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          1. Select Content Type
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button className={`flex flex-col items-center justify-center p-4 border rounded-lg ${contentType === 'flashcards' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setContentType('flashcards')}>
            <div className="mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10" />
                <path d="M7 12h10" />
                <path d="M7 17h10" />
              </svg>
            </div>
            <span className="text-sm">Flashcards</span>
          </button>
          <button className={`flex flex-col items-center justify-center p-4 border rounded-lg ${contentType === 'quiz' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setContentType('quiz')}>
            <div className="mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <span className="text-sm">Quiz</span>
          </button>
          <button className={`flex flex-col items-center justify-center p-4 border rounded-lg ${contentType === 'summary' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`} onClick={() => setContentType('summary')}>
            <div className="mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <line x1="8" x2="16" y1="8" y2="8" />
                <line x1="8" x2="16" y1="12" y2="12" />
                <line x1="8" x2="12" y1="16" y2="16" />
              </svg>
            </div>
            <span className="text-sm">Summary</span>
          </button>
        </div>
        {contentType && <>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              2. Choose your material
            </h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setMaterialSource('pdf')}>
                <div className="flex items-center">
                  <FileIcon className="mr-3 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload PDF</p>
                    <p className="text-sm text-gray-500">
                      Select a PDF file from your device
                    </p>
                  </div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setMaterialSource('ppt')}>
                <div className="flex items-center">
                  <FileIcon className="mr-3 text-orange-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload PPT</p>
                    <p className="text-sm text-gray-500">
                      Select a PPT file from your device
                    </p>
                  </div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setMaterialSource('word')}>
                <div className="flex items-center">
                  <FileIcon className="mr-3 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Upload Word</p>
                    <p className="text-sm text-gray-500">
                      Select a DOCX file from your device
                    </p>
                  </div>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50" onClick={() => setMaterialSource('text')}>
                <div className="flex items-center">
                  <TextIcon className="mr-3 text-gray-500" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      Paste text or link
                    </p>
                    <p className="text-sm text-gray-500">
                      Enter text or a URL manually
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </>}
      </div>
    </div>;
}