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

// [SVG]: OpenAI Avatar Icon
export const OpenAIIcon: React.FC<IconProps> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.0462 6.0462 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9723V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1195 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0916-4.3665l3.2002-1.8542 3.2002 1.8542v3.7084l-3.2002 1.8542-3.2002-1.8542z"/>
  </svg>
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