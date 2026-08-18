import axios from 'axios'

// Dev: Vite proxy → localhost:8000
// Production (GitHub Pages): call Render backend directly
const API_BASE = import.meta.env.DEV
  ? '/api'
  : 'https://resume-screening-system-kqtv.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
})

// Request interceptor: add JWT token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor: handle 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      // Use correct path for GitHub Pages
      window.location.href = '/resume-screening-system/login'
    }
    return Promise.reject(err)
  }
)


// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
}

// Resume API
export const resumeAPI = {
  upload: (formData) => api.post('/resumes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`)
}

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  save: (id) => api.post(`/jobs/${id}/save`),
  unsave: (id) => api.delete(`/jobs/${id}/save`),
  getSaved: () => api.get('/jobs/saved')
}

// Matching API
export const matchingAPI = {
  analyze: (data) => api.post('/matching/analyze', data),
  getResult: (resumeId, jobId) => api.get(`/matching/${resumeId}/${jobId}`),
  getHistory: () => api.get('/matching/history')
}

// Recommendations API
export const recommendationsAPI = {
  get: () => api.get('/recommendations'),
  getHistory: () => api.get('/recommendations/history')
}

// Applications API
export const applicationsAPI = {
  apply: (jobId, data) => api.post(`/jobs/${jobId}/apply`, data),
  getAll: () => api.get('/applications')
}

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getAnalytics: () => api.get('/admin/analytics'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`)
}

export default api
