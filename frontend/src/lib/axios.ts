import axios, { AxiosInstance } from 'axios'
import { storage } from './storage'

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      storage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
