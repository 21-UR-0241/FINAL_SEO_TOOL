export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Add this debug line
console.log('🔍 [API Config] API_URL =', API_URL);
console.log('🔍 [API Config] VITE_API_URL =', import.meta.env.VITE_API_URL);