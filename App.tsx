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
  contextLimit: 40,
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
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const fetchSummary = async (messagesToSummarize: Message[]): Promise<string> => {
      const fetchUrl = `${apiConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`;
      const summaryPrompt = "Please generate a concise summary of the following conversation history.";
      const historyText = messagesToSummarize.map(m => `${m.role}: ${m.content}`).join('\n');
      
      const requestBody = {
          model: apiConfig.model,
          messages: [
              { role: 'system', content: summaryPrompt },
              { role: 'user', content: historyText }
          ],
          max_tokens: 500,
          user: sessionId
      };

      try {
          const response = await fetch(fetchUrl, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiConfig.apiKey}`,
                  'X-Session-ID': sessionId
              },
              body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          addLog({
              method: 'POST (Summary)',
              url: fetchUrl,
              requestBody,
              responseStatus: response.status,
              responseBody: JSON.stringify(data).slice(0, 500) + '...'
          });

          return data.choices?.[0]?.message?.content || "";
      } catch (e: any) {
          addLog({
              method: 'POST (Summary Failed)',
              url: fetchUrl,
              requestBody,
              responseStatus: 0,
              responseBody: e.message
          });
          return "";
      }
  };

  // Generate Response - Accepting overrideMap to fix closure issue
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

    // Update state to show loading/empty message
    // Note: We use setMessageMap callback to ensure we are appending to the LATEST state
    // (which should include the user message we just added)
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

    // CRITICAL FIX: Use the overrideMap if provided to get the prompt context
    const currentMap = overrideMap || messageMap;
    
    const fetchUrl = `${apiConfig.baseUrl.replace(/\/+$/, '')}/chat/completions`;
    let requestBody: any = {};
    let finalUsage: any = null;

    try {
        const payloadMessages = [];
        
        // Use the FRESH map to get the thread
        const fullThread = getThread(currentThreadHeadId, currentMap);
        
        console.log("Thread length:", fullThread.length);
        
        const limit = apiConfig.contextLimit || 40;
        let contextMessages = fullThread;
        let summaryInjection = "";
        
        if (fullThread.length > limit) {
             contextMessages = fullThread.slice(-limit);
             if (apiConfig.enableAutoSummary) {
                 const truncatedMessages = fullThread.slice(0, fullThread.length - limit);
                 if (truncatedMessages.length > 0) {
                     const summary = await fetchSummary(truncatedMessages);
                     if (summary) {
                         summaryInjection = `\n\n[System Note]: Previous conversation summary: ${summary}`;
                     }
                 }
             }
        }

        // --- CACHE OPTIMIZATION & TIME INJECTION ---
        // 1. Keep the main System Prompt STATIC. Do NOT inject time here.
        let finalSystemPrompt = systemPrompt || "";
        
        if (summaryInjection) {
             finalSystemPrompt += summaryInjection;
        }

        if (finalSystemPrompt.trim()) {
            payloadMessages.push({ role: 'system', content: finalSystemPrompt });
        }

        // 2. Add History (Cached part)
        const apiHistory = contextMessages.map(m => ({ role: m.role, content: m.content }));
        payloadMessages.push(...apiHistory);

        // 3. Inject Time as a NEW System Message at the VERY END.
        // This ensures the prefix (System + History) remains identical to the previous request's history prefix.
        // The dynamic time only changes the tail, which doesn't invalidate the cache for the head.
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
            stream_options: { include_usage: true } // Request token usage
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
                        
                        // Capture usage if available (usually last chunk)
                        if (data.usage) {
                            finalUsage = data.usage;
                        }

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

        // Log Success
        addLog({
            method: 'POST (Chat)',
            url: fetchUrl,
            requestBody: requestBody,
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

    // CORRECT FIX: Explicitly construct the new map locally
    // This ensures we pass the fully updated state to generateResponse
    const newMap = { ...messageMap };
    
    // 1. Add User Message
    newMap[userMsgId] = userMsg;
    
    // 2. Link Parent
    if (parentId && newMap[parentId]) {
        const parent = { ...newMap[parentId] };
        parent.childrenIds = [...parent.childrenIds, userMsgId];
        parent.selectedChildId = userMsgId;
        newMap[parentId] = parent;
    }
    
    // 3. Update React State
    setMessageMap(newMap);
    setCurrentHeadId(userMsgId);

    // 4. Call API with the FRESH map (OverrideMap)
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