"use client";

import { useEffect, useState } from "react";
import { getTask2DurationMs, getParticipantId } from "../../_lib/experimentStorage";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default function Task2EndPage() {
  const [duration, setDuration] = useState<number | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [completionCode, setCompletionCode] = useState<string>("");

  useEffect(() => {
    setDuration(getTask2DurationMs());
    const id = getParticipantId();
    setParticipantId(id);
    // Generate a simple completion code
    const code = `T2-${id || "XXX"}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setCompletionCode(code);
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 2: Voice Chatbot - Complete</p>
      </header>

      <section className="flex-1 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 text-emerald-600"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-emerald-600">Thank You!</h2>
          <p className="text-zinc-600">
            You have successfully completed the voice chatbot task.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700">Task Summary</h3>
          
          {participantId && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Participant ID</span>
              <span className="font-medium">{participantId}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-zinc-500">Time taken</span>
            <span className="font-medium">
              {duration != null ? formatDuration(duration) : "—"}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50 p-4 text-center">
          <p className="text-xs text-emerald-700 mb-2">Your Completion Code</p>
          <p className="text-xl font-mono font-bold text-emerald-800 tracking-wide">
            {completionCode}
          </p>
          <p className="text-xs text-emerald-600 mt-2">
            Please save this code and provide it to the researcher.
          </p>
        </div>

        <div className="text-center text-sm text-zinc-500">
          <p>You may now close this window.</p>
        </div>
      </section>
    </main>
  );
}

