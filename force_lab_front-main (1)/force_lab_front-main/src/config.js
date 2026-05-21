const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    endpoints: {
        auth: '/api/auth',
        trainings: '/api/trainings'
    }
};

export default API_CONFIG;