import axios from 'axios';

// Configure axios with default settings
axios.defaults.baseURL = '';  // Use the proxy configuration from package.json
axios.defaults.headers.post['Content-Type'] = 'application/json';

// Add request interceptor to handle errors
axios.interceptors.request.use(
  config => {
    // You can add any request modifications here
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log('Response error:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.log('Request error:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axios;
