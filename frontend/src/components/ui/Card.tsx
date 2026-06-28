import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'sm'
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
  const styles = variant === 'sm' ? 'card-sm' : 'card'
  return <div className={`${styles} ${className}`}>{children}</div>
}
