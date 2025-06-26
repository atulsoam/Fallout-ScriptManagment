import axios from "axios";
import {API_BASE} from "../../utils/Config"
// services/ScriptScheduler/schedulerService.js


export const UpdateScript = async (setLoading,id,updatedData) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.put(`${API_BASE}//updateScripts/${id}`,updatedData);
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const DeleteScript = async (setLoading,id) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.delete(`${API_BASE}//deleteScripts/${id}`);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const uploadScript = async (setLoading,payload) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.post(`${API_BASE}/upload`,payload);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const fetchScriptTypes = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.get(`${API_BASE}/getscriptcatogery`);
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const AddScriptType = async (setLoading,ScriptType) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.post(`${API_BASE}/addScriptType`,ScriptType);
  } finally {
    if (setLoading) setLoading(false);
  }
};
export const AddScripSubtType = async (setLoading,ScriptSubType) => {
  if (setLoading) setLoading(true);
  try {
    return await axios.post(`${API_BASE}/addScriptSubType`,ScriptSubType);
  } finally {
    if (setLoading) setLoading(false);
  }
};