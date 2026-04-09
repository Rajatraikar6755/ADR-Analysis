const API_BASE_URL = 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Add auth token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Content-Type for JSON if body is present and not FormData
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth API
export const authAPI = {
  loginWithGoogle: async (idToken: string, role?: 'patient' | 'doctor', licenseNumber?: string, licenseDocument?: File) => {
    const formData = new FormData();
    formData.append('idToken', idToken);
    
    if (role) {
      formData.append('role', role.toUpperCase());
    }
    
    if (role === 'doctor' && licenseDocument) {
      formData.append('licenseDocument', licenseDocument);
      if (licenseNumber) {
        formData.append('licenseNumber', licenseNumber);
      }
    }

    return apiRequest('/auth/google', {
      method: 'POST',
      body: formData,
    });
  },
};

// AI Assistant API
export const aiAPI = {
  sendMessage: async (message: string, image?: File) => {
    const formData = new FormData();
    formData.append('message', message);
    if (image) {
      formData.append('image', image);
    }

    return apiRequest('/ai-assistant', {
      method: 'POST',
      body: formData,
    });
  },
};

// Assessment API
export const assessmentAPI = {
  assessRisk: async (
    medications: unknown[],
    conditions: string,
    healthProfile: Record<string, unknown>,
    document?: File
  ) => {
    const formData = new FormData();
    formData.append('medications', JSON.stringify(medications));
    formData.append('conditions', conditions);
    formData.append('healthProfile', JSON.stringify(healthProfile));
    if (document) {
      formData.append('document', document);
    }

    return apiRequest('/assess-risk', {
      method: 'POST',
      body: formData,
    });
  },
};

// Doctors API
export const doctorsAPI = {
  findNearby: async (lat: number, lon: number, radius: string = '5000') => {
    return apiRequest(`/nearby-doctors?lat=${lat}&lon=${lon}&radius=${radius}`);
  },
};