import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SendIcon, BrainIcon } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

interface AuthUser {
  id: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function AIAssistantPage() {
  const { profile, loading: authLoading } = useAuth();
  const user: AuthUser | null = profile ? { id: profile.id } : null;


  // Helper to get localStorage key per user
  const getStorageKey = (uid: string | null) =>
    uid ? `ai-assistant-history-${uid}` : "ai-assistant-history-anon";

  // Load history from localStorage if exists, else show default message
  const [messages, setMessages] = useState<Message[]>(() => {
    // Try to get user id from localStorage (fallback to anon)
    const uid = (typeof window !== "undefined" && window.localStorage.getItem("ai-assistant-last-user")) || null;
    const key = getStorageKey(uid);
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) {
            return arr.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          }
        } catch {}
      }
    }
    // Default welcome message
    return [
      {
        id: "1",
        text: "Hi there! I'm your SmartRecall AI assistant. How can I help with your learning today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ];
  });

  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Save history to localStorage whenever messages or user changes
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const key = getStorageKey(user?.id ?? null);
    window.localStorage.setItem(key, JSON.stringify(messages));
    if (user?.id) {
      window.localStorage.setItem("ai-assistant-last-user", user.id);
    }
  }, [messages, user]);

  // Helper for API history format
  const getHistoryForApi = () =>
    messages.map((msg) => ({
      role: msg.sender === "ai" ? "model" : "user",
      text: msg.text,
    }));

  const handleSendMessage = async () => {
    if (!user || newMessage.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    };

  // Show user message immediately
  setMessages((prev) => [...prev, userMessage]);
  setNewMessage("");
  setIsLoading(true);

    try {
      const FUNCTION_URL =
        "https://eoffiddgxjiwiyihczed.functions.supabase.co/ai-chat";

      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userMessage: userMessage.text,
          history: getHistoryForApi(),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const text = await res.text();
      if (!text) throw new Error("Empty response from server");

      const data = JSON.parse(text);
      // Use returned history to keep messages in sync
      const updatedMessages =
        Array.isArray(data.history) && data.history.length > 0
          ? data.history.map(
              (msg: { role: string; text: string }, idx: number) => ({
                id: (Date.now() + idx).toString(),
                text: msg.text,
                sender: msg.role === "model" ? "ai" : "user",
                timestamp: new Date(),
              })
            )
          : [
              ...messages,
              {
                id: (Date.now() + 1).toString(),
                text:
                  data.message ||
                  "Sorry, I couldn’t generate a proper response this time.",
                sender: "ai",
                timestamp: new Date(),
              },
            ];

  setMessages(updatedMessages);
    } catch (err: any) {
      console.error("❌ AI request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          text: `Oops! Something went wrong: ${err.message}`,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto px-4 pb-20">
      <header className="py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-center">AI Assistant</h1>
        <p className="text-xs text-center text-gray-500 mt-1">
          Powered by Gemini API
        </p>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "text-left"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === "user"
                  ? "bg-blue-600 text-white text-right"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "ai" && (
                <div className="flex items-center mb-1">
                  <BrainIcon size={16} className="mr-1" />
                  <span className="font-medium">SmartRecall AI</span>
                </div>
              )}
              {message.sender === "ai" ? (
                <div className="prose prose-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
              ) : (
                <p>{message.text}</p>
              )}
              <p className="text-xs opacity-70 text-right mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
              <div className="flex items-center">
                <BrainIcon size={16} className="mr-1" />
                <span className="font-medium">SmartRecall AI</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 py-2">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Ask me anything about your studies..."
            className="flex-1 border border-gray-300 rounded-l-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={isLoading || authLoading || !user}
          />
          <button
            onClick={handleSendMessage}
            className={`${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-r-lg px-4 py-2 transition`}
            disabled={isLoading || authLoading || !user}
          >
            <SendIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
