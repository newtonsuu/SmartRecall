import React, { useRef, useState, useEffect } from "react";
import { FileIcon, TextIcon } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

type ContentType = "flashcards" | "quiz" | "summary" | null;
type MaterialSource = "pdf" | "pptx" | "docx" | "text" | null;

export function AddPage() {
  const { profile } = useAuth();
  const user: { id: string } | null = profile ? { id: profile.id } : null;
  const [contentType, setContentType] = useState<ContentType>(null);
  const [materialSource, setMaterialSource] = useState<MaterialSource>(null);
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Uploading document...");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messages = [
    "Uploading document...",
    "Processing document...",
    "Generating flashcards/quiz/summary...",
  ];

  useEffect(() => {
    if (!loading) return;
    let index = 0;
    setLoadingMessage(messages[index]);
    const interval = setInterval(() => {
      index = Math.min(index + 1, messages.length - 1);
      setLoadingMessage(messages[index]);
    }, 5000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleMaterialClick = (source: MaterialSource) => {
    setMaterialSource(source);

    if (source && source !== "text") {
      // Dynamically set allowed file types
      const acceptTypes: Record<"pdf" | "pptx" | "docx", string> = {
        pdf: ".pdf",
        pptx: ".ppt,.pptx",
        docx: ".doc,.docx",
      };

      if (fileInputRef.current) {
        fileInputRef.current.accept = acceptTypes[source] || "";
        fileInputRef.current.value = ""; // Reset previous file
        fileInputRef.current.click();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleSubmit(selectedFile); // Auto-submit for files
    }
  };

  const showPopup = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setPopup({ message, type });
    setTimeout(() => setPopup(null), 4000); // Fade after 4s
  };

  const handleSubmit = async (uploadedFile?: File) => {
    if (!contentType || !materialSource) {
      showPopup("Please select a content type and material source.", "error");
      return;
    }
    if (materialSource === "text" && !textInput.trim()) {
      showPopup("Please enter some text.", "error");
      return;
    }
    if (materialSource !== "text" && !uploadedFile && !file) {
      showPopup("Please upload a file.", "error");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("contentType", contentType);
      formData.append("materialSource", materialSource);
      formData.append(
        "userId",
        typeof user === "object" && user !== null && "id" in user
          ? String(user.id)
          : ""
      );

      if (materialSource === "text") {
        formData.append("text", textInput);
      } else {
        formData.append("file", uploadedFile || file!);
      }

      const res = await fetch(
        "https://eoffiddgxjiwiyihczed.functions.supabase.co/generate-content",
        { method: "POST", body: formData }
      );

      let data: any;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        throw new Error(
          `Invalid JSON response from server. Status: ${res.status}, Response: ${text}`
        );
      }

      if (!res.ok) {
        throw new Error(
          `Request failed: ${res.status} - ${JSON.stringify(data)}`
        );
      }

      showPopup("Material processed successfully!", "success");

      setFile(null);
      setTextInput("");
      setMaterialSource(null);
      setContentType(null);
    } catch (err: any) {
      console.error("❌ Error submitting material:", err);
      showPopup(`Something went wrong: ${err.message ?? err}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20 relative">
      {/* Popup notification */}
      {popup && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white transition-opacity duration-500 ${
            popup.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {popup.message}
        </div>
      )}

      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Material</h1>
      </header>

      <div className="bg-white rounded-lg shadow p-6 mb-6 relative">
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-40">
            <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin mb-3"></div>
            <div className="text-gray-700 font-medium">{loadingMessage}</div>
          </div>
        )}

        {/* Step 1: Select content type */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          1. Select Content Type
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {(["flashcards", "quiz", "summary"] as ContentType[]).map((type) => (
            <button
              key={type}
              className={`flex flex-col items-center justify-center p-4 border rounded-lg ${
                contentType === type
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
              onClick={() => setContentType(type)}
            >
              {type === "flashcards" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M7 7h10" />
                  <path d="M7 12h10" />
                  <path d="M7 17h10" />
                </svg>
              )}
              {type === "quiz" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              )}
              {type === "summary" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <line x1="8" x2="16" y1="8" y2="8" />
                  <line x1="8" x2="16" y1="12" y2="12" />
                  <line x1="8" x2="12" y1="16" y2="16" />
                </svg>
              )}
              <span className="text-sm capitalize">{type}</span>
            </button>
          ))}
        </div>

        {/* Step 2: Material Source */}
        {contentType && (
          <>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              2. Choose your material
            </h2>
            <div className="space-y-3">
              {["pdf", "pptx", "docx", "text"].map((source) => (
                <button
                  key={source}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => handleMaterialClick(source as MaterialSource)}
                >
                  <div className="flex items-center">
                    {source === "text" ? (
                      <TextIcon className="mr-3 text-gray-500" />
                    ) : (
                      <FileIcon
                        className={`mr-3 ${
                          source === "pdf"
                            ? "text-red-500"
                            : source === "pptx"
                            ? "text-orange-500"
                            : "text-blue-500"
                        }`}
                      />
                    )}
                    <div className="text-left">
                      <p className="font-medium text-gray-900">
                        Upload {source.toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {source === "text"
                          ? "Paste your text or link"
                          : `Select a ${source.toUpperCase()} file from your device`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Text input */}
            {materialSource === "text" && (
              <div className="mt-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your text or link here..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  rows={4}
                />
              </div>
            )}

            {/* Submit button only for text */}
            {materialSource === "text" && (
              <div className="mt-6">
                <button
                  onClick={() => handleSubmit()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Loader spinner styles */}
      <style>
        {`
          .loader {
            border-width: 4px;
            border-top-color: transparent;
          }
        `}
      </style>
    </div>
  );
}
