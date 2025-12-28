'use client'

interface IconProps {
  className?: string
  isActive?: boolean
}

export function InboxIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M22 12h-6l-2 3h-8l-2-3H2" />
      <path d="M2 12V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" />
    </svg>
  )
}

export function StarIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

export function ClockIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

export function SendIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}

export function MailIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export function FileTextIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}

export function ArchiveIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M21 8v13H3V8" />
      <path d="M1 3h22v5H1z" />
      <path d="M10 12h4" />
    </svg>
  )
}

export function TrashIcon({ className = 'w-5 h-5', isActive = false }: IconProps) {
  const color = isActive ? '#001d35' : '#5f6368'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}

