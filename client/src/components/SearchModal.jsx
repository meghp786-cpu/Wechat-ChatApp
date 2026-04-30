import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Plus, User } from 'lucide-react';
import axios from 'axios';

const SearchModal = ({ isOpen, onClose, onSelectUser }) => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            setSearchResults([]);
            return;
        }

        try {
            setLoading(true);
            const { data } = await axios.get(`/api/users?search=${query}`);
            setSearchResults(data);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-darkSlate/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg backdrop-blur-[12px] bg-white/20 border border-white/20 rounded-[2rem] shadow-glass overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-tealAccent/20 rounded-2xl text-tealAccent border border-tealAccent/30 shadow-tealGlow">
                                    <Search size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-darkSlate uppercase italic tracking-tighter">Search</h2>
                                    <p className="text-[10px] font-black text-secondarySlate uppercase tracking-widest">Find your Friends and Family Member..</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/40 rounded-full transition-colors text-secondarySlate">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondarySlate" size={20} />
                                <input
                                    type="text"
                                    placeholder="Scan by name or email..."
                                    className="w-full bg-white/40 border border-white/20 rounded-2xl pl-14 pr-6 py-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors font-bold placeholder:text-secondarySlate/40"
                                    onChange={(e) => handleSearch(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="flex justify-center p-6 text-tealAccent"><Loader2 className="animate-spin" /></div>
                                ) : (
                                    searchResults.length > 0 ? (
                                        searchResults.map(user => (
                                            <motion.div
                                                whileHover={{ x: 5 }}
                                                key={user._id}
                                                onClick={() => onSelectUser(user._id)}
                                                className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer bg-white/30 border border-white/10 hover:bg-white/50 transition-all shadow-sm group"
                                            >
                                                <img src={getAvatarUrl(user.avatar)} className="w-12 h-12 rounded-full border border-black/5 shadow-md" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-black text-darkSlate group-hover:text-tealAccent transition-colors">{user.name}</h4>
                                                    <p className="text-[10px] text-secondarySlate/70 font-mono">@{user.username}</p>
                                                </div>
                                                <div className="text-tealAccent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Plus size={20} />
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : search && (
                                        <p className="text-center text-secondarySlate/50 text-xs py-8 font-black uppercase tracking-widest italic">No entities found in scan</p>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
