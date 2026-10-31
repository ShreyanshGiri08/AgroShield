import React from 'react';
import { FarmarianMascot } from './FarmarianMascot';
import {
  LayoutDashboard,
  MessageSquare,
  CloudSun,
  Scale,
  Stethoscope,
  SlidersHorizontal,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'advisory' | 'weather' | 'mandi' | 'camera' | 'scenario';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  farmerName: string;
  location: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  language,
  onLanguageChange,
  farmerName,
  location,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: language === 'hi' ? 'खेत अवलोकन' : 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'advisory' as ActiveTab,
      label: language === 'hi' ? 'एआई सलाहकार' : 'Advisor & Trace',
      icon: MessageSquare,
    },
    {
      id: 'weather' as ActiveTab,
      label: language === 'hi' ? 'मौसम पूर्वानुमान' : 'Microclimate',
      icon: CloudSun,
    },
    {
      id: 'mandi' as ActiveTab,
      label: language === 'hi' ? 'मंडी बाजार' : 'Market Rates',
      icon: Scale,
    },
    {
      id: 'camera' as ActiveTab,
      label: language === 'hi' ? 'पादप क्लिनिक' : 'Plant Pathology',
      icon: Stethoscope,
    },
    {
      id: 'scenario' as ActiveTab,
      label: language === 'hi' ? 'परिदृश्य विश्लेषण' : 'Stress Simulator',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E3DDD1]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Mark */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange('dashboard')}
          >
            <FarmarianMascot state="welcoming" size={32} />
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-[#1A211B] font-display">
                AgroShield
              </span>
              <span className="text-[11px] text-[#576258] -mt-0.5 font-medium">
                Decision Support System
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#1E472D] text-[#F8F7F4]'
                      : 'text-[#576258] hover:text-[#1A211B] hover:bg-[#F0ECE1]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Utility: Plot Context & Language Toggle */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center text-xs text-[#576258] border-r border-[#E3DDD1] pr-3 space-x-1.5">
              <span className="font-medium text-[#1A211B]">{location}</span>
              <span className="text-[#859286]">•</span>
              <span>{farmerName}</span>
            </div>

            {/* Restrained Language Toggle */}
            <div className="flex items-center border border-[#E3DDD1] rounded bg-[#F8F7F4] p-0.5 text-[11px] font-medium">
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded transition ${
                  language === 'hi' ? 'bg-[#FFFFFF] text-[#1A211B] font-semibold shadow-sm' : 'text-[#576258]'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded transition ${
                  language === 'en' ? 'bg-[#FFFFFF] text-[#1A211B] font-semibold shadow-sm' : 'text-[#576258]'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav row */}
        <div className="md:hidden flex space-x-1 overflow-x-auto py-2 border-t border-[#E3DDD1] text-xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition ${
                  isActive ? 'bg-[#1E472D] text-white font-medium' : 'text-[#576258]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
