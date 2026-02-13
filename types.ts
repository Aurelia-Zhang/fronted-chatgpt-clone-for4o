
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
    pureBlack: boolean; // AMOLED Black mode
}

export interface LogEntry {
    id: string;
    timestamp: string;
    method: string;
    url: string;
    requestBody: any;
    responseStatus: number;
    responseBody: string; // Captured text or error
    tokens?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
        prompt_tokens_details?: {
            cached_tokens?: number;
            audio_tokens?: number;
        };
        completion_tokens_details?: {
            reasoning_tokens?: number;
            audio_tokens?: number;
            accepted_prediction_tokens?: number;
            rejected_prediction_tokens?: number;
        };
    };
}
