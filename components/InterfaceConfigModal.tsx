import React, { useState, useEffect } from 'react';
import { InterfaceConfig } from '../types';

interface InterfaceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: InterfaceConfig;
  onSave: (config: InterfaceConfig) => void;
}

const InterfaceConfigModal: React.FC<InterfaceConfigModalProps> = ({ isOpen, onClose, initialConfig, onSave }) => {
  const [centerHeader, setCenterHeader] = useState(initialConfig.centerHeader);
  const [showAvatar, setShowAvatar] = useState(initialConfig.showAvatar);
  const [pureBlack, setPureBlack] = useState(initialConfig.pureBlack);

  useEffect(() => {
    if (isOpen) {
      setCenterHeader(initialConfig.centerHeader);
      setShowAvatar(initialConfig.showAvatar);
      setPureBlack(initialConfig.pureBlack ?? false);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
      onSave({ centerHeader, showAvatar, pureBlack });
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[340px] bg-[#1E1E1E] rounded-2xl shadow-2xl border border-[#333] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-5 flex flex-col gap-5">
            <h2 className="text-center text-token-text-primary font-semibold text-lg">Interface Settings</h2>
            
            <div className="flex flex-col gap-4">
                {/* Toggle: Center Header */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-token-text-primary">Center Header</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={centerHeader}
                            onChange={(e) => setCenterHeader(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white">
                             <div className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform ${centerHeader ? 'translate-x-full bg-black' : 'bg-white'}`}></div>
                        </div>
                    </label>
                </div>

                {/* Toggle: Show Avatar */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-token-text-primary">Show Avatar</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={showAvatar}
                            onChange={(e) => setShowAvatar(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white">
                            <div className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform ${showAvatar ? 'translate-x-full bg-black' : 'bg-white'}`}></div>
                        </div>
                    </label>
                </div>

                {/* Toggle: Pure Black Mode */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-token-text-primary">Pure Black (AMOLED)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={pureBlack}
                            onChange={(e) => setPureBlack(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#363636] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-gray-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white">
                            <div className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full transition-transform ${pureBlack ? 'translate-x-full bg-black' : 'bg-white'}`}></div>
                        </div>
                    </label>
                </div>
            </div>

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

export default InterfaceConfigModal;