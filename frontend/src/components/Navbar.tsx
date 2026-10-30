import React from 'react';
import { FarmarianMascot } from './FarmarianMascot';
import { MapPin, Shield, Sparkles, CloudSun, TrendingUp, Camera, Sliders } from 'lucide-react';

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
  return (
    <header className="bg-coffee text-cornsilk shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Farmarian Mascot */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <FarmarianMascot state="welcoming" size={48} />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-cornsilk">AgroShield</span>
                <span className="bg-peach text-coffee text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live AI
                </span>
              </div>
              <p className="text-xs text-sand/80 font-medium">Your Farm's Intelligent Protection System</p>
            </div>
          </div>

          {/* Location & Farmer Profile Pill */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-coffee-800/80 border border-sand/20 rounded-full px-4 py-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-peach" />
              <span className="font-semibold text-cornsilk">{location}</span>
              <span className="text-sand/40">•</span>
              <span className="text-sand">{farmerName}</span>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center bg-pitch/40 border border-sand/20 rounded-full p-0.5">
              <button
                onClick={() => onLanguageChange('hi')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  language === 'hi' ? 'bg-peach text-coffee shadow-sm' : 'text-sand hover:text-cornsilk'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  language === 'en' ? 'bg-peach text-coffee shadow-sm' : 'text-sand hover:text-cornsilk'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile-friendly scrollable bar) */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-sand/10 pt-2 text-xs font-semibold">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
          </button>

          <button
            onClick={() => onTabChange('advisory')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'advisory'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-peach-dark" />
            <span>{language === 'hi' ? 'एआई सलाहकार' : 'AI Advisory'}</span>
          </button>

          <button
            onClick={() => onTabChange('weather')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'weather'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मौसम व जोखिम' : 'Weather & Risk'}</span>
          </button>

          <button
            onClick={() => onTabChange('mandi')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'mandi'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मंडी भाव' : 'Mandi Rates'}</span>
          </button>

          <button
            onClick={() => onTabChange('camera')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'camera'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फसल जांच (कैमरा)' : 'Crop Inspection'}</span>
          </button>

          <button
            onClick={() => onTabChange('scenario')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'scenario'
                ? 'bg-peach text-coffee font-bold'
                : 'text-sand/80 hover:bg-coffee-800 hover:text-cornsilk'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? '"क्या अगर" सिमुलेटर' : 'What-If Sandbox'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
