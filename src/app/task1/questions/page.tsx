"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  getTask1DurationMs,
  getParticipantId,
  getTask1TaskId,
} from "../../_lib/experimentStorage";
import { updateTaskTime, updateTaskQuestions } from "../../_lib/webexpApi";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

// Star rating component for Likert scale (1-4)
function StarRating({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          className={`text-3xl transition ${
            star <= value
              ? "text-yellow-400"
              : "text-zinc-300"
          } ${disabled ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function Task1QuestionsPage() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [question1, setQuestion1] = useState<number>(0);
  const [question2, setQuestion2] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const id = getParticipantId();
    const tId = getTask1TaskId();
    const durationMs = getTask1DurationMs();
    
    setParticipantId(id);
    setTaskId(tId);
    setDuration(durationMs);
  }, []);

  const handleFinish = async () => {
    if (question1 === 0 || question2 === 0) {
      alert("Please answer both questions before finishing.");
      return;
    }

    if (!taskId || !participantId || duration == null) {
      alert("Missing required data. Please try again.");
      return;
    }

    if (hasSubmitted.current) return;
    hasSubmitted.current = true;
    setIsSubmitting(true);

    try {
      const timeSeconds = Math.round(duration / 1000);
      
      // Submit timing data
      await updateTaskTime(taskId, participantId, 1, timeSeconds);
      
      // Submit questions
      await updateTaskQuestions(taskId, participantId, 1, question1, question2);
      
      router.push("/task1/end");
    } catch (err) {
      console.error("Failed to submit data:", err);
      alert("Failed to submit your responses. Please try again.");
      hasSubmitted.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 1: Typing Chatbot - Questions</p>
      </header>

      <section className="flex-1 space-y-6">
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

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-base font-semibold">1. Satisfaction</h2>
            <p className="text-sm text-zinc-600">How satisfied were you with this method?</p>
            <StarRating
              value={question1}
              onChange={setQuestion1}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-semibold">2. Adoption</h2>
            <p className="text-sm text-zinc-600">Would you use this method in real life?</p>
            <StarRating
              value={question2}
              onChange={setQuestion2}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          disabled={question1 === 0 || question2 === 0 || isSubmitting}
          className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Finish"}
        </button>
      </section>
    </main>
  );
}

