import React, { useState, useEffect, useRef, useMemo } from 'react';
import Header from './components/Header';
import MessageList from './components/MessageList';
import InputBar from './components/InputBar';
import ApiConfigModal from './components/ApiConfigModal';
import SystemPromptModal from './components/SystemPromptModal';
import InterfaceConfigModal from './components/InterfaceConfigModal';
import LogsModal from './components/LogsModal';
import { OpenAIIcon } from './components/Icons'; 
import { Message, ApiConfig, InterfaceConfig, LogEntry } from './types';
import { parseChatHtml, exportChatToHtml } from './utils';

const DEFAULT_CONFIG: ApiConfig = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o',
  temperature: 0.7,
  top_p: 1.0,
  contextLimit: 20, // Default window size
  enableAutoSummary: false
};

const DEFAULT_INTERFACE_CONFIG: InterfaceConfig = {
    centerHeader: false,
    showAvatar: false,
    pureBlack: false
};

// --- Tree Helper Functions ---
const initializeTree = (linearMessages: Message[]): { map: Record<string, Message>, headId: string | null } => {
    const map: Record<string, Message> = {};
    let previousId: string | null = null;
    let headId: string | null = null;

    linearMessages.forEach(msg => {
        const newMsg: Message = {
            ...msg,
            parentId: previousId,
            childrenIds: [],
            selectedChildId: null
        };
        map[newMsg.id] = newMsg;
        if (previousId && map[previousId]) {
            map[previousId].childrenIds.push(newMsg.id);
            map[previousId].selectedChildId = newMsg.id;
        }
        previousId = newMsg.id;
        headId = newMsg.id;
    });

    return { map, headId };
};

const getThread = (headId: string | null, map: Record<string, Message>): Message[] => {
    if (!headId) return [];
    const thread: Message[] = [];
    let currentId: string | null = headId;
    while (currentId && map[currentId]) {
        thread.unshift(map[currentId]);
        currentId = map[currentId].parentId || null;
    }
    return thread;
};

