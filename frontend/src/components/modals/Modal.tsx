import React from "react";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-black/70 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-[#05164d] transition-colors"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
