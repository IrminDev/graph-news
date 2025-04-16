import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface DialogBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: 'danger' | 'warning' | 'info';
  darkMode: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  type = 'danger',
  darkMode,
}) => {
  // Prevent scroll on body when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle Escape key to close the modal
  React.useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Get the appropriate colors based on the type
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: darkMode ? 'text-red-400' : 'text-red-500',
          bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
          border: darkMode ? 'border-red-800/30' : 'border-red-100',
          button: darkMode 
            ? 'bg-red-700 hover:bg-red-600 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: darkMode ? 'text-amber-400' : 'text-amber-500',
          bg: darkMode ? 'bg-amber-900/20' : 'bg-amber-50',
          border: darkMode ? 'border-amber-800/30' : 'border-amber-100',
          button: darkMode 
            ? 'bg-amber-700 hover:bg-amber-600 text-white' 
            : 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'info':
      default:
        return {
          icon: darkMode ? 'text-blue-400' : 'text-blue-500',
          bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: darkMode ? 'border-blue-800/30' : 'border-blue-100',
          button: darkMode 
            ? 'bg-blue-700 hover:bg-blue-600 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className={`w-full max-w-md rounded-xl shadow-xl border overflow-hidden ${
              darkMode 
                ? `bg-slate-900 border-slate-800` 
                : `bg-white border-slate-200`
            }`}>
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                darkMode ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <h3 className={`text-lg font-semibold flex items-center ${
                  darkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  <AlertCircle className={`w-5 h-5 mr-2 ${typeStyles.icon}`} />
                  {title}
                </h3>
                <button 
                  onClick={onClose}
                  className={`p-1 rounded-full transition-colors ${
                    darkMode 
                      ? 'hover:bg-slate-800 text-slate-400 hover:text-white' 
                      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className={`p-5 ${typeStyles.bg} ${typeStyles.border} border-y`}>
                <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                  {message}
                </p>
              </div>
              
              {/* Actions */}
              <div className="p-4 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  {cancelButtonText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${typeStyles.button}`}
                >
                  {confirmButtonText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DialogBox;