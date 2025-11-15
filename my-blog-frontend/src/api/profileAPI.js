import axios from "axios";

const API_URL = "/api";

// функція для отримання профілю користувача
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// функція для оновлення профілю
export const updateProfile = async (token, profileData) => {
  const res = await axios.put(`${API_URL}/users/me`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
