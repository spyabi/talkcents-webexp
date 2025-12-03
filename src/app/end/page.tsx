"use client";

import {
  getTask1DurationMs,
  getTask2DurationMs,
} from "../_lib/experimentStorage";

export default function EndPage() {
  const task1Ms =
    typeof window !== "undefined" ? getTask1DurationMs() : null;
  const task2Ms =
    typeof window !== "undefined" ? getTask2DurationMs() : null;

  const task1Seconds =
    task1Ms != null ? Math.round(task1Ms / 1000) : null;
  const task2Seconds =
    task2Ms != null ? Math.round(task2Ms / 1000) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Step 5 of 5 · Finished</p>
      </header>

      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">All done – thank you!</h2>
          <p className="text-sm text-zinc-700">
            You have completed both tasks. Your responses and timings have been
            recorded for the study.
          </p>

          <div className="mt-2 rounded-md bg-zinc-50 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Task timings
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-zinc-700">
              <li>
                Task 1 (typing):{" "}
                <span className="font-medium">
                  {task1Seconds != null ? `${task1Seconds} seconds` : "n/a"}
                </span>
              </li>
              <li>
                Task 2 (voice):{" "}
                <span className="font-medium">
                  {task2Seconds != null ? `${task2Seconds} seconds` : "n/a"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500">
          You may now close this page. If you have any questions about the
          study, please contact the researcher.
        </p>
      </div>
    </main>
  );
}


