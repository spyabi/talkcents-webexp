"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getParticipantId, setParticipantId } from "../_lib/experimentStorage";

export default function IdPage() {
  const router = useRouter();

  const existingId =
    typeof window !== "undefined" ? getParticipantId() ?? "" : "";

  const [id, setId] = useState(existingId);
  const [touched, setTouched] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = id.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid || isCreatingUser) return;

    setIsCreatingUser(true);
    setError(null);

    const trimmed = id.trim();

    try {
      const res = await fetch("/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId: trimmed }),
      });
      if (!res.ok) {
        throw new Error(`Create user failed with status ${res.status}`);
      }
      setParticipantId(trimmed);
      router.push("/task1");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create participant.";
      setError(message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Step 1 of 5 · Participant ID</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Participant ID</h2>
          <p className="text-sm text-zinc-700">
            Please enter the participant ID you were given. This helps us link
            your responses to the study.
          </p>

          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-zinc-700">
              Participant ID
            </span>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onBlur={() => setTouched(true)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g., P1234"
            />
          </label>
          {touched && !isValid && (
            <p className="text-xs text-red-600">Participant ID is required.</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="mt-4 rounded-md bg-zinc-50 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Next: Task 1 (typing)
            </h3>
            <p className="mt-1 text-sm text-zinc-700">
              After you continue, you will chat with a chatbot by{" "}
              <span className="font-medium">typing</span> your responses. When
              you feel done, you will tap a button to move on to Task 2.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isCreatingUser}
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200"
        >
          {isCreatingUser ? "Saving ID..." : "Continue to Task 1"}
        </button>
      </form>
    </main>
  );
}


