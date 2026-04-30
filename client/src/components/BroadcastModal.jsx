import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Check, Loader2, Search, Zap } from 'lucide-react';
import axios from 'axios';

const BroadcastModal = ({ isOpen, onClose, fetchChats }) => {
    const [message, setMessage] = useState("");
    const [broadcastName, setBroadcastName] = useState("");
    const [type, setType] = useState("archived");
    const [selectedUsers, setSelectedUsers] = useState([]);
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

    const handleSelectUser = (user) => {
        if (selectedUsers.find(u => u._id === user._id)) {
            setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleSubmit = async () => {
        if (!message || selectedUsers.length === 0) {
            alert("Please provide a message and select recipients");
            return;
        }

        try {
            setLoading(true);
            await axios.post('/api/features/broadcast', {
                content: message,
                recipients: selectedUsers.map((u) => u._id),
                broadcastName,
                type,
            });
            onClose();
            fetchChats();
        } catch (error) {
            console.error("Error sending broadcast", error);
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
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="p-3 bg-tealAccent/20 rounded-2xl text-tealAccent border border-tealAccent/30"
                                >
                                    <Zap size={24} />
                                </motion.div>
                                <div>
                                    <h2 className="text-xl font-black text-darkSlate uppercase italic tracking-tighter"> Broadcast</h2>
                                    <p className="text-[10px] font-black text-secondarySlate uppercase tracking-widest">Global Priority Link</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/40 rounded-full transition-colors text-secondarySlate">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondarySlate uppercase tracking-widest pl-1">Broadcast Identifier</label>
                                <input
                                    type="text"
                                    placeholder="Enter operation name..."
                                    className="w-full bg-white/40 border border-white/20 rounded-2xl px-6 py-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors font-bold placeholder:text-secondarySlate/40"
                                    value={broadcastName}
                                    onChange={(e) => setBroadcastName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondarySlate uppercase tracking-widest pl-1">Transmission Mode</label>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setType("archived")}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border uppercase tracking-widest ${type === "archived" ? "bg-tealAccent text-white border-tealAccent shadow-tealGlow" : "bg-white/40 border-white/20 text-secondarySlate hover:bg-white/60"}`}
                                    >
                                        Archived
                                    </button>
                                    <button
                                        onClick={() => setType("one-time")}
                                        className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all border uppercase tracking-widest ${type === "one-time" ? "bg-softCoral text-white border-softCoral shadow-lg" : "bg-white/40 border-white/20 text-secondarySlate hover:bg-white/60"}`}
                                    >
                                        Self-Destruct
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-secondarySlate uppercase tracking-widest pl-1">Content</label>
                                <textarea
                                    placeholder="Enter broadcast message..."
                                    className="w-full bg-white/40 border border-white/20 rounded-2xl px-6 py-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors resize-none h-32 font-bold placeholder:text-secondarySlate/40"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-secondarySlate uppercase tracking-widest pl-1">Select Members</label>
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-secondarySlate" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Scan the network..."
                                        className="w-full bg-white/40 border border-white/20 rounded-2xl pl-14 pr-6 py-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors font-bold placeholder:text-secondarySlate/40"
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                                    {selectedUsers.map(user => (
                                        <div key={user._id} className="bg-tealAccent/20 text-tealAccent px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-tealAccent/30 shadow-sm animate-in fade-in zoom-in duration-300">
                                            {user.name}
                                            <X size={14} className="cursor-pointer hover:bg-tealAccent/20 rounded-full" onClick={() => handleSelectUser(user)} />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="flex justify-center p-6 text-tealAccent"><Loader2 className="animate-spin" /></div>
                                    ) : (
                                        searchResults.length > 0 ? (
                                            searchResults.map(user => (
                                                <div
                                                    key={user._id}
                                                    onClick={() => handleSelectUser(user)}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${selectedUsers.find(u => u._id === user._id) ? 'bg-tealAccent/10 border-tealAccent/30' : 'bg-white/30 border-white/10 hover:bg-white/50'}`}
                                                >
                                                    <img src={getAvatarUrl(user.avatar)} className="w-10 h-10 rounded-full border border-black/5" />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-black text-darkSlate">{user.name}</h4>
                                                        <p className="text-[10px] text-secondarySlate/70 font-mono tracking-tighter">@{user.username}</p>
                                                    </div>
                                                    {selectedUsers.find(u => u._id === user._id) ? (
                                                        <div className="bg-tealAccent text-white p-1 rounded-full"><Check size={16} /></div>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border border-tealAccent/30" />
                                                    )}
                                                </div>
                                            ))
                                        ) : search && (
                                            <p className="text-center text-secondarySlate/50 text-xs py-4 font-bold uppercase tracking-widest">No Member found</p>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10">
                            <button
                                onClick={handleSubmit}
                                disabled={loading || selectedUsers.length === 0 || !message}
                                className="w-full bg-tealAccent text-white font-black py-5 rounded-2xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-tealGlow uppercase tracking-widest text-sm disabled:opacity-30 disabled:pointer-events-none"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <><Megaphone size={20} /> Deliver Broadcast</>}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BroadcastModal;
