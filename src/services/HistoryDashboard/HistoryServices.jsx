// services/falloutService.js
import axios from 'axios';

import { API_BASE } from '../../utils/Config'; // Adjust the import path as needed

export const HistoryData = async ({ page = 1, pageSize = 100, filters = {} }) => {
  try {
    const response = await axios.get(`${API_BASE}/getscriptHistory`, {
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
