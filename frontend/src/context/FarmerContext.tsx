import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { FarmerProfileData, CropData } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type { FarmerProfileData, CropData };

export interface FarmerContextType {
  farmer: FarmerProfileData | null;
  language: string;
  activeCrop: CropData | null;
  setActiveCrop: (crop: CropData) => void;
  setLanguage: (lang: string) => void;
  setFarmer: (farmer: FarmerProfileData | null) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'agroshield_farmer';
const LANG_STORAGE_KEY = 'agroshield_language';

// ─── Context ──────────────────────────────────────────────────────────────────

const FarmerContext = createContext<FarmerContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface FarmerProviderProps {
  children: ReactNode;
}

export const FarmerProvider: React.FC<FarmerProviderProps> = ({ children }) => {
  // ── Initialise from localStorage eagerly (avoids a flash of logged-out UI) ──
  const [farmer, setFarmerState] = useState<FarmerProfileData | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as FarmerProfileData;
    } catch {
      return null;
    }
  });

  const [language, setLanguageState] = useState<string>(() => {
    try {
      return (
        localStorage.getItem(LANG_STORAGE_KEY) ||
        (farmer?.preferred_language ?? 'hi')
      );
    } catch {
      return 'hi';
    }
  });

  // Track the active crop currently being viewed (defaults to first crop)
  const [activeCrop, setActiveCropState] = useState<CropData | null>(() => {
    if (farmer?.crop) return farmer.crop;
    if (farmer?.crops && farmer.crops.length > 0) return farmer.crops[0];
    return null;
  });

  // Whenever farmer changes, sync active crop
  useEffect(() => {
    if (farmer) {
      if (farmer.crop) {
        setActiveCropState(farmer.crop);
      } else if (farmer.crops && farmer.crops.length > 0) {
        setActiveCropState(farmer.crops[0]);
      }
    } else {
      setActiveCropState(null);
    }
  }, [farmer]);

  // ── Sync farmer → localStorage whenever it changes ────────────────────────
  useEffect(() => {
    if (farmer) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(farmer));
      } catch {
        // quota exceeded — silently ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [farmer]);

  // ── Sync language → localStorage ─────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch {
      // quota exceeded — silently ignore
    }
  }, [language]);

  // ── Public setters ────────────────────────────────────────────────────────

  const setFarmer = useCallback((data: FarmerProfileData | null) => {
    setFarmerState(data);
    if (data?.preferred_language) {
      setLanguageState(data.preferred_language);
    }
    if (data?.crop) {
      setActiveCropState(data.crop);
    } else if (data?.crops && data.crops.length > 0) {
      setActiveCropState(data.crops[0]);
    }
  }, []);

  const setActiveCrop = useCallback((crop: CropData) => {
    setActiveCropState(crop);
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
  }, []);

  const logout = useCallback(() => {
    setFarmerState(null);
    setActiveCropState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isLoggedIn = farmer !== null;

  const value: FarmerContextType = {
    farmer,
    language,
    activeCrop,
    setActiveCrop,
    setLanguage,
    setFarmer,
    logout,
    isLoggedIn,
  };

  return (
    <FarmerContext.Provider value={value}>
      {children}
    </FarmerContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useFarmer = (): FarmerContextType => {
  const ctx = useContext(FarmerContext);
  if (!ctx) {
    throw new Error('useFarmer must be used inside <FarmerProvider>');
  }
  return ctx;
};

export default FarmerContext;
