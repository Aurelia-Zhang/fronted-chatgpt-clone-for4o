import React, { useState, useEffect } from 'react';
import { ApiConfig } from '../types';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: ApiConfig;
  onSave: (config: ApiConfig) => void;
}

const ApiConfigModal: React.FC<ApiConfigModalProps> = ({ isOpen, onClose, initialConfig, onSave }) => {
  const [baseUrl, setBaseUrl] = useState(initialConfig.baseUrl);
  const [apiKey, setApiKey] = useState(initialConfig.apiKey);
  const [model, setModel] = useState(initialConfig.model);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  
  // New Advanced Settings
  const [temperature, setTemperature] = useState(initialConfig.temperature ?? 0.7);
  const [topP, setTopP] = useState(initialConfig.top_p ?? 1.0);
  const [contextLimit, setContextLimit] = useState(initialConfig.contextLimit ?? 10);
  const [enableAutoSummary, setEnableAutoSummary] = useState(initialConfig.enableAutoSummary ?? false);

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showModelList, setShowModelList] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBaseUrl(initialConfig.baseUrl);
      setApiKey(initialConfig.apiKey);
      setModel(initialConfig.model);
      setTemperature(initialConfig.temperature ?? 0.7);
      setTopP(initialConfig.top_p ?? 1.0);
      setContextLimit(initialConfig.contextLimit ?? 10);
      setEnableAutoSummary(initialConfig.enableAutoSummary ?? false);
      
      setStatus('idle');
      setStatusMessage('');
      setShowAdvanced(false);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const fetchModels = async () => {
    if (!baseUrl || !apiKey) {
      setStatus('error');
      setStatusMessage('URL and Key are required');
      return;
    }

    setStatus('loading');
    setStatusMessage('Fetching models...');
    
    try {
      // Normalize URL (remove trailing slash if present)
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const models = data.data.map((m: any) => m.id).sort();
      setAvailableModels(models);
      setShowModelList(true);
      setStatus('success');
      setStatusMessage(`Found ${models.length} models`);
    } catch (e: any) {
      setStatus('error');
      setStatusMessage(e.message || 'Failed to fetch models');
    }
  };

  const testAndSave = async () => {
     if (!baseUrl || !apiKey || !model) {
      setStatus('error');
      setStatusMessage('All fields are required');
      return;
    }

    setStatus('loading');
    setStatusMessage('Testing connection...');

    try {
      const cleanUrl = baseUrl.replace(/\/+$/, '');
      const response = await fetch(`${cleanUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Say "Connection successful"' }],
            max_tokens: 10
        })
      });

      if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      setStatus('success');
      setStatusMessage('Success! Configuration saved.');
      
      // Save and Close after short delay
      onSave({ 
          baseUrl: cleanUrl, 
          apiKey, 
          model,
          temperature,
          top_p: topP,
          contextLimit,
          enableAutoSummary
      });
      setTimeout(() => {
          onClose();
      }, 1000);

    } catch (e: any) {
        setStatus('error');
        setStatusMessage(e.message || 'Test failed');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[360px] bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 max-h-[80vh]">
        <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <h2 className="text-center text-token-text-primary font-semibold text-lg">API Configuration</h2>
            
            {/* Base URL */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-token-text-secondary font-medium ml-1">API URL</label>
                <input 
                    type="text" 
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full bg-[#2F2F2F] text-token-text-primary p-3 rounded-lg text-sm border border-transparent focus:border-white/20 focus:outline-none transition-colors"
                />
            </div>

            {/* API Key */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-token-text-secondary font-medium ml-1">API Key</label>
                <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-[#2F2F2F] text-token-text-primary p-3 rounded-lg text-sm border border-transparent focus:border-white/20 focus:outline-none transition-colors"
                />
            </div>

            {/* Model Selection */}
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs text-token-text-secondary font-medium ml-1">Model</label>
                <input 
                    type="text" 
                    value={model}
                    onChange={(e) => {
                        setModel(e.target.value);
                        setShowModelList(true);
                    }}
                    onFocus={() => setShowModelList(true)}
                    placeholder="gpt-4o"
                    className="w-full bg-[#2F2F2F] text-token-text-primary p-3 rounded-lg text-sm border border-transparent focus:border-white/20 focus:outline-none transition-colors"
                />
                
                {showModelList && availableModels.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#2C2C2C] border border-[#3E3E3E] rounded-lg max-h-40 overflow-y-auto z-20 shadow-lg">
                        {availableModels.filter(m => m.toLowerCase().includes(model.toLowerCase())).map((m) => (
                            <div 
                                key={m}
                                onClick={() => {
                                    setModel(m);
                                    setShowModelList(false);
                                }}
                                className="px-3 py-2 text-sm text-token-text-secondary hover:bg-[#3E3E3E] hover:text-white cursor-pointer"
                            >
                                {m}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-token-text-tertiary hover:text-token-text-primary transition-colors text-left"
            >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </button>

            {/* Advanced Settings */}
            {showAdvanced && (
                <div className="flex flex-col gap-4 bg-[#252525] p-3 rounded-lg border border-[#333]">
                    {/* Temperature */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-token-text-secondary">
                            <span>Temperature</span>
                            <span>{temperature}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="2" step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Top P */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-token-text-secondary">
                            <span>Top P</span>
                            <span>{topP}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="1" step="0.05"
                            value={topP}
                            onChange={(e) => setTopP(parseFloat(e.target.value))}
                            className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                    {/* Context Limit */}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs text-token-text-secondary">
                            <span>Max History Turns (Sliding Window)</span>
                            <span>{contextLimit}</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" max="50" step="1"
                            value={contextLimit}
                            onChange={(e) => setContextLimit(parseInt(e.target.value))}
                            className="w-full h-1 bg-[#444] rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>

                     {/* Auto Summary Toggle (Black/White Style) */}
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-token-text-secondary">Auto-Summarize History</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={enableAutoSummary}
                                onChange={(e) => setEnableAutoSummary(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-white">
                                <div className={`absolute top-[2px] left-[2px] h-4 w-4 rounded-full transition-transform ${enableAutoSummary ? 'translate-x-full bg-black' : 'bg-white'}`}></div>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Status Message */}
            <div className={`text-xs text-center h-4 ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-green-400' : 'text-token-text-secondary'}`}>
                {statusMessage}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                    onClick={fetchModels}
                    className="bg-[#333] hover:bg-[#444] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    Fetch Models
                </button>
                <button 
                    onClick={testAndSave}
                    className="bg-white text-black hover:bg-gray-200 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    Test & Save
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ApiConfigModal;