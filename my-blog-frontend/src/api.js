import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/auth/register`, userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/auth/login`, credentials);
  return res.data;
};

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

export const getUserById = async (userId, token) => {
  const res = await axios.get(`${API_URL}/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const followUser = async (userId, token) => {
  const res = await axios.post(`${API_URL}/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const unfollowUser = async (userId, token) => {
  const res = await axios.post(`${API_URL}/users/${userId}/unfollow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getPosts = async (userId, search) => {
  const res = await axios.get(`${API_URL}/posts`, {
    params: { userId: userId, search: search } 
  });
  return res.data;
};

export const createPost = async (postData, token) => {
  const res = await axios.post(`${API_URL}/posts`, postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updatePost = async (id, postData, token) => {
  const res = await axios.put(`${API_URL}/posts/${id}`, postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deletePost = async (id, token) => {
  const res = await axios.delete(`${API_URL}/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const getMovies = async (userId, search) => {
  const res = await axios.get(`${API_URL}/movies`, {
    params: { userId: userId, search: search } 
  });
  return res.data;
};

export const createMovie = async (movieData, token) => {
  const res = await axios.post(`${API_URL}/movies`, movieData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMovie = async (id, movieData, token) => {
  const res = await axios.put(`${API_URL}/movies/${id}`, movieData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMovie = async (id, token) => {
  const res = await axios.delete(`${API_URL}/movies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export const addLike = async (likeData, token) => {
  console.log('API addLike called with:', { likeData, token: token ? 'exists' : 'missing' });
  const res = await axios.post(`${API_URL}/likes`, likeData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  return res.data;
};

export const removeLike = async (postId, itemType, token) => {
  const res = await axios.delete(`${API_URL}/likes/${itemType}/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addComment = async (commentData, token) => {
  const res = await axios.post(`${API_URL}/comments`, commentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const removeComment = async (commentId, token) => {
  const res = await axios.delete(`${API_URL}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


export default {
  register,
  login,
  getProfile,
  updateProfile,
  getUserById,
  followUser,
  unfollowUser,
  getPosts,
  createPost,
  updatePost,
  deletePost,
  getMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  addLike,
  removeLike,
  addComment,
  removeComment,
};