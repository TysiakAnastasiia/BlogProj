import axios from "axios";

const API_URL = "http://localhost:5000/api";

//  AUTH 
export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/auth/register`, userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/auth/login`, credentials);
  return res.data;
};

//  PROFILE 
export const getProfile = async (token) => {
  const res = await axios.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProfile = async (token, userData) => {
  const res = await axios.put(`${API_URL}/users/me`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

//  POSTS 
export const getPosts = async () => {
  const res = await axios.get(`${API_URL}/posts`);
  return res.data;
};

export const createPost = async (postData) => {
  const res = await axios.post(`${API_URL}/posts`, postData);
  return res.data;
};

//  MOVIES 
export const getMovies = async () => {
  const res = await axios.get(`${API_URL}/movies`);
  return res.data;
};

export const createMovie = async (movieData) => {
  const res = await axios.post(`${API_URL}/movies`, movieData);
  return res.data;
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  getPosts,
  createPost,
  getMovies,
  createMovie,
};