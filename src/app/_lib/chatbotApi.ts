// Web equivalents of your React Native chatbot API helpers.
// Converted from React Native to Next.js/web.

import type { ApiExpense, Message } from "./chatTypes";

// TODO: Set your API URLs here
const API_URL = "http://18.234.224.108:8000/api/llm";

// Check if backend is reachable
export async function checkBackendConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    // Try a simple fetch with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { connected: true };
    } else {
      return { connected: false, error: `Server returned ${response.status}` };
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        return { connected: false, error: "Connection timed out" };
      }
      return { connected: false, error: err.message };
    }
    return { connected: false, error: "Unknown error" };
  }
}

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

  const response = await fetch(`${API_URL}/chat`, {
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
  const response = await fetch(`${API_URL}/transcribe-audio/`, {
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



