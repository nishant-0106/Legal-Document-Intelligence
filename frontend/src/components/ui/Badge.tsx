import type { ReactNode } from 'react'

type BadgeVariant = 'green' | 'red' | 'amber' | 'blue' | 'gray'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  const variantClass = `badge-${variant}`
  return <span className={`badge ${variantClass} ${className}`}>{children}</span>
}
