"use client";

import { useRouter } from "next/navigation";
import { useMicPermission } from "../_lib/useDeviceAndMic";

export default function WaitingPage() {
  const router = useRouter();
  const { status: micStatus, request: requestMic } = useMicPermission();

  const canStartTask2 = micStatus === "granted";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Step 3 of 5 · Waiting</p>
      </header>

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Get ready for Task 2</h2>
          <p className="text-sm text-zinc-700">
            Thank you for completing Task 1. In Task 2, you will interact with a
            chatbot using your <span className="font-medium">voice</span>.
          </p>
          <p className="text-sm text-zinc-700">
            Make sure you are in a reasonably quiet place and that your
            microphone is working.
          </p>

          <div className="mt-2 rounded-md bg-zinc-50 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Microphone status
            </h3>
            <p className="mt-1 text-sm">
              Status:{" "}
              <span className="font-medium">
                {micStatus === "prompt"
                  ? "Not requested yet"
                  : micStatus === "granted"
                  ? "Granted"
                  : "Denied or unavailable"}
              </span>
            </p>
            <button
              type="button"
              onClick={requestMic}
              className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
            >
              Re-check microphone
            </button>
            {micStatus === "denied" && (
              <p className="mt-1 text-xs text-red-600">
                We still cannot access your microphone. Please check your
                browser or system settings and enable microphone access for this
                site.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canStartTask2}
          onClick={() => router.push("/task2")}
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200"
        >
          Start Task 2
        </button>
        {!canStartTask2 && (
          <p className="mt-1 text-center text-xs text-zinc-500">
            You need to grant microphone access before starting Task 2.
          </p>
        )}
      </div>
    </main>
  );
}


