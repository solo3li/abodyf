import { Platform } from 'react-native';

// Dynamically determine the local API URL based on the platform and environment.
const PRODUCTION_URL = 'https://server-production-8fb9.up.railway.app';
const DEVELOPMENT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5035' : 'http://localhost:5035';

export const API_BASE_URL = PRODUCTION_URL; 

export const API_URL = `${API_BASE_URL}/api`;

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    ...options.headers as Record<string, string>,
  };

  if (!(options.body instanceof FormData)) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  } else {
    // CRITICAL: When sending FormData, the browser/fetch must set the Content-Type 
    // including the boundary. If we set it manually, it will fail.
    delete headers['Content-Type'];
  }

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) return null;

  try {
      return await response.json();
  } catch(e) {
      return null;
  }
};
