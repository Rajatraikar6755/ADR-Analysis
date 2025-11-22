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
  register: async (name: string, email: string, password: string, role: 'patient' | 'doctor') => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: role.toUpperCase() }),
    });
  },

  verifyOTP: async (email: string, otp: string) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resendOTP: async (email: string) => {
    return apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
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
    medications: any[],
    conditions: string,
    healthProfile: any,
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