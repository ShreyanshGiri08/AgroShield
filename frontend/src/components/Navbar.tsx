import React from 'react';
import { FarmarianMascot } from './FarmarianMascot';
import {
  MapPin,
  Shield,
  Sparkles,
  CloudSun,
  TrendingUp,
  Camera,
  Sliders,
  Globe2,
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
      label: language === 'hi' ? 'कमांड सेंटर' : 'Command Center',
      icon: Shield,
    },
    {
      id: 'advisory' as ActiveTab,
      label: language === 'hi' ? 'फार्मरियन AI सलाहकार' : 'Farmarian AI & Trace',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'weather' as ActiveTab,
      label: language === 'hi' ? 'लाइव मौसम' : 'Live Climate',
      icon: CloudSun,
    },
    {
      id: 'mandi' as ActiveTab,
      label: language === 'hi' ? 'मंडी भाव राडार' : 'Mandi Radar',
      icon: TrendingUp,
    },
    {
      id: 'camera' as ActiveTab,
      label: language === 'hi' ? 'फसल क्लिनिक' : 'Crop Clinic',
      icon: Camera,
    },
    {
      id: 'scenario' as ActiveTab,
      label: language === 'hi' ? '"क्या अगर" सिमुलेटर' : 'What-If Sandbox',
      icon: Sliders,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0F1108]/90 backdrop-blur-2xl border-b border-[#F3B391]/20 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand header */}
        <div className="flex items-center justify-between h-20 border-b border-white/5">
          {/* Logo & Farmarian Mascot */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer group"
            onClick={() => onTabChange('dashboard')}
          >
            <div className="relative">
              <FarmarianMascot state="welcoming" size={48} className="transition-transform group-hover:scale-105" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0F1108] rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl font-black tracking-tight text-[#FEFADC] font-display">
                  Agro<span className="text-[#F3B391]">Shield</span>
                </span>
                <span className="bg-[#F3B391]/15 border border-[#F3B391]/40 text-[#F3B391] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live AI Active
                </span>
              </div>
              <p className="text-[11px] text-[#F6D4BA]/70 font-medium">
                {language === 'hi'
                  ? 'स्वायत्त हाइपरलोकल कृषि सुरक्षा प्रणाली'
                  : 'Hyperlocal AI Agricultural Defense Platform'}
              </p>
            </div>
          </div>

          {/* Location & Farmer Profile Pill & Language Selector */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Location Pill */}
            <div className="hidden md:flex items-center space-x-2 bg-white/[0.04] border border-white/10 rounded-full px-4 py-1.5 text-xs text-[#FEFADC] shadow-inner">
              <MapPin className="w-3.5 h-3.5 text-[#F3B391]" />
              <span className="font-semibold text-white">{location}</span>
              <span className="text-[#F6D4BA]/40">•</span>
              <span className="text-[#F6D4BA] font-medium">{farmerName}</span>
            </div>

            {/* Language Selector Pill */}
            <div className="flex items-center bg-[#1E160C] border border-[#F3B391]/30 rounded-full p-1 shadow-inner">
              <Globe2 className="w-3.5 h-3.5 text-[#F6D4BA] ml-2 mr-1 hidden sm:inline" />
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all duration-200 ${
                  language === 'hi'
                    ? 'bg-[#F3B391] text-[#241909] shadow-[0_0_12px_rgba(243,179,145,0.4)] scale-100'
                    : 'text-[#F6D4BA]/70 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-[#F3B391] text-[#241909] shadow-[0_0_12px_rgba(243,179,145,0.4)] scale-100'
                    : 'text-[#F6D4BA]/70 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <nav className="flex space-x-2 overflow-x-auto py-3 scrollbar-none text-xs font-semibold">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#F3B391] text-[#241909] font-black shadow-[0_0_20px_rgba(243,179,145,0.35)] scale-[1.02]'
                    : tab.highlight
                    ? 'bg-[#F3B391]/10 text-[#F3B391] hover:bg-[#F3B391]/20 border border-[#F3B391]/40'
                    : 'text-[#F6D4BA]/70 hover:bg-white/[0.06] hover:text-[#FEFADC]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#241909]' : tab.highlight ? 'text-[#F3B391]' : 'text-[#F6D4BA]/70'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.highlight && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F3B391] animate-ping" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
