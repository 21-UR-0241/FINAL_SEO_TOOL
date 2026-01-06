// export const API_URL = import.meta.env.VITE_API_URL || 'https://final-seo-tool.onrender.com';

// // Add this debug line
// console.log('🔍 [API Config] API_URL =', API_URL);
// console.log('🔍 [API Config] VITE_API_URL =', import.meta.env.VITE_API_URL);


export const API_URL = import.meta.env.DEV 
  ? 'http://localhost:5000'  // Always use port 5000 in dev
  : (import.meta.env.VITE_API_URL || 'https://final-seo-tool.onrender.com');

console.log('🔍 [API Config] API_URL =', API_URL);
console.log('🔍 [API Config] DEV mode =', import.meta.env.DEV);