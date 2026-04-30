import { Platform } from 'react-native';

// Dynamically determine the local API URL based on the platform and environment.
let LOCAL_URL = 'http://localhost:5035';

if (Platform.OS === 'android') {
  // Android emulators need 10.0.2.2 to reach the host machine's localhost
  LOCAL_URL = 'http://10.0.2.2:5035';
} else if (Platform.OS === 'web' && typeof window !== 'undefined') {
  // If running in a web browser, use the actual hostname the browser is accessing
  // to avoid CORS mismatch when accessing via a local network IP (e.g., 192.168.x.x)
  LOCAL_URL = `http://${window.location.hostname}:5035`;
}

export const API_BASE_URL = LOCAL_URL; 

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
