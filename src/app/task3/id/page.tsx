"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setParticipantId } from "../../_lib/experimentStorage";

export default function Task3IdPage() {
  const router = useRouter();
  const [inputId, setInputId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmed = inputId.trim();
    if (!trimmed) {
      setError("Please enter your participant ID.");
      return;
    }

    setParticipantId(trimmed);
    router.push("/task3/entry");
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
              In this task, you will <span className="font-medium">manually enter 3 expenses</span> using
              a form interface.
            </p>
            <p>For each expense, you will need to provide:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Name of the expense</li>
              <li>Date of the expense</li>
              <li>Amount</li>
              <li>Category</li>
              <li>Optional note</li>
            </ul>
            <p className="font-medium">
              You must add exactly 3 entries to complete this task.
            </p>
          </div>
        </div>
      </section>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!inputId.trim()}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200"
      >
        Continue to Task
      </button>
    </main>
  );
}

