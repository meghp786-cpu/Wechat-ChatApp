import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "danger" }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm backdrop-blur-[25px] bg-white/70 border border-white/50 rounded-[35px] shadow-glass overflow-hidden p-8 text-center"
                    >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${type === 'danger' ? 'bg-softCoral/20 text-softCoral' : 'bg-tealAccent/20 text-tealAccent'}`}>
                            <AlertCircle size={32} />
                        </div>

                        <h3 className="text-xl font-black text-[#1A202C] mb-2 uppercase tracking-tight">{title}</h3>
                        <p className="text-secondarySlate text-sm font-bold mb-8 px-2">{message}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-black/5 hover:bg-black/10 text-secondarySlate rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 py-4 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${type === 'danger' ? 'bg-softCoral hover:shadow-softCoral/30' : 'bg-tealAccent hover:shadow-tealAccent/30'}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmationModal;
