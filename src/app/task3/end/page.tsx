"use client";

import { useEffect, useState, useRef } from "react";
import { getTask3DurationMs, getParticipantId, getTask3Entries, getTask3EntriesCount, getTask3TaskId } from "../../_lib/experimentStorage";
import { updateTaskTime, createBulkExpenditures, ExpenditureItem } from "../../_lib/webexpApi";

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export default function Task3EndPage() {
  const [duration, setDuration] = useState<number | null>(null);
  const [participantIdState, setParticipantIdState] = useState<string | null>(null);
  const [completionCode, setCompletionCode] = useState<string>("");
  const [entriesCount, setEntriesCount] = useState<number>(0);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    const durationMs = getTask3DurationMs();
    const id = getParticipantId();
    const taskId = getTask3TaskId();
    const entries = getTask3Entries();
    const count = getTask3EntriesCount();
    
    setDuration(durationMs);
    setParticipantIdState(id);
    setEntriesCount(count);
    
    // Generate completion code
    const code = `T3-${id || "XXX"}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setCompletionCode(code);
    
    // Submit data to backend (only once) - requires task_id, user_id
    if (!hasSubmitted.current && taskId && id && durationMs != null) {
      hasSubmitted.current = true;
      
      const submitData = async () => {
        try {
          // Update task time - pass task_id, user_id, and task_number
          const timeSeconds = Math.round(durationMs / 1000);
          await updateTaskTime(taskId, id, 3, timeSeconds);
          
          // Submit expenditures if any - pass task_id, user_id, and task_number
          if (entries.length > 0) {
            const expenditures: ExpenditureItem[] = entries.map((e) => ({
              name: e.name,
              date_of_expense: e.date, // Already in YYYY-MM-DD format
              amount: parseFloat(e.amount.replace("$", "")),
              category: e.category || undefined,
              notes: e.note || undefined,
              status: "Pending",
            }));
            await createBulkExpenditures(taskId, id, 3, expenditures);
          }
        } catch (err) {
          console.error("Failed to submit task data:", err);
        }
      };
      
      submitData();
    }
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-6 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 3: Manual Entry - Complete</p>
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
            You have successfully completed the manual entry task.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700">Task Summary</h3>
          
          {participantIdState && (
            <div className="flex justify-between">
              <span className="text-zinc-500">Participant ID</span>
              <span className="font-medium">{participantIdState}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-zinc-500">Time taken</span>
            <span className="font-medium">
              {duration != null ? formatDuration(duration) : "—"}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-zinc-500">Entries added</span>
            <span className="font-medium">{entriesCount}</span>
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
