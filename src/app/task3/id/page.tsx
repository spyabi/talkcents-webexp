"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setParticipantId, setTask3TaskId, clearTask3Entries } from "../../_lib/experimentStorage";
import { createTask } from "../../_lib/webexpApi";
import { useDeviceType } from "../../_lib/useDeviceAndMic";

export default function Task3IdPage() {
  const router = useRouter();
  const deviceType = useDeviceType();
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasReadInstructions, setHasReadInstructions] = useState(false);

  const handleSubmit = async () => {
    const trimmed = inputId.trim();
    if (!trimmed) {
      setError("Please enter your participant ID.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create task in backend (task_number = 3 for manual entry)
      // Pass device_type: "mobile" or "desktop"
      const taskResponse = await createTask(trimmed, 3, deviceType === "mobile" ? "mobile" : "desktop");
      setParticipantId(trimmed);
      // Store the task_id for later use
      if (taskResponse.task_id) {
        setTask3TaskId(taskResponse.task_id);
      }
      // Clear any previous entries when starting a new task
      clearTask3Entries();
      router.push("/task3/entry");
    } catch (err) {
      console.error("Failed to create task:", err);
      setError("Failed to register. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 3: Manual Entry</p>
      </header>

      <section className="flex-1 space-y-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Enter your Participant ID</h2>
          <input
            type="text"
            value={inputId}
            onChange={(e) => {
              setInputId(e.target.value);
              setError(null);
            }}
            placeholder="e.g. P001"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-blue-500"
            style={{ fontSize: "16px" }}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="rounded-md bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">Task Instructions</h3>
          <div className="mt-2 space-y-2 text-sm text-blue-800">
            <p>
              In this task, you will <span className="font-medium">manually enter expenses</span> using a form interface to log your daily expenses.
            </p>
            <p className="font-medium">Scenario: you just got back home from dinner and need to log your expenses.</p>
            <p>You need to log the following expenses:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Steak dinner $60</li>
              <li>Ice cream $5.50</li>
              <li>Taxi $18.90</li>
            </ul>
            <p>For each expense, you will need to provide:</p>
            <p className="font-medium">
              You need to log your expenses as fast as possible and you will be timed for this. You must add exactly 3 entries to complete this task.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="instructions-checkbox-3"
            checked={hasReadInstructions}
            onChange={(e) => setHasReadInstructions(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="instructions-checkbox-3" className="text-sm text-zinc-700 cursor-pointer">
            I have read the instructions and know that this is a timed experiment
          </label>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!inputId.trim() || !hasReadInstructions || isLoading}
          className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200 disabled:cursor-not-allowed"
        >
          {isLoading ? "Registering..." : "Continue to Task"}
        </button>
      </section>
    </main>
  );
}

