import { api } from '../axios'
import type { User } from '@/types'

interface AuthResponse {
  token: string
  user: User
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  if (!email || !password) throw new Error('Email and password required')
  const response = await api.post<AuthResponse>('/auth/login', { email, password })
  return response.data
}

export async function registerApi(data: {
  firstName: string
  lastName: string
  email: string
  password: string
}): Promise<AuthResponse> {
  if (!data.email || !data.password || !data.firstName || !data.lastName) {
    throw new Error('All fields are required')
  }
  const response = await api.post<AuthResponse>('/auth/register', data)
  return response.data
}

export async function logoutApi(): Promise<void> {
  // Real: return api.post('/auth/logout')
  await delay(200)
}

export async function updateProfileApi(data: Partial<User>): Promise<User> {
  // Real: return api.patch<User>('/auth/profile', data)
  await delay(600)
  return data as User
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean }> {
  // Real: return api.post('/auth/change-password', { currentPassword, newPassword })
  await delay(600)
  if (!currentPassword || !newPassword) throw new Error('All fields required')
  return { success: true }
}
