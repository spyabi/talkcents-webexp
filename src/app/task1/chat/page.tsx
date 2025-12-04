"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getParticipantId,
  setTask1DurationMs,
  getTask1TaskId,
} from "../../_lib/experimentStorage";
import type { Message, Expense, ApiExpense } from "../../_lib/chatTypes";
import { sendChatMessage } from "../../_lib/chatbotApi";
import { createBulkExpenditures, ExpenditureItem } from "../../_lib/webexpApi";

export default function Task1ChatPage() {
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
      setTask1DurationMs(end - startTime);
    }
    router.push("/task1/end");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col bg-white px-4 py-6 text-sm text-zinc-900">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-semibold">TalkCents Web Experiment</h1>
        <p className="mt-1 text-xs text-zinc-500">Task 1: Typing Chatbot</p>
      </header>

      <Task1TypingChatbot participantId={participantId} onTaskComplete={handleComplete} />
    </main>
  );
}

interface Task1TypingChatbotProps {
  participantId: string | null;
  onTaskComplete: () => void;
}

function Task1TypingChatbot({ participantId, onTaskComplete }: Task1TypingChatbotProps) {
  const taskNumber = 1; // Task 1: Typing chatbot
  const [messageInput, setMessageInput] = useState("");
  const [inputHeight, setInputHeight] = useState(40);
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
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleBotResponse = async (updatedChatHistory: Message[]) => {
    try {
      const botResponse = await sendChatMessage(updatedChatHistory);

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
      setMessages((prev) => [...prev, newBotError]);
      console.error("Error sending chat message:", err);
    }
  };

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text) return;

    const newMessage: Message = {
      role: "user",
      content: [{ type: "text", text }],
    };

    const updatedChatHistory = [...chatHistory, newMessage];
    setMessages((prev) => [...prev, newMessage]);
    setChatHistory(updatedChatHistory);
    setMessageInput("");
    setInputHeight(40);

    await handleBotResponse(updatedChatHistory);
  };

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
    const taskId = getTask1TaskId();
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
    <div className="flex h-full flex-1 flex-col gap-3">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Task 1: Typing chatbot</h2>
        <p className="text-sm text-zinc-700">
          Chat with the chatbot by <span className="font-medium">typing</span>{" "}
          your responses. When expenses are shown, tap{" "}
          <span className="font-medium">Approve All</span> to complete the task.
        </p>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col-reverse overflow-y-auto rounded-md border border-zinc-200 bg-zinc-50 p-3 min-h-0"
      >
        <div className="flex flex-col space-y-2">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-xs text-zinc-500">
                Start by sending a message to the chatbot.
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
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-end gap-2">
        <textarea
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
            setInputHeight(Math.min(e.target.scrollHeight, 120));
          }}
          placeholder="Type your message..."
          rows={1}
          style={{ height: `${inputHeight}px`, fontSize: "16px" }}
          className="flex-1 resize-none rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={handleSend}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white"
          aria-label="Send message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

