"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getParticipantId,
  setTask3DurationMs,
  addTask3Entry,
  getTask3Entries,
  clearTask3Entries,
  type Task3Entry,
} from "../../_lib/experimentStorage";

const FIXED_CATEGORIES = ["Food & Drinks", "Shopping", "Transport", "Others"];
const REQUIRED_ENTRIES = 3;

export default function Task3EntryPage() {
  const router = useRouter();
  const [participantId, setParticipantIdState] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [entries, setEntries] = useState<Task3Entry[]>([]);

  // Form state
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentEntryCount, setCurrentEntryCount] = useState(0);

  const [errors, setErrors] = useState({
    name: false,
    date: false,
    amount: false,
    category: false,
  });

  useEffect(() => {
    const id = getParticipantId();
    setParticipantIdState(id);
    // Load existing entries from storage
    const storedEntries = getTask3Entries();
    setEntries(storedEntries);
    setCurrentEntryCount(storedEntries.length);
    if (typeof performance !== "undefined") {
      setStartTime(performance.now());
    }
  }, []);

  const validateFields = () => {
    const newErrors = {
      name: name.trim() === "",
      date: date.trim() === "",
      amount: amount.trim() === "" || amount === "0" || amount === "0.00",
      category: category === null,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const resetForm = () => {
    setType("Expense");
    setName("");
    setAmount("");
    setDate("");
    setCategory(null);
    setNote("");
    setErrors({ name: false, date: false, amount: false, category: false });
  };

  const handleAdd = () => {
    if (!validateFields()) return;

    const newEntry: Task3Entry = {
      id: Date.now().toString(),
      name,
      amount: amount.replace("$", ""),
      date,
      category: category || "",
      note,
      type,
    };

    // Store entry in sessionStorage for submission at the end
    addTask3Entry(newEntry);
    
    // Update entries - count is automatically derived from entries.length
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    // Track the current entry count for the success modal
    setCurrentEntryCount(updatedEntries.length);
    setShowSuccess(true);
  };

  const handleSuccessDone = () => {
    setShowSuccess(false);
    resetForm();

    // Check completion based on the current entry count we tracked
    if (currentEntryCount >= REQUIRED_ENTRIES) {
      // Task complete
      if (typeof performance !== "undefined" && startTime != null) {
        const end = performance.now();
        setTask3DurationMs(end - startTime);
      }
      router.push("/task3/questions");
    }
  };

  // Calculate remaining entries based on current entries array
  const remainingEntries = REQUIRED_ENTRIES - entries.length;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white text-sm text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-4 border-b border-zinc-100">
        <h1 className="text-xl font-semibold text-center">Manual Entry</h1>
        <p className="mt-1 text-xs text-zinc-500 text-center">
          Entries added: {entries.length} / {REQUIRED_ENTRIES}
        </p>
        {remainingEntries > 0 && (
          <p className="mt-1 text-xs text-amber-600 text-center font-medium">
            {remainingEntries} more {remainingEntries === 1 ? "entry" : "entries"} required
          </p>
        )}
      </header>

      {/* Form */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Type Toggle */}
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setType("Income")}
            className={`px-5 py-2 rounded-xl border text-sm font-medium transition ${
              type === "Income"
                ? "bg-[#BAE7EC] border-[#BAE7EC]"
                : "border-zinc-300"
            }`}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => setType("Expense")}
            className={`px-5 py-2 rounded-xl border text-sm font-medium transition ${
              type === "Expense"
                ? "bg-[#BAE7EC] border-[#BAE7EC]"
                : "border-zinc-300"
            }`}
          >
            Expense
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Name <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className={`w-full rounded-lg border px-3 py-3 text-base outline-none ${
              errors.name ? "border-red-500" : "border-zinc-300"
            } focus:border-blue-500`}
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Date <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={`w-full rounded-lg border px-3 py-3 text-base outline-none ${
              errors.date ? "border-red-500" : "border-zinc-300"
            } focus:border-blue-500`}
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Amount <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9.]/g, "");
              setAmount(cleaned);
            }}
            onBlur={() => {
              if (!amount) return;
              const num = Number(amount);
              if (!isNaN(num)) {
                setAmount(`$${num.toFixed(2)}`);
              }
            }}
            placeholder="$0.00"
            className={`w-full rounded-lg border px-3 py-3 text-base outline-none ${
              errors.amount ? "border-red-500" : "border-zinc-300"
            } focus:border-blue-500`}
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1">
            Category <span className="text-red-500 ml-1">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowCategoryPicker(true)}
            className={`w-full rounded-lg border px-3 py-3 text-left flex justify-between items-center ${
              errors.category ? "border-red-500" : "border-zinc-300"
            }`}
          >
            <span className={category ? "text-zinc-900" : "text-zinc-400"}>
              {category || "Select category"}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4 text-zinc-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Note */}
        <div>
          <label className="text-sm font-medium mb-1 block">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-3 text-base outline-none focus:border-blue-500 resize-none"
            style={{ fontSize: "16px" }}
          />
        </div>

        {/* Add Button */}
        <button
          type="button"
          onClick={handleAdd}
          className="w-full bg-[#BAE7EC] text-zinc-900 font-semibold py-3 rounded-xl text-base"
        >
          Add Entry
        </button>

        {/* Added Entries List */}
        {entries.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-700">Added Entries</h3>
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="rounded-lg border border-zinc-200 p-3 bg-zinc-50"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{entry.name}</p>
                    <p className="text-xs text-zinc-500">{entry.category} · {entry.date}</p>
                  </div>
                  <p className={`font-semibold ${entry.type === "Income" ? "text-emerald-600" : "text-zinc-900"}`}>
                    {entry.type === "Income" ? "+" : "-"}${entry.amount}
                  </p>
                </div>
                {entry.note && (
                  <p className="mt-1 text-xs text-zinc-500">{entry.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/25">
          <div className="w-full max-w-md bg-white rounded-t-2xl pb-8 animate-slide-up">
            <div className="px-4 pt-4">
              {FIXED_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                  className="w-full flex justify-between items-center py-4 border-b border-zinc-100"
                >
                  <span className="text-base">{cat}</span>
                  {category === cat && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="#BAE7EC"
                      className="w-5 h-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowCategoryPicker(false)}
              className="mt-4 mx-auto block text-red-500 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
          <div className="w-4/5 max-w-sm bg-white rounded-2xl p-6 text-center shadow-xl">
            <p className="text-lg font-semibold text-zinc-900">
              {type === "Expense" ? "Expense" : "Income"} Logged Successfully!
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Entry {currentEntryCount} of {REQUIRED_ENTRIES} added.
            </p>
            <button
              type="button"
              onClick={handleSuccessDone}
              className="mt-5 bg-[#BAE7EC] text-zinc-900 font-semibold py-2 px-6 rounded-xl"
            >
              {currentEntryCount >= REQUIRED_ENTRIES ? "Finish Task" : "Add Next Entry"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

