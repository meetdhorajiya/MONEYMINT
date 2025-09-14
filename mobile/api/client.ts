import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// For Android Emulator, use 10.0.2.2. 
// Use YOUR computer's IP address here!
const API_BASE_URL = 'http://172.31.133.222:3000/api'; // <-- Add /api here
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;