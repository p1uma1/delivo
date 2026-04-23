import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important to send refresh token cookies
});

// Request Interceptor: Add the access token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using the httpOnly cookie
        const refreshResponse = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true 
        });

        const { accessToken, user } = refreshResponse.data.data;
        
        // Save new token
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        // Update the failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (e.g. cookie expired), log out the user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Force reload to trigger auth flow
        window.location.href = '/'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
