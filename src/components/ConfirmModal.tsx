import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm' }: ConfirmModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-inverse/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-secondary border border-base-border/10 p-8 rounded-3xl z-50 shadow-2xl"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-xl font-display font-light text-primary-text tracking-widest uppercase mb-4">{title}</h3>
              <p className="text-[11px] text-primary-text/60 mb-8 font-sans leading-relaxed">
                {message}
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 bg-primary/5 hover:bg-primary/10 text-primary-text rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onConfirm(); onClose(); }}
                  className="flex-1 py-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-primary-text border border-red-500/20 hover:border-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
