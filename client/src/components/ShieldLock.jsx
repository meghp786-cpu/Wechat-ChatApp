import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';

const ShieldLock = ({ isVisible }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-32 h-32 border-4 border-tealAccent/20 border-t-tealAccent rounded-full shadow-tealGlow"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Lock size={48} className="text-tealAccent" />
                        </div>
                    </div>
                    <motion.p
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="absolute mt-40 text-tealAccent font-black text-xs uppercase tracking-[0.3em] italic"
                    >
                        Securing Data...
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShieldLock;
