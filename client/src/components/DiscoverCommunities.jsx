import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Loader2, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import CommunityCard from './CommunityCard';

const DiscoverCommunities = ({ isOpen, onClose }) => {
    const { communities, setCommunities, setChats, chats, setIsHighSpeed } = useChat();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [joiningId, setJoiningId] = useState(null);

    const fetchPublicCommunities = async () => {
        setIsLoading(true);
        // Timeout safety: 5 seconds
        const timeout = setTimeout(() => {
            if (isLoading) {
                setIsLoading(false);
                if (communities.length === 0) {
                    toast.error("Connection slow. Still searching the nexus...");
                }
            }
        }, 5000);

        try {
            const { data } = await axios.get('/api/chats/communities/public');
            setCommunities(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setCommunities([]);
            if (error.response?.status !== 404) {
                toast.error("discovery failed");
            }
        } finally {
            clearTimeout(timeout);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPublicCommunities();
            setIsHighSpeed(true); // "Exploration vibe"
        } else {
            setIsHighSpeed(false);
        }
        return () => setIsHighSpeed(false);
    }, [isOpen]);

    const handleJoin = async (communityId) => {
        setJoiningId(communityId);
        try {
            const { data } = await axios.post('/api/chats/community/join', { communityId });
            toast.success("Connection Established");
            if (!chats.find(c => c._id === data.chat._id)) {
                setChats([data.chat, ...chats]);
            }
            onClose();
        } catch (error) {
            toast.error(error.response?.data || "Synchronization failed");
        } finally {
            setJoiningId(null);
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-5xl h-[85vh] backdrop-blur-3xl bg-white/70 border border-white/50 rounded-[40px] shadow-glass flex flex-col overflow-hidden"
                    >
                        {/* Header Section */}
                        <div className="p-8 border-b border-black/5 bg-white/20">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-3xl font-black text-darkSlate italic tracking-tighter flex items-center gap-3">
                                        <Sparkles className="text-tealAccent animate-pulse" /> DISCOVER COMMUNITY
                                    </h2>
                                    <p className="text-xs text-secondarySlate font-mono uppercase tracking-[0.3em] mt-1 opacity-60">Scanning available Data...</p>
                                </div>
                                <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-full text-darkSlate transition-colors border border-black/5">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-secondarySlate/40" size={20} />
                                <input
                                    type="text"
                                    placeholder="SEARCH_BY_NAME_OR_DATA..."
                                    className="w-full bg-white/40 border border-white/60 rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-tealAccent transition-all font-bold text-darkSlate placeholder:text-secondarySlate/20 uppercase tracking-widest text-xs"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Discovery Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-tealAccent" size={48} strokeWidth={3} />
                                    <p className="text-[10px] font-black text-tealAccent uppercase tracking-[0.5em] animate-pulse">Initializing  Search...</p>
                                </div>
                            ) : filteredCommunities.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredCommunities.map((comm) => (
                                        <CommunityCard
                                            key={comm._id}
                                            community={comm}
                                            onJoin={handleJoin}
                                            joining={joiningId === comm._id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                                    <Users size={80} className="mb-4 text-secondarySlate" />
                                    <h3 className="text-xl font-black text-secondarySlate italic uppercase">No Community Found</h3>
                                    <p className="text-xs font-mono mt-2">The sector appears empty. Try a different Name.</p>
                                </div>
                            )}
                        </div>

                        {/* Footer Info */}
                        <div className="px-8 py-4 border-t border-black/5 bg-white/10 flex justify-between items-center text-[8px] font-black text-secondarySlate/40 uppercase tracking-[0.2em]">
                            <span>Discovery Status: Nominal</span>
                            <span>{filteredCommunities.length} Active Community Found</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DiscoverCommunities;
