import React, { useState } from 'react';
import { SendIcon, BrainIcon } from 'lucide-react';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}
export function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    text: "Hi there! I'm your SmartRecall AI assistant. How can I help with your learning today?",
    sender: 'ai',
    timestamp: new Date()
  }]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    // Simulate AI API response
    setTimeout(() => {
      const aiResponses: {
        [key: string]: string;
      } = {
        help: "I'd be happy to help with your learning! I can help you create flashcards, quizzes, or summarize content. What would you like to work on?",
        psychology: 'Psychology is a fascinating subject! Would you like me to help you create flashcards for key psychology concepts, generate a quiz, or summarize a specific topic?',
        calculus: 'Calculus can be challenging! I can help you understand derivatives, integrals, or limits. What specific topic are you struggling with?',
        test: "I'll help you prepare for your test. What subject is it for, and when is the test scheduled?",
        flashcards: 'I can help you create effective flashcards. What topic are you studying?',
        quiz: "I'd be happy to generate a quiz for you. What subject and difficulty level would you prefer?"
      };
      // Find a matching response or use default
      let responseText = "I'll help you with that! What specific topic are you studying?";
      for (const [key, response] of Object.entries(aiResponses)) {
        if (newMessage.toLowerCase().includes(key)) {
          responseText = response;
          break;
        }
      }
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };
  return <div className="flex flex-col h-screen max-w-md mx-auto px-4 pb-20">
      <header className="py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-center">AI Assistant</h1>
        <p className="text-xs text-center text-gray-500 mt-1">
          Powered by OpenAI API
        </p>
      </header>
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map(message => <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
              {message.sender === 'ai' && <div className="flex items-center mb-1">
                  <BrainIcon size={16} className="mr-1" />
                  <span className="font-medium">SmartRecall AI</span>
                </div>}
              <p>{message.text}</p>
              <p className="text-xs opacity-70 text-right mt-1">
                {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
              </p>
            </div>
          </div>)}
        {isLoading && <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center">
                <BrainIcon size={16} className="mr-1" />
                <span className="font-medium">SmartRecall AI</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '0s'
            }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '0.2s'
            }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
              animationDelay: '0.4s'
            }}></div>
              </div>
            </div>
          </div>}
      </div>
      <div className="border-t border-gray-200 py-2">
        <div className="flex items-center">
          <input type="text" placeholder="Ask me anything about your studies..." className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }} disabled={isLoading} />
          <button onClick={handleSendMessage} className={`${isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-r-lg px-4 py-2 transition`} disabled={isLoading}>
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>;
}