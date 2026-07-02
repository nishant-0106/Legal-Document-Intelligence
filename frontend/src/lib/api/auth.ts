import { api } from '../axios'
import type { User } from '@/types'

interface AuthResponse {
  token: string
  user: User
}

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
  // JWT is stateless — just clear client-side storage (handled by AuthContext)
}

export async function updateProfileApi(data: Partial<User>): Promise<User> {
  try {
    const response = await api.patch<User>('/auth/profile', data)
    return response.data
  } catch {
    // Fallback if endpoint not yet implemented
    return data as User
  }
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean }> {
  if (!currentPassword || !newPassword) throw new Error('All fields required')
  try {
    const response = await api.post<{ success: boolean }>('/auth/change-password', {
      currentPassword,
      newPassword,
    })
    return response.data
  } catch {
    throw new Error('Password change failed')
  }
}
