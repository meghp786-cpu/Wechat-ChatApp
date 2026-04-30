import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Send, History, CheckCircle, Zap, Shield, Search } from 'lucide-react';

const BroadcastDashboard = () => {
    const { user } = useAuth();
    const [content, setContent] = useState("");
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [history, setHistory] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        const { data: usersData } = await axios.get('/api/users');
        const { data: historyData } = await axios.get('/api/features/broadcast/history');
        setAvailableUsers(usersData.filter(u => u._id !== user._id));
        setHistory(historyData);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        if (!content || selectedUsers.length === 0) return;

        setIsSending(true);
        try {
            await axios.post('/api/features/broadcast', {
                content,
                recipients: selectedUsers,
            });
            setContent("");
            setSelectedUsers([]);
            fetchData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSending(false);
        }
    };

    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen w-full text-darkSlate p-6 gap-6 font-space overflow-hidden">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-[2] backdrop-blur-[12px] bg-white/20 border border-white/20 rounded-[2.5rem] p-10 overflow-y-auto shadow-glass flex flex-col custom-scrollbar"
            >
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-tealAccent/20 rounded-2xl text-tealAccent border border-tealAccent/30 shadow-tealGlow">
                            <Zap size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic tracking-tighter uppercase">Broadcast Center</h1>
                            <p className="text-[10px] font-black text-secondarySlate uppercase tracking-[0.3em]">Master Network Controller</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleBroadcast} className="flex-1 flex flex-col gap-8">
                    <div className="space-y-3">
                        <label className="block text-xs font-black text-secondarySlate uppercase tracking-widest ml-1">Transmission Content</label>
                        <textarea
                            className="w-full bg-white/40 border border-white/20 rounded-[2rem] p-8 text-lg font-bold text-darkSlate focus:outline-none focus:border-tealAccent transition-all placeholder:text-secondarySlate/30 min-h-[180px] resize-none shadow-sm"
                            placeholder="Initialize global message sequence..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="block text-xs font-black text-secondarySlate uppercase tracking-widest">Select Target Nodes ({selectedUsers.length})</label>
                            <div className="relative w-64">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondarySlate/50" size={16} />
                                <input
                                    type="text"
                                    placeholder="Filter network..."
                                    className="w-full bg-white/40 border border-white/20 rounded-full pl-10 pr-4 py-2 text-xs font-bold focus:outline-none focus:border-tealAccent/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[300px] p-2 custom-scrollbar">
                            {filteredUsers.map(u => (
                                <motion.div
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    key={u._id}
                                    onClick={() => toggleUser(u._id)}
                                    className={`p-4 rounded-2xl cursor-pointer border transition-all flex items-center gap-4 ${selectedUsers.includes(u._id) ? 'bg-tealAccent text-white border-tealAccent shadow-tealGlow' : 'bg-white/40 border-white/20 hover:bg-white/60 shadow-sm'}`}
                                >
                                    <img src={getAvatarUrl(u.avatar)} alt={u.name} className="w-10 h-10 rounded-full border border-white/20 shadow-sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">{u.name}</p>
                                        <p className={`text-[10px] font-mono ${selectedUsers.includes(u._id) ? 'text-white/60' : 'text-secondarySlate/60'}`}>@{u.username}</p>
                                    </div>
                                    {selectedUsers.includes(u._id) && <CheckCircle size={18} className="text-white" />}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSending || selectedUsers.length === 0 || !content}
                            className="w-fit bg-tealAccent text-white px-12 py-5 rounded-2xl font-black flex items-center gap-3 hover:opacity-90 transition-all shadow-tealGlow uppercase tracking-widest text-sm disabled:opacity-30 disabled:pointer-events-none"
                        >
                            {isSending ? <><Shield className="animate-spin" size={20} /> Transmitting...</> : <><Send size={20} /> Initiate Global Broadcast</>}
                        </motion.button>
                    </div>
                </form>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-[400px] backdrop-blur-[12px] bg-white/20 border border-white/20 rounded-[2.5rem] p-10 overflow-y-auto shadow-glass flex flex-col custom-scrollbar"
            >
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/30 rounded-xl text-secondarySlate border border-white/20">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">History</h2>
                        <p className="text-[10px] font-black text-secondarySlate uppercase tracking-widest">Logged Transmissions</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <AnimatePresence>
                        {history.map((b, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={b._id}
                                className="p-6 bg-white/40 border border-white/20 rounded-3xl group hover:border-tealAccent/30 transition-all shadow-sm"
                            >
                                <div className="flex items-start gap-3 mb-4">
                                    <div className="p-2 bg-tealAccent/10 rounded-lg text-tealAccent group-hover:bg-tealAccent/20 transition-colors">
                                        <Megaphone size={14} />
                                    </div>
                                    <p className="text-sm font-bold text-darkSlate leading-relaxed">"{b.content}"</p>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-tealAccent">{b.recipients.length} Nodes Reached</span>
                                    <span className="text-secondarySlate/40">{new Date(b.createdAt).toLocaleDateString()}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default BroadcastDashboard;
