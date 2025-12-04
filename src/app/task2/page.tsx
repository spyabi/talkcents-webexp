"use client";

import { useRouter } from "next/navigation";
import { useDeviceType, useMicPermission, useBackendConnection, DeviceType, MicStatus, BackendStatus } from "../_lib/useDeviceAndMic";

export default function Task2Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">
      <MainScreen />
    </div>
  );
}

function MainScreen() {
  const deviceType = useDeviceType();
  const { status: micStatus, request: requestMic } = useMicPermission();
  const { status: backendStatus, error: backendError, check: checkBackend } = useBackendConnection();
  const router = useRouter();

  const isMobileBlocked = deviceType === "desktop";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Task 2: Voice Chatbot
        </p>
      </header>

      <section className="flex-1">
        <StartScreen
          deviceType={deviceType}
          micStatus={micStatus}
          backendStatus={backendStatus}
          backendError={backendError}
          onMicRequest={requestMic}
          onBackendCheck={checkBackend}
          onStart={() => router.push("/task2/id")}
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
  micStatus: MicStatus;
  backendStatus: BackendStatus;
  backendError: string | null;
  onMicRequest: () => void;
  onBackendCheck: () => void;
  onStart: () => void;
}

function StartScreen({
  deviceType,
  micStatus,
  backendStatus,
  backendError,
  onMicRequest,
  onBackendCheck,
  onStart,
}: StartScreenProps) {
  const isMobile = deviceType === "mobile";
  const canStart = isMobile && micStatus === "granted" && backendStatus === "connected";

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Welcome</h2>
        <p className="text-sm text-zinc-700">
          In this experiment, you will complete a{" "}
          <span className="font-medium">voice chatbot task</span>.
        </p>
        <p className="text-sm text-zinc-700">
          You will talk to an AI assistant using your <span className="font-medium">voice</span> to
          log your expenses.
        </p>
        <p className="text-sm text-zinc-700">
          The experiment is{" "}
          <span className="font-medium">mobile-only</span> and requires access
          to your microphone.
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
            Microphone
          </h3>
          <p className="mt-1 text-sm">
            Status:{" "}
            <span className={`font-medium ${
              micStatus === "granted" 
                ? "text-emerald-600" 
                : micStatus === "denied" 
                ? "text-red-600" 
                : ""
            }`}>
              {micStatus === "prompt"
                ? "Not requested yet"
                : micStatus === "granted"
                ? "Granted ✓"
                : "Denied or unavailable ✗"}
            </span>
          </p>
          <button
            type="button"
            onClick={onMicRequest}
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-3 py-2 text-xs font-medium text-white disabled:bg-zinc-300"
          >
            Allow microphone
          </button>
          {micStatus === "denied" && (
            <p className="mt-1 text-xs text-red-600">
              We could not access your microphone. Please check your browser
              settings and try again.
            </p>
          )}
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
          To start, use a mobile device, allow microphone access, and ensure backend is connected.
        </p>
      )}
    </div>
  );
}
