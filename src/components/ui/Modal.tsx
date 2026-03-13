import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div className="mb-6">{children}</div>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Đóng
        </button>
      </div>
    </div>
  )
}
