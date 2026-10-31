import React from 'react';
import { useFarmer } from '../context/FarmerContext';
import {
  LayoutDashboard,
  MessageSquare,
  CloudSun,
  Scale,
  Stethoscope,
  SlidersHorizontal,
  LogOut,
  Shield,
  User,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'advisory' | 'weather' | 'mandi' | 'camera' | 'scenario';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: string;
  farmerName: string;
  location: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  language,
  farmerName,
  location,
}) => {
  const { setLanguage, logout } = useFarmer();
  const isHi = language === 'hi';

  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: isHi ? 'खेत अवलोकन' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'advisory' as ActiveTab,
      label: isHi ? 'फसल सलाह' : 'Advisory AI',
      icon: MessageSquare,
    },
    {
      id: 'weather' as ActiveTab,
      label: isHi ? 'मौसम' : 'Weather',
      icon: CloudSun,
    },
    {
      id: 'mandi' as ActiveTab,
      label: isHi ? 'मंडी भाव' : 'Mandi Rates',
      icon: Scale,
    },
    {
      id: 'camera' as ActiveTab,
      label: isHi ? 'रोग पहचान' : 'Crop Health',
      icon: Stethoscope,
    },
    {
      id: 'scenario' as ActiveTab,
      label: isHi ? 'मौसम सिमुलेटर' : 'Scenarios',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 shadow-md bg-[#241909] border-b-2 border-[#E8C99A]">
      {/* Top Main Row */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F3B391] text-[#241909] flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-[#FEFADC] block leading-none">
                AgroShield
              </span>
              <span className="text-[11px] font-semibold text-[#D4A876] mt-0.5 block leading-none">
                {isHi ? 'किसान सुरक्षा प्रणाली' : 'Agricultural Intelligence'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-[#F3B391] text-[#241909] shadow-md scale-[1.02]'
                      : 'text-[#FEFADC] hover:bg-[#3D2E14] hover:text-[#F3B391]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Utility: Farmer Identity, Dual Language Switcher & Logout */}
          <div className="flex items-center space-x-3">
            {/* Farmer badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#1A1005] px-3 py-1.5 rounded-xl border border-[#4A3820]">
              <User className="w-4 h-4 text-[#F3B391]" />
              <div className="text-right">
                <span className="text-xs font-bold text-[#FEFADC] block leading-none">
                  {farmerName}
                </span>
                <span className="text-[10px] font-medium text-[#C8B090] mt-0.5 block leading-none">
                  {location}
                </span>
              </div>
            </div>

            {/* Clear Dual-Button Language Switcher */}
            <div className="flex items-center bg-[#1A1005] p-1 rounded-xl border border-[#4A3820]">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isHi
                    ? 'bg-[#F3B391] text-[#241909] shadow'
                    : 'text-[#C8B090] hover:text-[#FEFADC]'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  !isHi
                    ? 'bg-[#F3B391] text-[#241909] shadow'
                    : 'text-[#C8B090] hover:text-[#FEFADC]'
                }`}
              >
                English
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 text-red-300 border border-red-800/50 hover:bg-red-900/60 text-xs font-bold transition-all"
              title={isHi ? 'लॉग आउट' : 'Logout'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHi ? 'लॉग आउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scroll Row */}
      <div className="lg:hidden bg-[#1A1005] border-t border-[#4A3820] overflow-x-auto py-2 px-3">
        <div className="flex space-x-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#F3B391] text-[#241909] shadow-sm'
                    : 'text-[#FEFADC] hover:bg-[#3D2E14]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
