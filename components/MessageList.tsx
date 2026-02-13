import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Message } from '../types';
import { CopyIcon, SpeakerIcon, ThumbsUpIcon, ThumbsDownIcon, ShareIcon, DotsIcon, RegenerateIcon, EditIcon, NavLeftIcon, NavRightIcon, OpenAIIcon } from './Icons';

interface MessageListProps {
  messages: Message[];
  onEdit?: (messageId: string) => void;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onNavigate?: (messageId: string, direction: 'left' | 'right') => void;
  messageMap?: Record<string, Message>; // Used to look up sibling info
  showAvatar?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onEdit, onCopy, onRegenerate, onNavigate, messageMap, showAvatar = false }) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, messageId: string } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Auto-scroll Logic
  // Check if we should stick to bottom before update
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        // If user is within 100px of bottom, enable auto-scroll
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        shouldAutoScrollRef.current = isNearBottom;
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Perform scroll after update if needed
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // If it's a new message (length increased), force scroll
    // Or if we were already near bottom (streaming), keep scrolling
    // We can simply trust shouldAutoScrollRef for streaming updates
    
    // However, if messages.length increased (new user message or new AI response started), 
    // we almost always want to scroll to bottom to show it.
    // For streaming updates (same length, content changed), we use the ref check.
    
    // Simple heuristic: Always scroll to bottom for now as it's the expected "chat" behavior
    // unless the user has explicitly scrolled up far away.
    if (shouldAutoScrollRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);


  // Long Press Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent, msgId: string) => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      let clientX, clientY;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      // Vibrate if supported
      if (navigator.vibrate) navigator.vibrate(50);
      
      setContextMenu({
        x: clientX,
        y: clientY,
        messageId: msgId
      });
    }, 500); 
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); 
  };

  // Helper to render navigation controls
  const renderNavigation = (msg: Message) => {
    if (!messageMap || !msg.parentId) return null;
    const parent = messageMap[msg.parentId];
    if (!parent || parent.childrenIds.length <= 1) return null;

    const currentIndex = parent.childrenIds.indexOf(msg.id);
    const total = parent.childrenIds.length;
    const currentDisplay = currentIndex + 1;

    return (
        <div className="flex items-center gap-1 text-token-text-tertiary select-none font-medium text-xs mt-1">
            <button 
                className={`p-1 hover:text-token-text-primary ${currentIndex === 0 ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
                onClick={() => currentIndex > 0 && onNavigate && onNavigate(msg.id, 'left')}
                disabled={currentIndex === 0}
            >
                <NavLeftIcon className="w-3 h-3" />
            </button>
            <span>{currentDisplay} / {total}</span>
            <button 
                className={`p-1 hover:text-token-text-primary ${currentIndex === total - 1 ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
                onClick={() => currentIndex < total - 1 && onNavigate && onNavigate(msg.id, 'right')}
                disabled={currentIndex === total - 1}
            >
                <NavRightIcon className="w-3 h-3" />
            </button>
        </div>
    );
  };

  return (
    <div 
        ref={scrollContainerRef}
        className="flex flex-col flex-1 px-4 py-2 gap-6 overflow-y-auto no-scrollbar relative scroll-smooth"
    >
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex w-full group ${msg.role === 'user' ? 'justify-end' : 'justify-start items-start'}`}
        >
          {/* Avatar (Assistant Only) */}
          {msg.role === 'assistant' && showAvatar && (
              <div className="flex-shrink-0 mr-3 mt-0.5">
                  <div className="w-8 h-8 rounded-full border border-token-text-tertiary/20 flex items-center justify-center bg-token-main-surface-primary overflow-hidden">
                      {/* Scaled Image: w-full h-full fills the container, scale-[2.0] zooms in to 200% */}
                      <OpenAIIcon className="w-full h-full object-cover scale-[1.8]" />
                  </div>
              </div>
          )}

          {msg.role === 'user' ? (
            // User Message Bubble
            <div className="flex flex-col items-end max-w-[70%]">
                <div 
                className="bg-[#2F2F2F] text-token-text-primary px-4 py-2.5 rounded-[18px] text-[16px] leading-relaxed break-words whitespace-pre-wrap select-none touch-manipulation active:opacity-80 transition-opacity"
                onTouchStart={(e) => handleTouchStart(e, msg.id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onMouseDown={(e) => handleTouchStart(e, msg.id)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onContextMenu={handleContextMenu}
                >
                {msg.content}
                </div>
                {/* Navigation for User Messages */}
                {renderNavigation(msg)}
            </div>
          ) : (
            // Assistant Message
            <div className="flex flex-col w-full max-w-full gap-1">
              {/* Message Content */}
              <div className="text-token-text-primary text-[16px] leading-7 break-words whitespace-pre-wrap pr-4 pt-1">
                {msg.content}
              </div>
              
              {/* Action Bar */}
              <div className="flex items-center gap-2 mt-1 -ml-2 text-token-text-tertiary">
                 {/* Navigation for AI Messages is placed IN the row or above logic. 
                     Standard ChatGPT puts navigation on the USER message to switch branches, 
                     and also sometimes on AI message. We will support it here too if needed. 
                  */}
                 {renderNavigation(msg)}

                 <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-1.5 hover:text-token-text-primary hover:bg-[#2F2F2F] rounded-md transition-colors"><SpeakerIcon className="w-4 h-4" /></button>
                    <button 
                    className="p-1.5 hover:text-token-text-primary hover:bg-[#2F2F2F] rounded-md transition-colors"
                    onClick={() => onCopy && onCopy(msg.content)}
                    >
                        <CopyIcon className="w-4 h-4" />
                    </button>
                    
                    <button className="p-1.5 hover:text-token-text-primary hover:bg-[#2F2F2F] rounded-md transition-colors"><ThumbsUpIcon className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:text-token-text-primary hover:bg-[#2F2F2F] rounded-md transition-colors"><ThumbsDownIcon className="w-4 h-4" /></button>
                    
                    <button 
                    className="p-1.5 hover:text-token-text-primary hover:bg-[#2F2F2F] rounded-md transition-colors"
                    onClick={() => onRegenerate && onRegenerate(msg.id)}
                    title="Regenerate"
                    >
                        <RegenerateIcon className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      ))}
      {/* Spacer for bottom input area */}
      <div className="h-[20px]"></div>
      
      {/* Scroll Anchor */}
      <div ref={bottomRef} className="h-[1px]" />

      {/* Custom Context Menu for User Messages */}
      {contextMenu && (
        <>
          {/* Invisible Overlay to block interactions while menu is open */}
          <div className="fixed inset-0 z-[100]" onClick={() => setContextMenu(null)}></div>
          
          <div 
            className="fixed z-[101] bg-[#252525] border border-[#333] rounded-xl shadow-2xl py-1.5 min-w-[140px] flex flex-col animate-in fade-in zoom-in duration-150 origin-top-left"
            style={{ 
                top: Math.min(contextMenu.y, window.innerHeight - 150), 
                left: Math.min(contextMenu.x, window.innerWidth - 150) 
            }}
          >
            <button 
              className="flex items-center gap-3 px-4 py-3 text-token-text-primary hover:bg-[#333] transition-colors text-sm font-medium"
              onClick={() => {
                onEdit && onEdit(contextMenu.messageId);
                setContextMenu(null);
              }}
            >
              <EditIcon className="w-4 h-4" />
              Edit
            </button>
            <div className="h-[1px] bg-[#333] mx-2 my-0.5"></div>
            <button 
              className="flex items-center gap-3 px-4 py-3 text-token-text-primary hover:bg-[#333] transition-colors text-sm font-medium"
              onClick={() => {
                 // Find content
                 const msg = messages.find(m => m.id === contextMenu.messageId);
                 if (msg && onCopy) onCopy(msg.content);
                 setContextMenu(null);
              }}
            >
              <CopyIcon className="w-4 h-4" />
              Copy
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageList;