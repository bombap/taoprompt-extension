export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string;
  subscriptionId: string | null;
  dailyMessageCount: number;
  dailyReset: string;
  messageCount: number;
  lastKeyGeneratedAt: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  messageLimit: number;
  features: string[]
}

export interface Config {
  plans: Plan[]
}

export interface CreatePromptSchema {
  prompt: string;
  settings: {
    mode: 'fastest' | 'expert';
    model: string;
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    language: string;
  };
}
export interface UpdatePromptSchema {
  is_public: boolean;
}

export interface PromptItem {
  id: string;
  userId: string;
  title: string;
  userPrompt: string;
  assistantPrompt: string;
  finalPrompt: string;
  settings: {
    mode: 'fastest' | 'expert';
    model: string;
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
  isPublic: boolean;
  status: string;
  metadata: {};
  usage: {
    input: number;
    output: number;
  };
  totalUsage: number;
  createdAt: string;
  updatedAt: string;
}
export interface PromptItemOnSidebar {
  id: string;
  title: string;
  createdAt?: string;
  finalPrompt?: string;
}

export const PromptPreviewStatus = {
  WAITING: 0,
  LOADING: 1,
  COMPLETED: 2
}

export interface PromptPreview {
  "Inputs": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
  "Formulas": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
  "Instructions Structure": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
  "Title": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
  "Categories": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
  "Instructions": {
    stream: string;
    content: string;
    status: number;
    open: boolean;
  };
}

export enum PromptResultControlPosition {
  TOP,
  BOTTOM
}

export interface UpdateProfileSchema {
  name: string;
}
