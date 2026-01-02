// API Configuration
// When accessing from another device on the network, use your local IP
// When accessing locally, use localhost

const getApiUrl = () => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
        // Always use the local proxy path in the browser.
        // This ensures Next.js rewrites handle the request to the backend,
        // which avoids CORS and allows access via local network IP.
        return '/api';
    }

    // Default to localhost for local env, or use Env var for production build
    return process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
};

export const API_URL = getApiUrl();
