import axios from "axios";

// Налаштування базового URL для axios
axios.defaults.baseURL = '/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor для логування помилок
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// ------------------ AUTH ------------------
export const register = async (userData) => {
  const res = await axios.post('/auth/register', userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await axios.post('/auth/login', credentials);
  return res.data;
};

// ------------------ USERS ------------------
export const getProfile = async (token) => {
  const res = await axios.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProfile = async (token, userData) => {
  const res = await axios.put('/users/me', userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getUserById = async (userId, token) => {
  const res = await axios.get(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const followUser = async (userId, token) => {
  const res = await axios.post(`/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const unfollowUser = async (userId, token) => {
  const res = await axios.post(`/users/${userId}/unfollow`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ------------------ POSTS ------------------
export const getPosts = async (userId, search) => {
  const res = await axios.get('/posts', {
    params: { userId, search },
  });
  return res.data;
};

export const createPost = async (postData, token) => {
  const res = await axios.post('/posts', postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updatePost = async (id, postData, token) => {
  const res = await axios.put(`/posts/${id}`, postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deletePost = async (id, token) => {
  const res = await axios.delete(`/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ------------------ MOVIES ------------------
export const getMovies = async (userId, search) => {
  const res = await axios.get('/movies', {
    params: { userId, search },
  });
  return res.data;
};

export const createMovie = async (movieData, token) => {
  const res = await axios.post('/movies', movieData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateMovie = async (id, movieData, token) => {
  const res = await axios.put(`/movies/${id}`, movieData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteMovie = async (id, token) => {
  const res = await axios.delete(`/movies/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ------------------ LIKES ------------------
export const addLike = async (likeData, token) => {
  const res = await axios.post('/likes', likeData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const removeLike = async (postId, itemType, token) => {
  const res = await axios.delete(`/likes/${itemType}/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ------------------ COMMENTS ------------------
export const addComment = async (commentData, token) => {
  const res = await axios.post('/comments', commentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const removeComment = async (commentId, token) => {
  const res = await axios.delete(`/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ------------------ Експорт ------------------
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