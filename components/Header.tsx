import React from 'react';
import { MenuIcon, DotsIcon, ChevronRightIcon, EditIcon } from './Icons';

interface HeaderProps {
    centerHeader?: boolean;
    pureBlack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ centerHeader = false, pureBlack = false }) => {
  return (
    <header className={`sticky top-0 z-50 flex items-center px-3 h-header-height backdrop-blur-sm pt-safe transition-all relative ${pureBlack ? 'bg-black/95' : 'bg-token-main-surface-primary/95'}`}>
      
      {/* Left Group: Menu */}
      {/* Removed flex-1 so it doesn't push neighbors away */}
      <div className="flex items-center flex-shrink-0 z-10">
        <button className="p-2 text-token-text-secondary active:opacity-50 hover:bg-[#2F2F2F] rounded-lg transition-colors">
          <MenuIcon className="w-[24px] h-[24px]" />
        </button>
      </div>

      {/* Model Selector */}
      {/* Logic: If centered, use absolute positioning. If not, normal flex flow (sits next to menu) */}
      <div className={`
        flex items-center transition-all duration-300
        ${centerHeader 
            ? 'absolute left-1/2 -translate-x-1/2 z-0' 
            : 'ml-0 relative z-10' // ml-0 keeps it close to the menu
        }
      `}>
         <button className="flex items-center px-2 py-1.5 rounded-lg hover:bg-[#2F2F2F] transition-colors text-[18px] font-medium text-token-text-primary active:opacity-50">
          <span className="tracking-tight mr-1">ChatGPT</span>
          <span className="text-token-text-secondary font-normal text-[18px]">4o</span>
          <ChevronRightIcon className="w-[16px] h-[16px] mt-[1px] ml-1.5 opacity-50 translate-y-[1px]" />
        </button>
      </div>

      {/* Right Group: Actions */}
      {/* ml-auto forces this group to the far right */}
      <div className="flex items-center ml-auto flex-shrink-0 z-10">
        <button className="p-2 text-token-text-primary active:opacity-50 hover:bg-[#2F2F2F] rounded-lg transition-colors">
          <EditIcon className="w-[24px] h-[24px]" />
        </button>
        <button className="p-2 text-token-text-primary active:opacity-50 hover:bg-[#2F2F2F] rounded-lg transition-colors">
          <DotsIcon className="w-[24px] h-[24px]" />
        </button>
      </div>
    </header>
  );
};

export default Header;