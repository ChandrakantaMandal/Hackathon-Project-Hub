import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger' 
}) => {
  const typeStyles = {
    danger: {
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      confirmButton: 'bg-red-600 hover:bg-red-700 text-white'
    },
    warning: {
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white'
    },
    info: {
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const styles = typeStyles[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block px-4 pt-5 pb-4 text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
            >
              <div className="sm:flex sm:items-start">
                <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
                  <ExclamationTriangleIcon className={`h-6 w-6 ${styles.iconText}`} />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-3">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${styles.confirmButton} focus:ring-red-500`}
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors duration-200"
                  onClick={onClose}
                >
                  {cancelText}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;