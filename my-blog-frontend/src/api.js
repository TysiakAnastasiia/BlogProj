// src/api/api.js
import axios from "axios";

const API_URL = "http://localhost:5000/api"; // бекенд

// 🔹 АВТОРИЗАЦІЯ
export const registerUser = (data) =>
  axios.post(`${API_URL}/auth/register`, data);

export const loginUser = (data) =>
  axios.post(`${API_URL}/auth/login`, data);

// 🔹 КОРИСТУВАЧ (профіль)
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // бекенд повертає об'єкт user
};

// 🔹 ПОСТИ
export const getPosts = (token) =>
  axios.get(`${API_URL}/posts`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const createPost = (data, token) =>
  axios.post(`${API_URL}/posts`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
