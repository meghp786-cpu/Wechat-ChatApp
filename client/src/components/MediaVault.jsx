import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

const MediaVault = ({ isOpen, onClose, messages }) => {
    const mediaMessages = messages.filter(m => m.fileUrl);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white/70 backdrop-blur-xl border border-white/50 w-full max-w-4xl h-[80vh] rounded-[40px] shadow-2xl relative z-10 flex flex-col overflow-hidden"
                    >
                        <div className="p-8 border-b border-black/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-darkSlate tracking-tight uppercase italic">Media Vault</h2>
                                <p className="text-xs text-secondarySlate font-bold">Transmitted files from this Nexus stream</p>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-full transition-colors text-darkSlate">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {mediaMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-secondarySlate/40">
                                    <FileText size={64} className="mb-4 opacity-20" />
                                    <p className="font-black uppercase tracking-widest italic">No media data transmissions found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {mediaMessages.map((m, i) => {
                                        const isImage = m.fileType?.startsWith('image/');
                                        return (
                                            <motion.div
                                                key={i}
                                                whileHover={{ y: -5 }}
                                                className="group relative aspect-square rounded-3xl overflow-hidden bg-black/5 border border-black/5 shadow-sm"
                                            >
                                                {isImage ? (
                                                    <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-tealAccent">
                                                        <FileText size={40} />
                                                        <span className="text-[10px] font-bold mt-2 text-center truncate w-full">{m.fileName}</span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-tealAccent/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                                    <button
                                                        onClick={() => window.open(m.fileUrl)}
                                                        className="p-3 bg-white text-tealAccent rounded-full hover:scale-110 transition-transform"
                                                    >
                                                        <ExternalLink size={20} />
                                                    </button>
                                                    <a
                                                        href={m.fileUrl}
                                                        download
                                                        className="p-3 bg-white text-tealAccent rounded-full hover:scale-110 transition-transform"
                                                    >
                                                        <Download size={20} />
                                                    </a>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MediaVault;
