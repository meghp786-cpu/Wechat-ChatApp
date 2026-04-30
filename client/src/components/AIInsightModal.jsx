import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X, Sparkles } from 'lucide-react';

const TypewriterText = ({ text, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        setDisplayedText("");
        let i = 0;
        const timer = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(prev => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <div className="whitespace-pre-wrap leading-relaxed text-[#1A202C] font-medium">
            {displayedText}
        </div>
    );
};

const AIInsightModal = ({ isOpen, onClose, summary }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
                        className="relative w-full max-w-lg backdrop-blur-[25px] bg-white/60 border border-white/50 rounded-[40px] shadow-glass overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-tealAccent/20 rounded-2xl text-tealAccent">
                                        <Sparkles size={24} className="animate-pulse" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#1A202C] tracking-tight">AI Summary</h2>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondarySlate opacity-50">Intelligence Stream</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-secondarySlate"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="bg-white/30 rounded-3xl p-6 border border-white/20 shadow-inner">
                                <TypewriterText text={summary} />
                            </div>

                            <div className="mt-8 flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onClose}
                                    className="px-8 py-3 bg-[#1A202C] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:shadow-tealGlow/20 transition-all"
                                >
                                    Acknowledged
                                </motion.button>
                            </div>
                        </div>

                        {/* Decorative Gradient Line */}
                        <div className="h-2 w-full bg-teal-blue-gradient opacity-50" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIInsightModal;
