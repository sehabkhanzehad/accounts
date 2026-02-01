import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/auth/sign-in')) {
            // Token expired, clear storage and redirect (but not for sign-in)
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Analytics API
export const analyticsApi = {
    getDashboard: (yearId) => api.get('/analytics/dashboard', { params: { year_id: yearId } }),
    getIncomeExpense: (yearId, period = 'monthly') => 
        api.get('/analytics/income-expense', { params: { year_id: yearId, period } }),
    getTopPerformers: (limit = 5) => 
        api.get('/analytics/top-performers', { params: { limit } }),
    getYears: () => api.get('/analytics/years'),
};

export default api;