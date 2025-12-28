// API Configuration
// When accessing from another device on the network, use your local IP
// When accessing locally, use localhost

const getApiUrl = () => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If we are on a custom domain or tunnel (not localhost), use the proxy
        // This avoids Mixed Content errors (HTTPS frontend -> HTTP backend)
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return '/api';
        }
    }

    // Default to localhost for local env, or use Env var
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();
