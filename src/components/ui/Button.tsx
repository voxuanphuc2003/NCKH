import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold transition'
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-400 text-white hover:bg-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-inherit hover:bg-gray-100',
    outline: 'border border-gray-400 bg-transparent text-inherit hover:bg-gray-50',
  }

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  )
}
