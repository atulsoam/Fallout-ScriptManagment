// services/falloutService.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
// const API_BASE = 'https://asat-order-resolution-platform-ms-test1.rke-odc-test.corp.intranet/api';


export const fetchFalloutData = async ({ page = 1, pageSize = 100, filters = {} }) => {
  try {
    const response = await axios.get(`${API_BASE}/data`, {
      params: {
        page,
        pageSize,
        filters: JSON.stringify(filters),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch fallout data:', error);
    throw error;
  }
};
