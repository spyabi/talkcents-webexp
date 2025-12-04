// Web Experiment API functions
// Handles task creation, time tracking, and expenditure submission

const WEBEXP_API_URL = process.env.NEXT_PUBLIC_WEBEXP_API_URL || "http://localhost:8000/api";
const WEBEXP_API_KEY = process.env.NEXT_PUBLIC_WEBEXP_API_KEY || "12345";

// Check if backend is reachable
export async function checkBackendConnection(): Promise<{
  connected: boolean;
  error?: string;
}> {
  try {
    // Try a simple fetch with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${WEBEXP_API_URL}/webexp/health`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${WEBEXP_API_KEY}`,
      },
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

// Create task (and auto-create user if needed)
export async function createTask(userId: string, taskNumber: number) {
  const response = await fetch(`${WEBEXP_API_URL}/webexp/tasks/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WEBEXP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      task_number: taskNumber,
      time_taken_seconds: null,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Create task error: ${errText}`);
  }

  return await response.json();
}

// Update task time when task is completed
// Pass task_id along with user_id and task_number for specificity
export async function updateTaskTime(
  taskId: string,
  userId: string,
  taskNumber: number,
  timeSeconds: number
) {
  const response = await fetch(`${WEBEXP_API_URL}/webexp/tasks/time/`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${WEBEXP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      task_id: taskId,
      user_id: userId,
      task_number: taskNumber,
      time_taken_seconds: timeSeconds,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Update task time error: ${errText}`);
  }

  return await response.json();
}

// Expenditure item type for bulk creation
export type ExpenditureItem = {
  name: string;
  date_of_expense: string; // YYYY-MM-DD format
  amount: number;
  category?: string;
  notes?: string;
  status?: string;
};

// Create bulk expenditures
// Pass task_id along with user_id and task_number for specificity
export async function createBulkExpenditures(
  taskId: string,
  userId: string,
  taskNumber: number,
  expenditures: ExpenditureItem[]
) {
  const url = new URL(`${WEBEXP_API_URL}/webexp/expenditures/bulk/`);
  url.searchParams.append("task_id", taskId);
  url.searchParams.append("user_id", userId);
  url.searchParams.append("task_number", String(taskNumber));

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${WEBEXP_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(expenditures),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Create bulk expenditures error: ${errText}`);
  }

  return await response.json();
}

