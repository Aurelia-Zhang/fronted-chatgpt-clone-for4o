import React, { useState, useEffect } from 'react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  onSave: (prompt: string) => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose, initialPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (isOpen) {
      setPrompt(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[340px] bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-5 flex flex-col gap-4">
            <h2 className="text-center text-token-text-primary font-semibold text-lg">System Prompt</h2>
            <p className="text-xs text-token-text-secondary text-center -mt-2">
              Instructions for how the AI should behave.
            </p>
            
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="w-full h-40 bg-[#2F2F2F] text-token-text-primary p-3 rounded-lg text-sm border border-transparent focus:border-white/20 focus:outline-none transition-colors resize-none"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                    onClick={onClose}
                    className="bg-[#333] hover:bg-[#444] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="bg-white text-black hover:bg-gray-200 py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    Save
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;