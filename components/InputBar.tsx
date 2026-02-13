import React, { useRef, useEffect } from 'react';
import { PlusIcon, MicIcon, HeadphoneIcon, SendIcon, StopIcon, EditIcon, MenuIcon, UploadIcon, DownloadIcon, SettingsIcon, LogsIcon } from './Icons';

interface InputBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPlusClick: () => void;
  isLoading?: boolean;
  onSend?: () => void;
  onStop?: () => void;
  isMenuOpen?: boolean;
  onMenuSelect?: (option: 'api' | 'system' | 'import' | 'export' | 'interface' | 'logs') => void;
  onCloseMenu?: () => void;
  pureBlack?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ 
  value, 
  onChange, 
  onPlusClick,
  isLoading = false,
  onSend,
  onStop,
  isMenuOpen = false,
  onMenuSelect,
  onCloseMenu,
  pureBlack = false
}) => {
  const hasText = value.trim().length > 0;
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to correctly calculate new scrollHeight
      textarea.style.height = '24px'; 
      const newHeight = Math.min(textarea.scrollHeight, 150); // Max height 150px
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Desktop: Enter sends, Shift+Enter new line
    // Mobile: Enter usually creates new line naturally
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isLoading && hasText && onSend) {
            onSend();
        }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (onCloseMenu) onCloseMenu();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, onCloseMenu]);

  return (
    <div className={`w-full pb-safe relative px-3 pt-2 ${pureBlack ? 'bg-black' : 'bg-token-main-surface-primary'}`}>
      
      {/* Action Menu - Popups upwards from the Plus button */}
      {isMenuOpen && (
        <div 
            ref={menuRef}
            className="absolute bottom-[calc(100%-8px)] left-4 w-52 bg-[#2F2F2F] border border-[#444] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
            <button 
                onClick={() => onMenuSelect && onMenuSelect('interface')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><SettingsIcon className="w-5 h-5" /></div>
                Interface Settings
            </button>
            <div className="h-[1px] bg-[#444] w-full" />
            <button 
                onClick={() => onMenuSelect && onMenuSelect('api')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><EditIcon className="w-5 h-5" /></div>
                API Configuration
            </button>
            <div className="h-[1px] bg-[#444] w-full" />
            <button 
                onClick={() => onMenuSelect && onMenuSelect('system')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><MenuIcon className="w-5 h-5" /></div>
                System Prompt
            </button>
            <div className="h-[1px] bg-[#444] w-full" />
            <button 
                onClick={() => onMenuSelect && onMenuSelect('logs')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><LogsIcon className="w-5 h-5" /></div>
                Debug Logs
            </button>
             <div className="h-[1px] bg-[#444] w-full" />
            <button 
                onClick={() => onMenuSelect && onMenuSelect('import')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><UploadIcon className="w-5 h-5" /></div>
                Import Chat
            </button>
            <div className="h-[1px] bg-[#444] w-full" />
            <button 
                onClick={() => onMenuSelect && onMenuSelect('export')}
                className="flex items-center gap-3 px-4 py-3.5 text-sm text-token-text-primary hover:bg-[#3E3E3E] transition-colors text-left"
            >
                <div className="w-5 h-5 flex items-center justify-center opacity-70"><DownloadIcon className="w-5 h-5" /></div>
                Export Chat
            </button>
        </div>
      )}

      {/* Unified Composer Container */}
      {/* Changed items-center to items-end for bottom alignment as height grows */}
      <div className="flex items-end min-h-[52px] relative z-10 bg-[#2F2F2F] rounded-[26px] px-2 shadow-sm transition-colors duration-200 py-[8px]">
        
        {/* Plus Button (Inside Pill) */}
        <button 
          onClick={onPlusClick}
          aria-label="Add attachment"
          className={`flex-shrink-0 w-[36px] h-[36px] rounded-full flex items-center justify-center text-token-text-primary active:bg-[#444] transition-all ml-1 ${isMenuOpen ? 'bg-[#444] rotate-45' : 'bg-[#3E3E3E]'}`}
        >
          <PlusIcon className="w-5 h-5" />
        </button>

        {/* Input Field - Changed to Textarea */}
        <textarea
            ref={textareaRef}
            placeholder="Ask anything"
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            // Logic for alignment: 
            // py-[7px] creates correct vertical center for single line (24px line height + 14px padding = ~38px content box + borders/margins)
            // leading-[24px] matches standard text height
            className="flex-1 bg-transparent text-token-text-primary text-[16px] placeholder-[#8E8E8E] focus:outline-none min-w-0 resize-none max-h-[150px] overflow-y-auto px-3 py-[7px] mx-0 leading-[24px]"
            style={{ 
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none'  // IE
            }}
        />
          
        {/* Right Actions: Mic or Send/Stop */}
        <div className="flex items-center gap-1 pr-1 pb-[0px]"> 
             {/* Microphone (Hidden when typing) */}
             <button 
                className={`text-token-text-primary flex items-center justify-center transition-all duration-200 h-[36px] ${hasText || isLoading ? 'w-0 opacity-0 overflow-hidden' : 'w-9 opacity-100'}`}
                aria-label="Dictate"
             >
                <MicIcon className="w-8 h-8" />
             </button>

             {/* Dynamic Action Button: Send / Stop / Headphone */}
             <button 
               onClick={isLoading ? onStop : (hasText ? onSend : undefined)}
               className={`flex items-center justify-center w-[36px] h-[36px] rounded-full transition-all duration-200 ${isLoading ? 'bg-token-text-primary text-[#2F2F2F]' : 'bg-transparent text-token-text-primary'}`}
               aria-label={isLoading ? "Stop" : hasText ? "Send" : "Voice Mode"}
             >
               {isLoading ? (
                  <div className="w-3 h-3 bg-[#2F2F2F] rounded-sm" />
               ) : hasText ? (
                  <SendIcon className="w-8 h-8" />
               ) : (
                  <HeadphoneIcon className="w-12 h-12" />
               )}
             </button>
        </div>

      </div>
      
      {/* Bottom spacer within safe area */}
      <div className="h-2" />
    </div>
  );
};

export default InputBar;