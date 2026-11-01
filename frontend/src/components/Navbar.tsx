import React from 'react';
import { useFarmer } from '../context/FarmerContext';
import {
  Home,
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

export type ActiveTab = 'landing' | 'dashboard' | 'advisory' | 'weather' | 'mandi' | 'camera' | 'scenario';

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
      id: 'landing' as ActiveTab,
      label: isHi ? 'होम' : 'Home',
      icon: Home,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: isHi ? 'खेत अवलोकन' : 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'advisory' as ActiveTab,
      label: isHi ? 'फसल सलाह AI' : 'Advisory AI',
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
      label: isHi ? 'रोग पहचान' : 'Crop Clinic',
      icon: Stethoscope,
    },
    {
      id: 'scenario' as ActiveTab,
      label: isHi ? 'मौसम सिमुलेटर' : 'Scenarios',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#241909] border-b border-[#3D2E14]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }}>
      {/* Top Main Row */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand Logo & Name */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F3B391] text-[#241909] flex items-center justify-center border border-[#E07B39]/40">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#FEFADC] block leading-none">
                AgroShield
              </span>
              <span className="text-[11px] font-medium text-[#C8A87A] mt-0.5 block leading-none">
                {isHi ? 'किसान सुरक्षा प्रणाली' : 'Agricultural Intelligence'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden lg:flex items-center space-x-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#F3B391] text-[#241909] font-semibold'
                      : 'text-[#C8B090] font-medium hover:bg-[#3D2E14] hover:text-[#F3B391]'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Utility: Farmer Identity, Language Switcher & Logout */}
          <div className="flex items-center space-x-2">
            {/* Farmer badge */}
            <div className="hidden sm:flex items-center space-x-2 bg-[#1A1005] px-3 py-1.5 rounded-lg border border-[#3A2E1A]">
              <User className="w-3.5 h-3.5 text-[#C8A87A]" />
              <div>
                <span className="text-xs font-semibold text-[#FEFADC] block leading-none">
                  {farmerName}
                </span>
                <span className="text-[10px] text-[#9A8060] mt-0.5 block leading-none">
                  {location}
                </span>
              </div>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#1A1005] p-1 rounded-lg border border-[#3A2E1A]">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isHi
                    ? 'bg-[#F3B391] text-[#241909]'
                    : 'text-[#9A8060] hover:text-[#FEFADC]'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  !isHi
                    ? 'bg-[#F3B391] text-[#241909]'
                    : 'text-[#9A8060] hover:text-[#FEFADC]'
                }`}
              >
                English
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1A1005] text-[#9A8060] border border-[#3A2E1A] hover:text-red-400 hover:border-red-800/50 text-xs font-medium transition-colors"
              title={isHi ? 'लॉग आउट' : 'Logout'}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isHi ? 'लॉग आउट' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Sub-Navigation Scroll Row */}
      <div className="lg:hidden bg-[#1A1005] border-t border-[#2E2210] overflow-x-auto py-1.5 px-3">
        <div className="flex space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#F3B391] text-[#241909] font-semibold'
                    : 'text-[#9A8060] hover:bg-[#2E2210] hover:text-[#C8B090]'
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
