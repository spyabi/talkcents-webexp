export type MessageContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }
  | { type: "audio"; audioUri: string }
  | { type: "expense"; text: string };

export type Message = {
  role: "user" | "assistant";
  content: MessageContent[];
};

export type Expense = {
  name: string;
  date_of_expense: string;
  amount: number;
  category: string;
  notes?: string;
  status: "Pending" | "Approved";
};

export type ApiExpense = {
  name: string;
  date_of_expense: string;
  price: number;
  category: string;
  notes?: string;
};


