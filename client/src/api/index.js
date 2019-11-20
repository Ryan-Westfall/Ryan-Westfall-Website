import axios from 'axios';

const host = 'http://localhost:3001';

const api = {
  get: (endpoint) => {
    return axios.get(`${host}${endpoint}`);
  },

  post: (endpoint, data) => {
    return axios.post(`${host}${endpoint}`, data);
  },
}

export default api;
