"use client";

// Simple helpers to persist experiment data across routes using sessionStorage.

const STORAGE_KEYS = {
  participantId: "experiment_participant_id",
  task1DurationMs: "experiment_task1_duration_ms",
  task2DurationMs: "experiment_task2_duration_ms",
} as const;

export function setParticipantId(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.participantId, id);
}

export function getParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEYS.participantId);
}

export function setTask1DurationMs(ms: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task1DurationMs, String(ms));
}

export function getTask1DurationMs(): number | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEYS.task1DurationMs);
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function setTask2DurationMs(ms: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task2DurationMs, String(ms));
}

export function getTask2DurationMs(): number | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEYS.task2DurationMs);
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}


