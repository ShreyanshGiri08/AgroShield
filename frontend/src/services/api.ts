import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FarmerProfileData {
  user_id: string;
  full_name: string;
  phone_number: string;
  preferred_language: string;
  location: {
    state: string;
    district: string;
    village: string;
    latitude: number;
    longitude: number;
  };
  farm: {
    name: string;
    area_acres: number;
    soil_type: string;
    irrigation_source: string;
  };
  crop: {
    name: string;
    hindi_name: string;
    sowing_date: string;
    status: string;
  };
}

export const fetchFarmerProfile = async (phoneNumber: string): Promise<FarmerProfileData> => {
  const res = await apiClient.get(`/api/farmers/${phoneNumber}`);
  return res.data;
};

export const fetchLiveWeather = async (lat: number, lon: number) => {
  const res = await apiClient.get('/api/weather/live', {
    params: { latitude: lat, longitude: lon },
  });
  return res.data;
};

export const fetchMandiPrices = async (state: string, district?: string, commodity?: string) => {
  const res = await apiClient.get('/api/mandi/prices', {
    params: { state, district, commodity, limit: 15 },
  });
  return res.data;
};

export const runAdvisoryQuery = async (userId: string, queryText: string, language: string = 'hi') => {
  const res = await apiClient.post('/api/advisory/ask', {
    user_id: userId,
    query_text: queryText,
    language,
  });
  return res.data;
};

export const simulateScenario = async (params: {
  crop_name: string;
  growth_stage_name?: string;
  latitude: number;
  longitude: number;
  delta_rain_mm: number;
  delta_temp_c: number;
}) => {
  const res = await apiClient.post('/api/risk/scenario', params);
  return res.data;
};

export const analyzeCropPhoto = async (formData: FormData) => {
  const res = await apiClient.post('/api/diagnosis/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
