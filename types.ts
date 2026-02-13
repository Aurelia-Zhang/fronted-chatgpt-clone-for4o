
export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp?: string;
  isThinking?: boolean;
  
  // Tree Structure Support
  parentId?: string | null;
  childrenIds: string[];
  // If a node has multiple children, which one is currently selected to be shown?
  selectedChildId?: string | null; 
}

export interface ApiConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  
  // Advanced Settings
  temperature?: number;
  top_p?: number;
  contextLimit?: number; // Sliding window size (max rounds/messages)
  enableAutoSummary?: boolean; // Toggle for the summarization feature
}

export interface InterfaceConfig {
    centerHeader: boolean;
    showAvatar: boolean;
}