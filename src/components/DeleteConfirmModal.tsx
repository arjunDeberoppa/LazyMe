'use client'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName: string
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg p-6"
        style={{ backgroundColor: '#2b2b2b' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
        <p className="mb-2 text-gray-300">{message}</p>
        <p className="mb-6 font-semibold text-white">{itemName}</p>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="flex-1 cursor-pointer rounded-md px-4 py-2 font-medium text-white"
            style={{ backgroundColor: '#ff7800' }}
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-md px-4 py-2 font-medium text-gray-300"
            style={{ backgroundColor: '#242424' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

