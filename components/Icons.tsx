import React from 'react';

interface IconProps {
  className?: string;
  strokeWidth?: number;
  onClick?: () => void;
}

// Helper for image icons to ensure consistent behavior
const ImgIcon = ({ src, alt, className, onClick }: { src: string, alt: string, className?: string, onClick?: () => void }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`object-contain select-none ${onClick ? 'cursor-pointer' : 'pointer-events-none'} ${className}`} 
    draggable={false}
    onClick={onClick}
  />
);

// [ASSET]: Hamburger Menu Icon (Top Left) -> leftopenfolder.png
export const MenuIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea68612095.webp" 
    alt="Menu" 
    className={className} 
  />
);

// [ASSET]: New Chat / Edit Icon (Top Right) -> newchat.png
export const EditIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea691366d4.webp" 
    alt="New Chat" 
    className={className} 
  />
);

// [ASSET]: Three Dots / Options Icon (Top Right & Message Actions) -> more.png
export const DotsIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea6913b9e6.webp" 
    alt="More" 
    className={className} 
  />
);

// [ASSET]: Model Selector Chevron -> modelselect.png (Updated)
export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea6887291c.webp" 
    alt="Select Model" 
    className={className} 
  />
);

// [SVG]: Plus Icon (Input Left)
export const PlusIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

// [SVG]: Upload Icon for Import
export const UploadIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// [SVG]: Download Icon for Export
export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// [SVG]: Settings Icon
export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

// [SVG]: Logs Icon
export const LogsIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

// [IMG]: OpenAI Avatar Icon (High Quality SVG URL)
// Updated to user provided WebP image without invert filter
export const OpenAIIcon: React.FC<IconProps> = ({ className }) => (
  <img 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ecbdb1ee37.webp" 
    alt="ChatGPT" 
    className={`${className} select-none pointer-events-none`}
    draggable={false}
  />
);


// [ASSET]: Microphone Icon (Input Right) -> microphone.png
export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698e8508ac324.webp" 
    alt="Mic" 
    className={className} 
  />
);

// [ASSET]: Headphone/Voice Mode Icon (Bottom Right) -> voice-right.png
export const HeadphoneIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698e830a739de.webp" 
    alt="Voice Mode" 
    className={className} 
  />
);

// [ASSET]: Send Icon -> send.png
export const SendIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698e9ae8cf523.webp" 
    alt="Send" 
    className={className} 
  />
);

// [ASSET]: Stop Icon -> stop.png
export const StopIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698e9ae62bdaf.webp" 
    alt="Stop" 
    className={className} 
  />
);

// Action Icons

// [ASSET]: Copy -> copy.png
export const CopyIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea685c0ec5.webp" 
    alt="Copy" 
    className={className} 
  />
);

// [ASSET]: Speaker -> readaloud.png
export const SpeakerIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea67a04391.webp" 
    alt="Read Aloud" 
    className={className} 
  />
);

// [ASSET]: Good -> good.png
export const ThumbsUpIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea6860e7ce.webp" 
    alt="Good" 
    className={className} 
  />
);

// [ASSET]: Bad -> bad.png
export const ThumbsDownIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea6860a830.webp" 
    alt="Bad" 
    className={className} 
  />
);

// [ASSET]: Share -> share.png
export const ShareIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698ea6911b908.webp" 
    alt="Share" 
    className={className} 
  />
);

// [ASSET]: Regenerate -> regenerate.png
export const RegenerateIcon: React.FC<IconProps> = ({ className }) => (
  <ImgIcon 
    src="https://youke.xn--y7xa690gmna.cn/s1/2026/02/13/698eac81ed8c7.webp" 
    alt="Regenerate" 
    className={className} 
  />
);

// Navigation Chevrons for Message Branching
export const NavLeftIcon: React.FC<IconProps> = ({ className, onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

export const NavRightIcon: React.FC<IconProps> = ({ className, onClick }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} onClick={onClick}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);