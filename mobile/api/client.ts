import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Load environment variables
const developmentUrl = "http://172.31.133.222:3000/api";
const productionUrl = "https://moneymint-seven.vercel.app/api";

// Choose correct base URL
const API_BASE_URL = __DEV__ ? developmentUrl : productionUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token if available
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;