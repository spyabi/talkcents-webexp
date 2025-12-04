"use client";

// Simple helpers to persist experiment data across routes using sessionStorage.

const STORAGE_KEYS = {
  participantId: "experiment_participant_id",
  task1TaskId: "experiment_task1_task_id",
  task2TaskId: "experiment_task2_task_id",
  task3TaskId: "experiment_task3_task_id",
  task1DurationMs: "experiment_task1_duration_ms",
  task2DurationMs: "experiment_task2_duration_ms",
  task3DurationMs: "experiment_task3_duration_ms",
  task3EntriesCount: "experiment_task3_entries_count",
  task3Entries: "experiment_task3_entries",
} as const;

// Type for Task 3 manual entry
export type Task3Entry = {
  id: string;
  name: string;
  amount: string;
  date: string;
  category: string;
  note: string;
  type: "Income" | "Expense";
};

export function setParticipantId(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.participantId, id);
}

export function getParticipantId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEYS.participantId);
}

export function setTask1TaskId(taskId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task1TaskId, taskId);
}

export function getTask1TaskId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEYS.task1TaskId);
}

export function setTask2TaskId(taskId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task2TaskId, taskId);
}

export function getTask2TaskId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEYS.task2TaskId);
}

export function setTask3TaskId(taskId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task3TaskId, taskId);
}

export function getTask3TaskId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEYS.task3TaskId);
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

export function setTask3DurationMs(ms: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task3DurationMs, String(ms));
}

export function getTask3DurationMs(): number | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEYS.task3DurationMs);
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function setTask3EntriesCount(count: number) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task3EntriesCount, String(count));
}

export function getTask3EntriesCount(): number {
  if (typeof window === "undefined") return 0;
  const value = window.sessionStorage.getItem(STORAGE_KEYS.task3EntriesCount);
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

export function setTask3Entries(entries: Task3Entry[]) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEYS.task3Entries, JSON.stringify(entries));
}

export function getTask3Entries(): Task3Entry[] {
  if (typeof window === "undefined") return [];
  const value = window.sessionStorage.getItem(STORAGE_KEYS.task3Entries);
  if (!value) return [];
  try {
    return JSON.parse(value) as Task3Entry[];
  } catch {
    return [];
  }
}

export function addTask3Entry(entry: Task3Entry) {
  const entries = getTask3Entries();
  entries.push(entry);
  setTask3Entries(entries);
  setTask3EntriesCount(entries.length);
}

export function clearTask3Entries() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEYS.task3Entries);
  window.sessionStorage.removeItem(STORAGE_KEYS.task3EntriesCount);
}

export function clearExperimentData() {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    window.sessionStorage.removeItem(key);
  });
}
