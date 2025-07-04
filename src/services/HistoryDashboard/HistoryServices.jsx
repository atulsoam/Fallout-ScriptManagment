// services/falloutService.js
import axios from 'axios';

import { API_BASE } from '../../utils/Config'; // Adjust the import path as needed

export const HistoryData = async ({ page = 1, pageSize = 100, filters = {} }) => {
  try {
    const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
    const cuid = storedAuth.cuid || "";
    console.log(storedAuth);
    
    let framedHeader = {}
    if (!storedAuth.isAdmin) {
      framedHeader = { 'X-Requested-By': cuid }
    }
    const response = await axios.get(`${API_BASE}/getscriptHistory`, {
      params: {
        page,
        pageSize,
        filters: JSON.stringify(filters),
      },
      headers:
        framedHeader
    });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch fallout data:', error);
    throw error;
  }
};

export const getScriptDataByType = async (item, type) => {
  try {
    const response = await axios.post(`${API_BASE}/getScriptDataByType`,
      {
        collectionName: item.name,
        scriptId: item.id,
        type, // "Fixed", "Not Fixed", or "All"

      });

    return response.data;
  } catch (error) {
    console.error('Failed to getScriptDataByType', error);
    throw error;
  }
};

export const exportScriptData = async (item) => {
  try {
    const response = await axios.post(`${API_BASE}/exportScriptData`,
      {
        collectionName: item.name,
        scriptId: item.id,
      });

    return response;
  } catch (error) {
    console.error('Failed to exportScriptData:', error);
    throw error;
  }
};

export const downloadScriptLogs = async (item) => {
  try {
    const response = await axios.post(`${API_BASE}/downloadScriptLogs`,
      {
        execId: item.id,
      });

    return response;
  } catch (error) {
    console.error('Failed to downloadScriptLogs:', error);
    throw error;
  }
};
