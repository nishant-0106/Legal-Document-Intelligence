import type { User } from '@/types'

class Storage {
  private tokenKey = 'lexintel_token'
  private userKey  = 'lexintel_user'
  private themeKey = 'lexintel_theme'

  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey)
    } catch {
      return null
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token)
    } catch {
      console.warn('Failed to save token')
    }
  }

  getUser(): User | null {
    try {
      const json = localStorage.getItem(this.userKey)
      return json ? JSON.parse(json) : null
    } catch {
      return null
    }
  }

  setUser(user: User): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user))
    } catch {
      console.warn('Failed to save user')
    }
  }

  getTheme(): 'light' | 'dark' | 'system' {
    try {
      return (localStorage.getItem(this.themeKey) as any) || 'system'
    } catch {
      return 'system'
    }
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    try {
      localStorage.setItem(this.themeKey, theme)
    } catch {
      console.warn('Failed to save theme')
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.tokenKey)
      localStorage.removeItem(this.userKey)
    } catch {
      console.warn('Failed to clear storage')
    }
  }
}

export const storage = new Storage()
