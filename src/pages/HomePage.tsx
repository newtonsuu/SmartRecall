import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  CartesianGrid,
} from "recharts";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useAuth } from "../auth/AuthProvider";

dayjs.extend(relativeTime);

type RecentActivity = {
  id: number;
  type: "flashcard" | "quiz";
  title: string;
  last_accessed: string;
  next_session: string;
};

type ScorePoint = {
  date: string; // e.g. "2025-10-21"
  score: number;
  dateLabel: string;
  color: string;
};

export function HomePage() {
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [recommendation, setRecommendation] = useState<{
    retake_in_days?: number;
    recommendation?: string;
  } | null>(null);
  const [progressData, setProgressData] = useState<ScorePoint[]>([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState<string | null>(null);
  const { profile } = useAuth();
  const lastActive = dayjs(profile?.last_active_date);
  const today = dayjs();

  const streakBroken =
    !lastActive.isSame(today, "day") &&
    !lastActive.isSame(today.subtract(1, "day"), "day");

  useEffect(() => {
    async function fetchRecentActivities() {
      const { data, error } = await supabase.rpc("get_recent_activity");
      if (error) console.error(error);
      else setRecentActivities(data);
    }
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    async function fetchProgressData() {
      const oneWeekAgo = dayjs()
        .subtract(6, "day")
        .startOf("day")
        .toISOString();

      // Fetch quizzes
      const { data: quizData, error: quizError } = await supabase
        .from("quiz_attempts")
        .select("percentage, completed_at")
        .gte("completed_at", oneWeekAgo)
        .order("completed_at", { ascending: true });

      // Fetch flashcards
      const { data: flashData, error: flashError } = await supabase
        .from("flashcard_sessions")
        .select("score, completed_at")
        .gte("completed_at", oneWeekAgo)
        .order("completed_at", { ascending: true });

      if (quizError || flashError) {
        console.error(quizError || flashError);
        return;
      }

      // Combine and retain type
      const allData = [
        ...(quizData?.map((q) => ({
          type: "quiz",
          score: Number(q.percentage),
          date: dayjs(q.completed_at).startOf("day").format("YYYY-MM-DD"),
        })) || []),
        ...(flashData?.map((f) => ({
          type: "flashcard",
          score: Number(f.score),
          date: dayjs(f.completed_at).startOf("day").format("YYYY-MM-DD"),
        })) || []),
      ];

      // Filter only real data points and assign color
      const merged = [...allData]
        .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
        .map((p) => ({
          date: p.date,
          score: p.score,
          Date: dayjs(p.date).format("MMM D"),
          color: getScoreColor(p.score),
        }));

      console.log("Merged progress data:", merged);

      setProgressData(merged);
    }

    function getScoreColor(score: number): string {
      if (score >= 80) return "#22c55e"; // green
      if (score >= 60) return "#facc15"; // yellow
      if (score >= 40) return "#f97316"; // orange
      return "#ef4444"; // red
    }

    fetchProgressData();
  }, []);

  async function fetchRecommendation() {
    if (!profile?.id) return;
    setRecoLoading(true);
    setRecoError(null);
    try {
      // Use the Functions subdomain which doesn't require adding anon keys manually
      // The REST-style endpoint (/functions/v1) may require an API key and return 401 from the platform.
      const FUNCTION_URL =
        "https://eoffiddgxjiwiyihczed.functions.supabase.co/recommendations";
      const start = Date.now();
      const payload = { userId: profile.id };
      console.log("[HomePage] -> fetchRecommendation START", {
        ts: new Date().toISOString(),
        url: FUNCTION_URL,
        userId: profile.id,
        payload,
      });
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ userId: profile.id }),
      });
      const duration = Date.now() - start;
      console.log("[HomePage] <- fetchRecommendation response headers", {
        status: res.status,
        ok: res.ok,
        contentType: res.headers.get("content-type") || null,
        durationMs: duration,
      });
      // Mirror AIAssistantPage: read text then parse JSON to handle functions that return plain text
      const text = await res.text();
      if (!text) throw new Error(`Empty response (status ${res.status})`);
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {
        console.warn("[HomePage] response not valid JSON, using raw text");
        data = { message: text };
      }
      if (!res.ok) {
        const errMsg = data.error || data.message || `HTTP ${res.status}`;
        throw new Error(errMsg);
      }
      console.log("[HomePage] <- fetchRecommendation parsed response", {
        recommendation: data.recommendation ?? null,
        source: data.source ?? null,
      });
      setRecommendation(data.recommendation ?? data.message ?? null);
    } catch (err) {
      const e: any = err;
      console.error(
        "Failed to fetch recommendation:",
        e?.message ?? e,
        e?.stack ?? null
      );
      setRecoError(e?.message ?? String(e));
    } finally {
      setRecoLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.id) fetchRecommendation();
  }, [profile?.id]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-20">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SmartRecall</h1>
      </header>

      {/* Activity History */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Activity History
        </h2>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <p className="text-gray-500 text-center">
              No recent activities yet.
            </p>
          ) : (
            recentActivities.map((activity) => {
              const locked =
                Boolean(activity.next_session) &&
                dayjs(activity.next_session).isAfter(dayjs());
              return (
                <Link
                  to={`/${activity.type}/${activity.id}`}
                  key={activity.id}
                  className={`block ${
                    locked ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      alert(
                        "You can’t access that right now. Try again later."
                      );
                    }
                  }}
                  aria-disabled={locked}
                  title={
                    locked ? "Locked until the next session time" : undefined
                  }
                >
                  {/* ...existing card markup... */}
                  <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">
                            {dayjs(activity.last_accessed).fromNow()}
                          </p>
                          <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Next session:{" "}
                            {activity.next_session
                              ? dayjs(activity.next_session).fromNow()
                              : "Now"}
                          </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activity.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* Progress Overview */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Progress Overview
        </h2>
        <div className="bg-white rounded-lg shadow p-4 h-52 flex items-center justify-center">
          {progressData.length === 0 ? (
            <div className="text-center text-lg py-6">
              No data yet — start completing quizzes or flashcards to see your
              progress 📊
            </div>
          ) : (
            <ResponsiveContainer width="100%" minHeight={200}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="Date"
                  type="category"
                  tick={{ fontSize: 12 }}
                  axisLine={true}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Scatter
                  name="Performance"
                  data={progressData}
                  dataKey="score"
                  shape={(props: {
                    cx?: number;
                    cy?: number;
                    payload?: { color?: string };
                  }) => {
                    const { cx = 0, cy = 0, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={payload?.color || "#9ca3af"}
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            AI Recommendation
          </h2>
          <button
            onClick={() => fetchRecommendation()}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            aria-label="Refresh recommendation"
            disabled={recoLoading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
              {recoLoading
                ? "Retake: ..."
                : recommendation?.retake_in_days
                ? `Retake: ${recommendation.retake_in_days}d`
                : "Retake: N/A"}
            </div>
          </div>
          <p className="text-gray-600">
            {recoLoading
              ? "Generating personalized recommendation..."
              : recommendation?.recommendation ??
                "Based on your learning patterns, we will show personalized suggestions here."}
          </p>
          {recoError && (
            <p className="mt-2 text-sm text-red-600">Error: {recoError}</p>
          )}
        </div>
      </section>

      {/* Streak Tracker */}
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
            <p className="text-gray-800 font-medium">
              {streakBroken
                ? `0 days completed 🔥`
                : `${profile?.current_streak} ${
                    profile?.current_streak === 1 ? "day" : "days"
                  } completed 🔥`}
            </p>
          </div>
          <div className="mt-4 flex">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div key={day} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    day <= (profile?.current_streak ?? 0) && !streakBroken
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
