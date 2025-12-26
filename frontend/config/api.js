// API Configuration
// When accessing from another device on the network, use your local IP
// When accessing locally, use localhost

const getApiUrl = () => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;

        // If accessing via network IP, use that IP for API calls
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:8000`;
        }
    }

    // Default to localhost:8000 for local development
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const API_URL = getApiUrl();
