
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const httpClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Rotas públicas que NUNCA devem enviar o token Authorization.
// Enviar um token expirado para essas rotas causa 401 no DRF
// antes mesmo de verificar a permissão AllowAny.
const PUBLIC_URLS = [
    '/auth/login/',
    '/auth/register/',
    '/auth/refresh/',
    '/auth/password-reset/',
    '/auth/password-reset-confirm/',
];

// Interceptor de request: injeta o token JWT apenas em rotas privadas
httpClient.interceptors.request.use(
    (config) => {
        const url = config.url ?? '';
        const isPublic = PUBLIC_URLS.some((pub) => url.includes(pub));

        if (!isPublic) {
            const token = localStorage.getItem('mypet:access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de response: renova token automaticamente se expirado
httpClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se recebeu 401 e ainda não tentou renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('mypet:refresh_token');
            if (!refreshToken) {
                // Sem refresh token, força logout
                localStorage.removeItem('mypet:access_token');
                localStorage.removeItem('mypet:refresh_token');
                localStorage.removeItem('mypet:user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                    refresh: refreshToken,
                });

                const { access, refresh } = response.data;
                localStorage.setItem('mypet:access_token', access);
                if (refresh) {
                    localStorage.setItem('mypet:refresh_token', refresh);
                }

                // Refaz a requisição original com o novo token
                originalRequest.headers.Authorization = `Bearer ${access}`;
                return httpClient(originalRequest);
            } catch (refreshError) {
                // Refresh falhou, força logout
                localStorage.removeItem('mypet:access_token');
                localStorage.removeItem('mypet:refresh_token');
                localStorage.removeItem('mypet:user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default httpClient;
