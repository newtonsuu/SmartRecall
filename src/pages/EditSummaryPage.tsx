import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function EditSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("summaries")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setContent(data.content_markdown);
        const plainText = data.content_markdown
          .replace(/[#_*~`>[\]()-]/g, " ") // same regex as backend
          .replace(/\n/g, " ") // replace newlines with space
          .replace(/\s+/g, " ") // collapse multiple spaces
          .trim();

        const wordCount = plainText ? plainText.split(" ").length : 0;
        setWordCount(wordCount);
      }
      setLoading(false);
    };

    fetchSummary();
  }, [id]);

  useEffect(() => {
    const plainText = content
      .replace(/[#_*>\-[\]()~`]/g, "") // remove markdown symbols
      .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
      .replace(/\[.*?\]\(.*?\)/g, "") // remove links
      .replace(/`{1,3}[^`]*`{1,3}/g, "") // remove inline code
      .replace(/\n+/g, " "); // replace newlines with space

    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    setWordCount(wordCount);
  }, [content]);

  const handleSave = async () => {
    await supabase
      .from("summaries")
      .update({
        title,
        content_markdown: content,
        word_count: wordCount,
        last_updated: new Date(),
      })
      .eq("id", id);

    navigate("/study");
  };

  if (loading) return <p className="text-center mt-8">Loading summary...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/study" className="mr-4">
            <ArrowLeftIcon size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Summary</h1>
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
          Summary Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter summary title"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content
        </label>
        <p className="text-xs text-gray-500 mb-2">
          You can use Markdown formatting: # for headings, ** for bold, - for
          lists
        </p>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          rows={20}
          placeholder="Enter your summary content here..."
        />
        <div className="mt-4 text-sm text-gray-500">
          Word count: {wordCount} words
        </div>
      </div>
    </div>
  );
}
