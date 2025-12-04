"use client";

import { useRouter } from "next/navigation";
import { useDeviceType, useBackendConnection, DeviceType, BackendStatus } from "../_lib/useDeviceAndMic";

export default function Task3Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <MainScreen />
    </div>
  );
}

function MainScreen() {
  const deviceType = useDeviceType();
  const { status: backendStatus, error: backendError, check: checkBackend } = useBackendConnection();
  const router = useRouter();

  const isMobileBlocked = deviceType === "desktop";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Task 3: Manual Entry
        </p>
      </header>

      <section className="flex-1">
        <StartScreen
          deviceType={deviceType}
          backendStatus={backendStatus}
          backendError={backendError}
          onBackendCheck={checkBackend}
          onStart={() => router.push("/task3/id")}
        />
      </section>

      {isMobileBlocked && (
        <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          This experiment is designed for mobile devices. Please open this page
          on your phone to participate.
        </div>
      )}
    </main>
  );
}

interface StartScreenProps {
  deviceType: DeviceType;
  backendStatus: BackendStatus;
  backendError: string | null;
  onBackendCheck: () => void;
  onStart: () => void;
}

function StartScreen({
  deviceType,
  backendStatus,
  backendError,
  onBackendCheck,
  onStart,
}: StartScreenProps) {
  const isMobile = deviceType === "mobile";
  const canStart = isMobile && backendStatus === "connected";

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Welcome</h2>
        <p className="text-sm text-zinc-700">
          In this experiment, you will complete a{" "}
          <span className="font-medium">manual expense entry task</span>.
        </p>
        <p className="text-sm text-zinc-700">
          You will be asked to add <span className="font-medium">3 expense entries</span> manually
          using a form interface.
        </p>
        <p className="text-sm text-zinc-700">
          The experiment is{" "}
          <span className="font-medium">mobile-only</span>.
        </p>

        <div className="mt-4 rounded-md bg-zinc-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Device check
          </h3>
          <p className="mt-1 text-sm">
            Detected device:{" "}
            <span className="font-medium">
              {deviceType === "unknown"
                ? "Checking..."
                : deviceType === "mobile"
                ? "Mobile ✓"
                : "Desktop ✗"}
            </span>
          </p>
        </div>

        <div className="mt-2 rounded-md bg-zinc-50 p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Backend connection
          </h3>
          <p className="mt-1 text-sm">
            Status:{" "}
            <span className={`font-medium ${
              backendStatus === "connected" 
                ? "text-emerald-600" 
                : backendStatus === "disconnected" 
                ? "text-red-600" 
                : ""
            }`}>
              {backendStatus === "unknown"
                ? "Not checked yet"
                : backendStatus === "checking"
                ? "Checking..."
                : backendStatus === "connected"
                ? "Connected ✓"
                : "Disconnected ✗"}
            </span>
          </p>
          <button
            type="button"
            onClick={onBackendCheck}
            disabled={backendStatus === "checking"}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:bg-zinc-300"
          >
            {backendStatus === "checking" ? "Checking..." : "Check backend connection"}
          </button>
          {backendStatus === "disconnected" && backendError && (
            <p className="mt-1 text-xs text-red-600">
              {backendError}. Please ensure the backend server is running and accessible.
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        disabled={!canStart}
        onClick={onStart}
        className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:bg-emerald-200"
      >
        Start experiment
      </button>
      {!canStart && (
        <p className="mt-1 text-center text-xs text-zinc-500">
          To start, use a mobile device and ensure backend is connected.
        </p>
      )}
    </div>
  );
}

