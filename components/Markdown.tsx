import React, { memo, useState } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { CopyIcon } from './Icons';

interface MarkdownProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const handleCopy = () => {
    const text = String(children).replace(/\n$/, '');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return (
      <code className="bg-[#2F2F2F] text-token-text-primary px-1.5 py-0.5 rounded text-[0.9em] font-mono break-words" {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="rounded-lg bg-[#0d0d0d] border border-[#333] overflow-hidden my-4 w-full">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2F2F2F] border-b border-[#333]">
        <span className="text-xs text-token-text-secondary font-medium font-sans">
          {language || 'code'}
        </span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-token-text-secondary hover:text-white transition-colors"
        >
          {isCopied ? (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
            </>
          ) : (
            <>
                <CopyIcon className="w-3.5 h-3.5" />
                Copy code
            </>
          )}
        </button>
      </div>
      {/* Code Body */}
      <div className="overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        <code className={`!bg-transparent !p-0 font-mono text-sm leading-relaxed ${className}`} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

// Memoized component to prevent re-rendering entire markdown on small updates if props didn't change (though content usually changes)
const Markdown: React.FC<MarkdownProps> = memo(({ content, className = '' }) => {
  const components: Components = {
    code: CodeBlock,
    // Ensure links open in new tab
    a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />,
  };

  return (
    <div className={`prose prose-invert max-w-none break-words ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}, (prev, next) => prev.content === next.content && prev.className === next.className);

export default Markdown;