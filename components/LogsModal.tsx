import React from 'react';
import { LogEntry } from '../types';

interface LogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: LogEntry[];
  onClear: () => void;
}

const LogsModal: React.FC<LogsModalProps> = ({ isOpen, onClose, logs, onClear }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[90vw] md:max-w-[600px] h-[80vh] bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#252525]">
            <h2 className="text-token-text-primary font-semibold text-lg">Debug Logs</h2>
            <div className="flex gap-2">
                <button 
                    onClick={onClear}
                    className="px-3 py-1.5 text-xs bg-red-900/50 text-red-200 rounded hover:bg-red-900 transition-colors"
                >
                    Clear
                </button>
                <button 
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs bg-[#444] text-white rounded hover:bg-[#555] transition-colors"
                >
                    Close
                </button>
            </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {logs.length === 0 ? (
                <div className="text-center text-token-text-tertiary mt-10">No logs recorded yet.</div>
            ) : (
                logs.slice().reverse().map((log) => (
                    <div key={log.id} className="bg-[#2F2F2F] rounded-lg p-3 border border-[#444] text-xs font-mono">
                        <div className="flex justify-between items-start mb-2 border-b border-[#444] pb-2">
                            <span className="text-green-400 font-bold">{log.method}</span>
                            <span className="text-token-text-tertiary">{log.timestamp}</span>
                        </div>
                        <div className="mb-2">
                            <span className="text-token-text-secondary block mb-1">URL:</span>
                            <div className="bg-black/30 p-1.5 rounded break-all text-blue-300">{log.url}</div>
                        </div>
                        
                        {/* Token Usage */}
                        {log.tokens && (
                            <div className="mb-2 bg-[#1a1a1a] p-2 rounded border border-green-900/30">
                                <div className="text-green-400 font-bold mb-1">Token Usage:</div>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="bg-[#333] p-1 rounded">
                                        <div className="text-[10px] text-gray-400">Input</div>
                                        <div className="text-white">{log.tokens.prompt_tokens}</div>
                                    </div>
                                    <div className="bg-[#333] p-1 rounded">
                                        <div className="text-[10px] text-gray-400">Cache</div>
                                        <div className="text-blue-200">{log.tokens.prompt_tokens_details?.cached_tokens || 0}</div>
                                    </div>
                                    <div className="bg-[#333] p-1 rounded">
                                        <div className="text-[10px] text-gray-400">Output</div>
                                        <div className="text-white">{log.tokens.completion_tokens}</div>
                                    </div>
                                </div>
                                <div className="mt-1 text-right text-gray-400 text-[10px]">Total: {log.tokens.total_tokens}</div>
                            </div>
                        )}

                        <div className="mb-2">
                            <span className="text-token-text-secondary block mb-1">Request Body:</span>
                            <div className="bg-black/30 p-2 rounded overflow-x-auto whitespace-pre text-gray-300 max-h-32 custom-scrollbar">
                                {JSON.stringify(log.requestBody, null, 2)}
                            </div>
                        </div>

                        <div>
                            <span className="text-token-text-secondary block mb-1">Response: <span className={log.responseStatus >= 400 ? 'text-red-400' : 'text-green-400'}>({log.responseStatus})</span></span>
                            <div className="bg-black/30 p-2 rounded overflow-x-auto whitespace-pre-wrap text-gray-300 max-h-40 custom-scrollbar">
                                {log.responseBody}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default LogsModal;