const App: React.FC = () => {
  // Tree State
  const [messageMap, setMessageMap] = useState<Record<string, Message>>({});
  const [currentHeadId, setCurrentHeadId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Logs State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Session ID
  const [sessionId] = useState(() => {
      const stored = localStorage.getItem('chatgpt_session_id');
      if (stored) return stored;
      const newId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('chatgpt_session_id', newId);
      return newId;
  });

  // Initialize Data
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatgpt_history_v1');
    if (savedHistory) {
        try {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const { map, headId } = initializeTree(parsed);
                setMessageMap(map);
                setCurrentHeadId(headId);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }
    setIsLoaded(true);
  }, []);

  const messages = useMemo(() => getThread(currentHeadId, messageMap), [currentHeadId, messageMap]);

  useEffect(() => {
      if (isLoaded && messages.length > 0) {
        localStorage.setItem('chatgpt_history_v1', JSON.stringify(messages));
      }
  }, [messages, isLoaded]);

  const [inputValue, setInputValue] = useState('');
  const [editTargetId, setEditTargetId] = useState<string | null>(null);

  // Modals & Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [isInterfaceConfigOpen, setIsInterfaceConfigOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  
  // Data State
  const [apiConfig, setApiConfig] = useState<ApiConfig>(DEFAULT_CONFIG);
  const [interfaceConfig, setInterfaceConfig] = useState<InterfaceConfig>(DEFAULT_INTERFACE_CONFIG);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingSummariesRef = useRef<Set<string>>(new Set()); // Track which message IDs are currently being summarized

  useEffect(() => {
    const savedConfig = localStorage.getItem('chatgpt_api_config');
    if (savedConfig) {
      try {
        setApiConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) });
      } catch (e) { }
    }
    
    const savedInterfaceConfig = localStorage.getItem('chatgpt_interface_config');
    if (savedInterfaceConfig) {
        try {
            setInterfaceConfig({ ...DEFAULT_INTERFACE_CONFIG, ...JSON.parse(savedInterfaceConfig) });
        } catch (e) {}
    }

    const savedPrompt = localStorage.getItem('chatgpt_system_prompt');
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
  }, []);

  const handleSaveConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    localStorage.setItem('chatgpt_api_config', JSON.stringify(newConfig));
  };

  const handleSaveInterfaceConfig = (newConfig: InterfaceConfig) => {
      setInterfaceConfig(newConfig);
      localStorage.setItem('chatgpt_interface_config', JSON.stringify(newConfig));
  };

  const handleSaveSystemPrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    localStorage.setItem('chatgpt_system_prompt', newPrompt);
  };

  const addLog = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
      const newLog: LogEntry = {
          id: Date.now().toString() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          ...entry
      };
      setLogs(prev => [...prev, newLog]);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleMenuSelect = (option: 'api' | 'system' | 'import' | 'export' | 'interface' | 'logs') => {
    setIsMenuOpen(false);
    if (option === 'api') setIsConfigOpen(true);
    else if (option === 'system') setIsSystemPromptOpen(true);
    else if (option === 'import') fileInputRef.current?.click();
    else if (option === 'export') handleExportChat();
    else if (option === 'interface') setIsInterfaceConfigOpen(true);
    else if (option === 'logs') setIsLogsOpen(true);
  };

  const handleExportChat = () => {
    const htmlContent = exportChatToHtml(messages);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatgpt-export-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const text = await file.text();
        const importedMessages = parseChatHtml(text);
        if (importedMessages.length > 0) {
            const { map, headId } = initializeTree(importedMessages);
            setMessageMap(map);
            setCurrentHeadId(headId);
        } else {
            alert('Failed to extract messages from the file.');
        }
    } catch (err) {
        console.error("Failed to read file", err);
        alert('Error reading file');
    } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Background Summary Logic ---
  
  const generateBlockSummary = async (blockMessages: Message[], targetMessageId: string) => {
      // Use summary specific config, or fall back to main config
      const baseUrl = apiConfig.summaryBaseUrl || apiConfig.baseUrl;
      const apiKey = apiConfig.summaryApiKey || apiConfig.apiKey;
      const model = apiConfig.summaryModel || apiConfig.model;
      
      if (!apiKey) return;

      const fetchUrl = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
      
      // STRICT PROMPT: Enforce role as a summarizer with Adaptive Naming
      const prompt = `You are a background process acting as a neutral observer.
Your ONLY task is to summarize the conversation transcript provided below.
- Focus on key facts, user goals, and important context for future memory.
- ADAPTIVE NAMING: Detect how the participants address each other. If the user calls the AI "Jarvis", refer to the AI as "Jarvis" in the summary. If the AI calls the user "Master", refer to the user as "Master". Only use "User" or "Assistant" if no specific names/titles are found.
- Do NOT simulate the conversation.
- Do NOT reply to the user.
- Do NOT act as the assistant in the transcript.
- Output ONLY the concise summary paragraph.`;

      // Clearer delimiters for history
      const historyText = blockMessages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
      const userContent = `Here is the conversation transcript to summarize:\n\n${historyText}`;

      const requestBody = {
          model: model,
          messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: userContent }
          ],
          max_tokens: 500,
      };

      try {
          addLog({
              method: 'POST (Background Summary)',
              url: fetchUrl,
              requestBody: requestBody, // FULL LOG
              responseStatus: 0,
              responseBody: 'Generating summary for block ending at ' + targetMessageId
          });

          const response = await fetch(fetchUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`
              },
              body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          const summaryText = data.choices?.[0]?.message?.content || "";

          if (summaryText) {
              // Update the target message with the summary
              setMessageMap(prev => {
                  const msg = prev[targetMessageId];
                  if (!msg) return prev;
                  return {
                      ...prev,
                      [targetMessageId]: {
                          ...msg,
                          summary: summaryText
                      }
                  };
              });
              
              addLog({
                  method: 'POST (Summary Complete)',
                  url: fetchUrl,
                  requestBody: {}, // Response log doesn't need request body repeated
                  responseStatus: 200,
                  responseBody: summaryText
              });
          }
      } catch (e: any) {
          console.error("Summary Generation Failed", e);
          addLog({
              method: 'POST (Summary Failed)',
              url: fetchUrl,
              requestBody: requestBody,
              responseStatus: 500,
              responseBody: e.message
          });
      } finally {
          processingSummariesRef.current.delete(targetMessageId);
      }
  };

  // Watch for thread changes to trigger background summaries
  useEffect(() => {
      if (!apiConfig.enableAutoSummary) return;

      const runSummaryCheck = async () => {
          const limit = apiConfig.contextLimit || 20;
          const CHUNK_SIZE = 10; // Summarize in blocks of 10
          
          const thread = messages; // Current linear thread
          if (thread.length <= limit) return; // No need to summarize if within window

          // Indices to consider for summary:
          // We keep 0,1 (Anchor)
          // We keep [Length - Limit ... Length] (Active Window)
          // The "Past" is [2 ... Length - Limit - 1]
          
          const activeWindowStart = Math.max(0, thread.length - limit);
          const historyEndIndex = activeWindowStart - 1;
          
          if (historyEndIndex < 2) return; // No history to summarize

          // Iterate through the history in chunks of CHUNK_SIZE
          // Start from index 2
          for (let i = 2; i <= historyEndIndex; i++) {
              // We trigger a summary at the end of every CHUNK_SIZE block (e.g., at index 11, 21, 31...)
              // OR if we reached the end of the history block and it's large enough (> 5 messages)
              
              const isChunkEnd = (i - 2 + 1) % CHUNK_SIZE === 0;
              const isHistoryEnd = i === historyEndIndex;
              
              // Only trigger if it's a chunk end
              if (isChunkEnd) {
                  const targetMsg = thread[i];
                  
                  // If this message doesn't have a summary and isn't being processed
                  if (!targetMsg.summary && !processingSummariesRef.current.has(targetMsg.id)) {
                      // Summarize the previous CHUNK_SIZE messages ending at this one
                      const startIdx = i - CHUNK_SIZE + 1;
                      const block = thread.slice(startIdx, i + 1);
                      
                      processingSummariesRef.current.add(targetMsg.id);
                      generateBlockSummary(block, targetMsg.id);
                  }
              }
          }
      };

      runSummaryCheck();
  }, [messages.length, currentHeadId, apiConfig.enableAutoSummary, apiConfig.contextLimit]);


  // --- Main Response Generation ---

  const generateResponse = async (currentThreadHeadId: string, overrideMap?: Record<string, Message>) => {
    if (!apiConfig.apiKey) {
      setIsConfigOpen(true);
      return;
    }

    setIsLoading(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const assistantMsgId = Date.now().toString() + '-assist';
    
    const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        parentId: currentThreadHeadId,
        childrenIds: []
    };

    setMessageMap(prev => {
        const newMap = { ...prev };
        newMap[assistantMsgId] = assistantMsg;
        if (prev[currentThreadHeadId]) {
            const parent = { ...prev[currentThreadHeadId] };
            parent.childrenIds = [...parent.childrenIds, assistantMsgId];
            parent.selectedChildId = assistantMsgId;
            newMap[currentThreadHeadId] = parent;
        }
        return newMap;
    });
    setCurrentHeadId(assistantMsgId);

    const currentMap = overrideMap || messageMap;
    const fetchUrl = `${apiConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    let requestBody: any = {};
    let finalUsage: any = null;

    try {
        const fullThread = getThread(currentThreadHeadId, currentMap);
        const limit = apiConfig.contextLimit || 20;
        const payloadMessages = [];
        
        // --- 1. System Prompt ---
        if (systemPrompt.trim()) {
            payloadMessages.push({ role: 'system', content: systemPrompt });
        }

        // --- 2. Context Construction ---
        if (fullThread.length <= limit) {
             // Case A: Short conversation, send everything
             payloadMessages.push(...fullThread.map(m => ({ role: m.role, content: m.content })));
        } else {
             // Case B: Long conversation with "Anchor + Summaries + Window"
             
             // 2.1 Anchor (First 2 messages: usually System intro & User hello)
             const anchor = fullThread.slice(0, 2);
             payloadMessages.push(...anchor.map(m => ({ role: m.role, content: m.content })));

             // 2.2 Hidden History with Summaries
             const windowStart = fullThread.length - limit;
             const hiddenHistory = fullThread.slice(2, windowStart);
             
             // Inject summaries found in hidden history
             hiddenHistory.forEach(msg => {
                 if (msg.summary) {
                     payloadMessages.push({ 
                         role: 'system', 
                         content: `[Previous Conversation Summary]: ${msg.summary}` 
                     });
                 }
             });

             // 2.3 Active Window
             const activeWindow = fullThread.slice(windowStart);
             payloadMessages.push(...activeWindow.map(m => ({ role: m.role, content: m.content })));
        }

        // --- 3. Time Injection ---
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
        payloadMessages.push({ 
            role: 'system', 
            content: `[System Info]: Current time: ${timeString}` 
        });

        requestBody = {
            model: apiConfig.model,
            messages: payloadMessages,
            stream: true,
            temperature: apiConfig.temperature,
            top_p: apiConfig.top_p,
            user: sessionId,
            stream_options: { include_usage: true }
        };

        const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiConfig.apiKey}`,
                'X-Session-ID': sessionId
            },
            body: JSON.stringify(requestBody),
            signal: abortController.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const jsonStr = line.slice(6);
                        const data = JSON.parse(jsonStr);
                        if (data.usage) finalUsage = data.usage;

                        const content = data.choices[0]?.delta?.content || '';
                        if (content) {
                            accumulatedContent += content;
                            setMessageMap(prev => ({
                                ...prev,
                                [assistantMsgId]: {
                                    ...prev[assistantMsgId],
                                    content: accumulatedContent
                                }
                            }));
                        }
                    } catch (e) { }
                }
            }
        }

        addLog({
            method: 'POST (Chat)',
            url: fetchUrl,
            requestBody: requestBody, // FULL LOG - No more truncation
            responseStatus: 200,
            responseBody: accumulatedContent,
            tokens: finalUsage
        });

    } catch (error: any) {
        if (error.name === 'AbortError') {
            addLog({
                method: 'POST (Aborted)',
                url: fetchUrl,
                requestBody: requestBody,
                responseStatus: 0,
                responseBody: "User stopped generation."
            });
        } else {
            console.error('Chat error:', error);
            const errorMsg = `\n\n[Error: ${error.message}]`;
            setMessageMap(prev => ({
                ...prev,
                [assistantMsgId]: {
                    ...prev[assistantMsgId],
                    content: prev[assistantMsgId].content + errorMsg
                }
            }));
            
            addLog({
                method: 'POST (Error)',
                url: fetchUrl,
                requestBody: requestBody,
                responseStatus: 500,
                responseBody: error.message
            });
        }
    } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMsgId = Date.now().toString();
    const content = inputValue;
    setInputValue('');
    setIsMenuOpen(false);

    let parentId = currentHeadId;
    if (editTargetId) {
        const editedMsg = messageMap[editTargetId];
        parentId = editedMsg?.parentId || null;
        setEditTargetId(null); 
    }

    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: content,
      parentId: parentId,
      childrenIds: []
    };

    const newMap = { ...messageMap };
    newMap[userMsgId] = userMsg;
    if (parentId && newMap[parentId]) {
        const parent = { ...newMap[parentId] };
        parent.childrenIds = [...parent.childrenIds, userMsgId];
        parent.selectedChildId = userMsgId;
        newMap[parentId] = parent;
    }
    setMessageMap(newMap);
    setCurrentHeadId(userMsgId);

    await generateResponse(userMsgId, newMap);
  };

  const handleEdit = (messageId: string) => {
    const msg = messageMap[messageId];
    if (!msg || msg.role !== 'user') return;
    setInputValue(msg.content);
    setEditTargetId(messageId);
  };

  const handleCopy = (content: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(content);
  };

  const handleRegenerate = (messageId: string) => {
      const msg = messageMap[messageId];
      if (!msg || msg.role !== 'assistant') return;
      const parentId = msg.parentId;
      if (!parentId) return;
      generateResponse(parentId);
  };

  const handleNavigate = (messageId: string, direction: 'left' | 'right') => {
      const msg = messageMap[messageId];
      if (!msg || !msg.parentId) return;
      
      const parent = messageMap[msg.parentId];
      const index = parent.childrenIds.indexOf(messageId);
      
      let newIndex = index;
      if (direction === 'left') newIndex = Math.max(0, index - 1);
      if (direction === 'right') newIndex = Math.min(parent.childrenIds.length - 1, index + 1);
      
      if (newIndex !== index) {
          const newChildId = parent.childrenIds[newIndex];
          setMessageMap(prev => ({
              ...prev,
              [parent.id]: {
                  ...prev[parent.id],
                  selectedChildId: newChildId
              }
          }));

          let ptr = newChildId;
          let tempMap = { ...messageMap }; 
          while(true) {
              const node = tempMap[ptr];
              if (!node || node.childrenIds.length === 0) break;
              const nextId = node.selectedChildId || node.childrenIds[node.childrenIds.length - 1];
              ptr = nextId;
          }
          setCurrentHeadId(ptr);
      }
  };

  const handleBackgroundClick = (e: React.MouseEvent | React.TouchEvent) => {
      if (editTargetId) {
          setEditTargetId(null);
          setInputValue(''); 
      }
  };

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className={`flex flex-col h-[100dvh] text-token-text-primary antialiased ${interfaceConfig.pureBlack ? 'bg-black' : 'bg-token-main-surface-primary'}`}>
      <Header centerHeader={interfaceConfig.centerHeader} pureBlack={interfaceConfig.pureBlack} />
      
      {/* Main Container */}
      <div 
        className="flex-1 flex flex-col min-h-0 relative overflow-hidden"
      >
        {/* Scrollable Area */}
        <div 
            className="flex-1 flex flex-col min-h-0 relative"
            onClick={handleBackgroundClick}
        >
            {messages.length > 0 ? (
                <MessageList 
                    messages={messages} 
                    onEdit={handleEdit}
                    onCopy={handleCopy}
                    onRegenerate={handleRegenerate}
                    onNavigate={handleNavigate}
                    messageMap={messageMap}
                    showAvatar={interfaceConfig.showAvatar}
                />
            ) : (
                /* Empty State / Placeholder */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-100 transition-opacity">
                    <h2 className="text-2xl font-semibold text-token-text-primary text-center">How can I help you today?</h2>
                </div>
            )}
        </div>
        
        {/* Input Area */}
        <div 
            className={`w-full z-40 flex-shrink-0 ${interfaceConfig.pureBlack ? 'bg-black' : 'bg-token-main-surface-primary'}`}
            onClick={(e) => e.stopPropagation()} 
        >
            <InputBar 
                value={inputValue} 
                onChange={(e) => {
                    setInputValue(e.target.value);
                    if (e.target.value === '' && editTargetId) setEditTargetId(null);
                }} 
                onPlusClick={() => setIsMenuOpen(!isMenuOpen)}
                isLoading={isLoading}
                onSend={handleSend}
                onStop={handleStop}
                isMenuOpen={isMenuOpen}
                onMenuSelect={handleMenuSelect}
                onCloseMenu={() => setIsMenuOpen(false)}
                pureBlack={interfaceConfig.pureBlack}
            />
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".html" style={{ display: 'none' }} />

      <ApiConfigModal 
        isOpen={isConfigOpen} 
        onClose={() => setIsConfigOpen(false)} 
        initialConfig={apiConfig}
        onSave={handleSaveConfig}
      />

      <InterfaceConfigModal
        isOpen={isInterfaceConfigOpen}
        onClose={() => setIsInterfaceConfigOpen(false)}
        initialConfig={interfaceConfig}
        onSave={handleSaveInterfaceConfig}
      />

      <SystemPromptModal
        isOpen={isSystemPromptOpen}
        onClose={() => setIsSystemPromptOpen(false)}
        initialPrompt={systemPrompt}
        onSave={handleSaveSystemPrompt}
      />
      
      <LogsModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={logs}
        onClear={() => setLogs([])}
      />
    </div>
  );
};

export default App;