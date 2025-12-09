"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getParticipantId,
  setTask2DurationMs,
  getTask2TaskId,
} from "../../_lib/experimentStorage";
import type { Message, Expense, ApiExpense } from "../../_lib/chatTypes";
import { sendChatMessage, transcribeAudio } from "../../_lib/chatbotApi";
import { createBulkExpenditures, ExpenditureItem } from "../../_lib/webexpApi";

export default function Task2ChatPage() {
  const router = useRouter();
  const [participantId, setParticipantIdState] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    const id = getParticipantId();
    setParticipantIdState(id);
    if (typeof performance !== "undefined") {
      setStartTime(performance.now());
    }
  }, []);

  const handleComplete = () => {
    if (typeof performance !== "undefined" && startTime != null) {
      const end = performance.now();
      setTask2DurationMs(end - startTime);
    }
    router.push("/task2/questions");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 2: Voice Chatbot</p>
      </header>

      <Task2VoiceChatbot participantId={participantId} onTaskComplete={handleComplete} />
    </main>
  );
}

interface Task2VoiceChatbotProps {
  participantId: string | null;
  onTaskComplete: () => void;
}

function Task2VoiceChatbot({
  participantId,
  onTaskComplete,
}: Task2VoiceChatbotProps) {
  const taskNumber = 2; // Task 2: Voice chatbot
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState<string>("Tap the microphone to speak.");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: `Hello! 👋 I can help you log your expenses. For example:
Burger $5 yesterday, Coffee $2 today

You can also:
  - Tell me your expenses using your voice 🎤
  - Correct me if I got something wrong (e.g., "No, it was $5, not $10") ✏️

I'll parse everything and ask for your approval before saving!`,
        },
      ],
    },
  ]);
  const [audioUrls, setAudioUrls] = useState<Map<string, string>>(new Map());
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleBotResponse = async (updatedChatHistory: Message[]) => {
    try {
      const botResponse = await sendChatMessage(updatedChatHistory);
      setIsWaiting(false);

      if (botResponse?.response) {
        const newBotMessage: Message = {
          role: "assistant",
          content: [{ type: "text", text: botResponse.response }],
        };
        setMessages((prev) => [...prev, newBotMessage]);
        setChatHistory((prev) => [...prev, newBotMessage]);
      }

      if (botResponse?.expense?.length) {
        const newExpenses: Expense[] = botResponse.expense.map(
          (exp: ApiExpense) => ({
            name: exp.name,
            date_of_expense: exp.date_of_expense,
            amount: exp.price,
            category: exp.category,
            notes: exp.notes || "",
            status: "Approved",
          })
        );
        setExpenses(newExpenses);

        const expenseText = botResponse.expense
          .map((exp, index) => {
            const header = `Expense ${index + 1}\n`;
            const line1 = `${exp.name} --- $${exp.price}\n`;
            const line2 = `${exp.category}\n`;
            const line3 = `${exp.date_of_expense}`;
            return `${header}${line1}${line2}${line3}`;
          })
          .join("\n----------------\n\n");

        const expenseMessage: Message = {
          role: "assistant",
          content: [{ type: "expense", text: expenseText }],
        };
        setMessages((prev) => [...prev, expenseMessage]);
      }
    } catch (err) {
      const newBotError: Message = {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "There was an issue getting your response, please try again.",
          },
        ],
      };
      setIsWaiting(false);
      setMessages((prev) => [...prev, newBotError]);
      console.error("Error sending chat message:", err);
    }
  };

  const handleRecordedAudio = async (audioBlob: Blob) => {
    // Create a URL for the audio blob so it can be played back
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioId = `audio-${Date.now()}`;
    
    // Store the URL for cleanup later
    setAudioUrls((prev) => new Map(prev).set(audioId, audioUrl));

    // Add audio message to UI immediately
    const audioMessage: Message = {
      role: "user",
      content: [{ type: "audio", audioUri: audioId }],
    };
    setMessages((prev) => [...prev, audioMessage]);

    try {
      const transcription = await transcribeAudio(audioBlob);
      const text = transcription.transcription;
      if (!text) return;

      const newMessage: Message = {
        role: "user",
        content: [{ type: "text", text }],
      };

      const updatedChatHistory = [...chatHistory, newMessage];
      setMessages((prev) => [...prev, newMessage]);
      setChatHistory(updatedChatHistory);
      setIsWaiting(true);

      await handleBotResponse(updatedChatHistory);
    } catch (err) {
      const newBotError: Message = {
        role: "assistant",
        content: [
          {
            type: "text",
            text: "There was an issue processing your audio. Please try again.",
          },
        ],
      };
      setIsWaiting(false);
      setMessages((prev) => [...prev, newBotError]);
      console.error("Error handling recorded audio:", err);
    }
  };

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      audioUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [audioUrls]);

  const handleToggleRecording = async () => {
    if (!isRecording) {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        setStatus("Microphone not available in this browser.");
        return;
      }

      try {
        // Reuse existing stream if available and active, otherwise get a new one
        // This prevents Android from re-prompting for permission on every click
        let stream = streamRef.current;
        if (!stream || stream.getTracks().every(t => t.readyState === "ended")) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
        }

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
          // Don't stop the stream tracks here - keep them active for reuse
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          chunksRef.current = [];
          setIsRecording(false);
          setIsWaiting(true); // Set waiting immediately so button is disabled
          setStatus("Processing your audio...");
          await handleRecordedAudio(blob);
          setStatus("Tap the microphone to speak again.");
        };

        recorder.start();
        setIsRecording(true);
        setStatus("Listening... Tap again to stop.");
      } catch (err) {
        console.error("Error starting recording:", err);
        // Clear stream reference on error
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        setStatus(
          "Could not access microphone. Please check your browser settings."
        );
      }
    } else {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== "inactive") {
        recorder.stop();
      }
      setIsRecording(false);
      setIsWaiting(true); // Set waiting immediately so button is disabled while processing
    }
  };

  // Cleanup stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (!scrollContainerRef.current) return;
   
    const scrollToBottom = () => {
      const el = scrollContainerRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    };
    
    // Use both requestAnimationFrame and setTimeout for reliability
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 50);
    });
  }, [messages]);

  // Initial scroll to bottom on mount - ensure it runs after layout
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    };
    
    // Multiple attempts to ensure it works
    scrollToBottom();
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
    });
  }, []);

  const lastExpenseIndex = messages
    .map((msg, idx) => ({ msg, idx }))
    .filter(({ msg }) => msg.content[0]?.type === "expense")
    .map(({ idx }) => idx)
    .pop();

  const handleApproveAll = async () => {
    // Save expenditures to backend before completing - pass task_id, user_id, and task_number
    const taskId = getTask2TaskId();
    if (taskId && participantId && expenses.length > 0) {
      try {
        const expenditureItems: ExpenditureItem[] = expenses.map((exp) => ({
          name: exp.name,
          date_of_expense: exp.date_of_expense,
          amount: exp.amount,
          category: exp.category || undefined,
          notes: exp.notes || undefined,
          status: "Pending",
        }));
        
        await createBulkExpenditures(taskId, participantId, taskNumber, expenditureItems);
      } catch (err) {
        console.error("Failed to save expenditures:", err);
        // Still complete the task even if saving fails
      }
    }
    
    // Move to next page when Approve All is clicked
    onTaskComplete();
  };

  return (
    <div className="flex h-full flex-1 flex-col gap-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Task 2: Voice chatbot</h2>
        <p className="text-sm text-zinc-700">
          Talk to the chatbot using your <span className="font-medium">voice</span>.
          Tap the microphone button to start and stop recording. When expenses are shown, tap{" "}
          <span className="font-medium">Approve All</span> to complete the task.
        </p>
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-xs font-semibold text-blue-900 mb-2">Expenses to log:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Steak dinner $60</li>
            <li>• Ice cream $5.50</li>
            <li>• Taxi $18.90</li>
          </ul>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col-reverse overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 min-h-0"
      >
        <div className="flex flex-col space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-zinc-500">
                Your spoken exchanges will appear here as text once processed.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const first = msg.content[0];
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${
                        msg.role === "user"
                          ? "bg-[#BAE7EC] text-zinc-900"
                          : "bg-[#E0E0E0] text-zinc-900"
                      }`}
                    >
                      {first?.type === "text" && <p className="whitespace-pre-line">{first.text}</p>}
                      {first?.type === "audio" && (
                        <AudioPlayer audioId={first.audioUri} audioUrls={audioUrls} />
                      )}
                      {first?.type === "expense" && (
                        <>
                          <p className="whitespace-pre-line">{first.text}</p>
                          {idx === lastExpenseIndex && (
                            <button
                              type="button"
                              onClick={handleApproveAll}
                              className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900"
                            >
                              Approve All
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {isWaiting && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl bg-[#E0E0E0] px-3 py-2 text-xs text-zinc-900">
                    <p>Please wait for a reply...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleToggleRecording}
          disabled={isWaiting}
          className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md transition ${
            isWaiting
              ? "bg-zinc-400 cursor-not-allowed"
              : isRecording
              ? "bg-red-600"
              : "bg-emerald-600"
          }`}
        >
          <span className="text-2xl">🎤</span>
        </button>
        <p className="text-xs text-zinc-600">{status}</p>
      </div>
    </div>
  );
}

// Audio player component for playing back recorded audio
function AudioPlayer({ 
  audioId, 
  audioUrls 
}: { 
  audioId: string; 
  audioUrls: Map<string, string>;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = audioUrls.get(audioId);

  // Handle play/pause toggle - similar to the working example
  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Use promise-based play for iOS compatibility
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error("Error playing audio:", err);
            setIsPlaying(false);
          });
      } else {
        setIsPlaying(true);
      }
    }
  };

  // Update audio source when URL changes (like the working example)
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      audioRef.current.load(); // Important for iOS
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [audioUrl]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  if (!audioUrl) {
    return <p className="text-xs text-zinc-500">Audio unavailable</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <audio 
        ref={audioRef}
        playsInline
      />
      <button
        type="button"
        onClick={handlePlayPause}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
      >
        <span className="text-base">{isPlaying ? "⏸" : "▶"}</span>
      </button>
      <span className="text-xs text-zinc-600">Voice message</span>
    </div>
  );
}

