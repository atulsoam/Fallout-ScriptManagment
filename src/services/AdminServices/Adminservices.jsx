import axios from 'axios';
import { API_BASE } from '../../utils/Config';

export const getCuidFromStorage = () => {
  const storedAuth = JSON.parse(localStorage.getItem("authToken") || "{}");
  return storedAuth.cuid || "";
};

export const createUser = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid, createdBy: cuid };
    return await axios.post(`${API_BASE}/admin/create-user`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const addApprover = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/add-approver`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const removeApprover = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/remove-approver`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const addAdmin = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/add-admin`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const removeAdmin = async (payload, setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    const dataWithCuid = { ...payload, requestedBy: cuid };
    return await axios.post(`${API_BASE}/admin/remove-admin`, dataWithCuid, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const getUsers = async (setLoading) => {
  if (setLoading) setLoading(true);
  try {
    const cuid = getCuidFromStorage();
    console.log(cuid);

    return await axios.get(`${API_BASE}/admin/users`, {
      headers: { 'X-Requested-By': cuid }  // if needed as header, or skip this line
    });
  } finally {
    if (setLoading) setLoading(false);
  }
};

export const updateUser = async ({ cuid, updates }) => {
  const LogedINcuid = getCuidFromStorage();
  return await axios.put(`${API_BASE}/admin/update-user/${cuid}`, updates,
    {
      headers: { 'X-Requested-By': LogedINcuid }  // if needed as header, or skip this line
    }
  );
};

export const deleteUser = async (cuid, setLoading) => {
  setLoading(true);
  const LogedINcuid = getCuidFromStorage();
  const dataWithCuid = { ...cuid, requestedBy: LogedINcuid };
  const res = await axios.post(`${API_BASE}/admin/delete-user`, dataWithCuid);
  setLoading(false);
  return res;
};


