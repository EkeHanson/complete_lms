const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const config = {
  API_BASE_URL: isLocalhost 
    ? 'http://127.0.0.1:9090' 
    : 'https://cmvp-api-v1.onrender.com',

  WEB_PAGE__URL: isLocalhost 
    ? 'http://localhost:5173' 
    : 'https://crm-frontend-react.vercel.app',

  API_Documentation_URL: 'https://cmvp-api-v1.onrender.com/api/docs/',

  // GOOGLE_CLIENT_ID: 'your-google-client-id', // Uncomment and set if using Google OAuth
};

export default config;
