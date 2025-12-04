// Web equivalents of your React Native chatbot API helpers.
// Converted from React Native to Next.js/web.

import type { ApiExpense, Message } from "./chatTypes";

// API URL - set in .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export type SendChatResponse = {
  response?: string;
  expense?: ApiExpense[];
};

export async function sendChatMessage(
  messages: Message[]
): Promise<SendChatResponse> {
  // Future check for token
  // const token = await getToken();
  // if (!token) throw new Error('No token found');

  console.log("permissions", messages);

  const response = await fetch(`${API_URL}/llm/chat`, {
    method: "POST",
    headers: {
      // 'Authorization': `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chat_history: messages }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Chat API error: ${errText}`);
  }

  return await response.json();
}

export type TranscriptionResult = {
  transcription: string;
};

export async function transcribeAudio(
  audioBlob: Blob
): Promise<TranscriptionResult> {
  // Create form data for the upload
  const formData = new FormData();

  console.log("permissions", audioBlob);

  // In web, we append the Blob directly (not a file object with uri)
  // The Blob from MediaRecorder is typically 'audio/webm' or 'audio/mp4'
  const audioType = audioBlob.type || "audio/webm";
  const fileName = audioType.includes("webm") ? "audio.webm" : "audio.mp4";

  formData.append("file", audioBlob, fileName);

  // Send the file to your FastAPI endpoint
  const response = await fetch(`${API_URL}/llm/transcribe-audio/`, {
    method: "POST",
    // Don't set Content-Type header - browser will set it with boundary for FormData
    body: formData,
  });

  // Handle response
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Transcription API error: ${errText}`);
  }

  return await response.json(); // should return transcription text from backend
}
