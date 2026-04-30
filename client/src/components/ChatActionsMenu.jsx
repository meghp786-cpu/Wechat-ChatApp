import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Users, Settings, BellOff, Bell, LogOut, Trash2, Megaphone, Image, Edit2, Wand2, Loader2, ShieldOff, Timer, User as UserIcon, Wind, Zap } from 'lucide-react';


import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

import ConfirmationModal from './ConfirmationModal';

const ChatActionsMenu = ({ onOpenBroadcast, onOpenGallery, onShowAIInsight, onShowProfile }) => {

    const [isOpen, setIsOpen] = useState(false);
    const { selectedChat, setSelectedChat, setChats, setMessages, onlineUsers, mutedChats, toggleMute, setOrbColor, setIsHighSpeed, handleDetach } = useChat();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const menuRef = useRef(null);

    // Confirmation Modal States
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const isGroupAdmin = selectedChat?.groupAdmin?._id === user?._id || selectedChat?.groupAdmin === user?._id;

    const fetchMembers = async () => {
        try {
            setLoadingMembers(true);
            const { data } = await axios.get(`/api/chats/${selectedChat._id}/members`);
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch members", error);
        } finally {
            setLoadingMembers(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen, selectedChat]);

    const onlineCount = members.filter(m => m.isOnline).length;

    const isMuted = mutedChats.includes(selectedChat?._id);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRename = async () => {
        const newName = prompt("Enter new name:", selectedChat.chatName);
        if (newName && newName !== selectedChat.chatName) {
            try {
                const { data } = await axios.put('/api/chats/rename', {
                    chatId: selectedChat._id,
                    chatName: newName
                });
                setSelectedChat(data);
                setChats(prev => prev.map(c => c._id === data._id ? data : c));
                toast.success("Chat updated");

            } catch (error) {
                toast.error("Rename failed");
            }
        }
        setIsOpen(false);
    };

    const handleLeave = () => {
        setConfirmModal({
            isOpen: true,
            title: "Terminate Stream?",
            message: `Are you sure you want to exit this ${selectedChat.isCommunity ? 'community' : 'group'}? You will lose access to this channel.`,
            onConfirm: async () => {
                try {
                    await axios.put('/api/chats/leave', { chatId: selectedChat._id });
                    setChats(prev => prev.filter(c => c._id !== selectedChat._id));
                    setSelectedChat(null);
                    toast.success("Left the stream");
                } catch (error) {
                    toast.error("Exit failed");
                }
            },
            type: 'danger'
        });
        setIsOpen(false);
    };

    const handleClearHistory = () => {
        setConfirmModal({
            isOpen: true,
            title: "Clear History?",
            message: "This will clear your local chat history for this channel. This action cannot be undone.",
            onConfirm: () => {
                setMessages([]);
                toast.success("Memory purged");
            },
            type: 'danger'
        });
        setIsOpen(false);
    };

    const toggleTheme = (mode) => {
        if (mode === 'chill') {
            setOrbColor(['#44A194', '#537D96', '#EC8F8D', '#44A194', '#537D96']);
            setIsHighSpeed(false);
            toast.success("Chill Mode Engaged");
        } else if (mode === 'energy') {
            setOrbColor(['#FF00CC', '#3333FF', '#00FFFF', '#FF00CC', '#3333FF']);
            setIsHighSpeed(true);
            toast.success("Energy Mode Active");
        } else if (mode === 'focus') {
            // Muted, steady tones for focus
            setOrbColor(['#2C3E50', '#34495E', '#5D6D7E', '#2C3E50', '#85929E']);
            setIsHighSpeed(false);
            toast.success("Focus Realm Synced");
        } else if (mode === 'energetic') {
            // Vibrant, high-contrast tones for energy
            setOrbColor(['#F39C12', '#E74C3C', '#9B59B6', '#F39C12', '#2ECC71']);
            setIsHighSpeed(true);
            toast.success("Max Energy Stream Active");
        }
        setIsOpen(false);
    };


    const handleSummarize = async () => {
        setSummaryLoading(true);
        setIsOpen(false);
        try {
            // For private chats, we only want the last 30 messages as per prompt
            const limit = selectedChat.isGroupChat || selectedChat.isCommunity ? 50 : 30;
            const { data } = await axios.get(`/api/features/summarize/${selectedChat._id}?limit=${limit}`);
            onShowAIInsight(data.summary);
        } catch (error) {
            toast.error("AI Summary failed: " + (error.response?.data?.message || "Unknown error"));
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleToggleDisappearing = async () => {
        try {
            const { data } = await axios.put('/api/chats/disappearing-messages', { chatId: selectedChat._id });
            setSelectedChat(data);
            socket.emit("disappearing_messages_toggle", { chatId: selectedChat._id, enabled: data.disappearingMessages });
            toast.success(data.disappearingMessages ? "auto-Disappear active" : "memory retention enabled");
        } catch (error) {
            toast.error("Failed to toggle privacy mode");
        }
        setIsOpen(false);
    };

    const handleBlock = () => {
        setConfirmModal({
            isOpen: true,
            title: "Block User?",
            message: "Block this user from further Neural interference? They will no longer be able to send you messages.",
            onConfirm: async () => {
                try {
                    const otherUser = selectedChat.users.find(u => u._id !== user._id);
                    await axios.post('/api/chats/block', { userId: otherUser._id });
                    toast.success("User blocked from your stream");
                    setSelectedChat(null);
                } catch (error) {
                    toast.error("Block failed");
                }
            },
            type: 'danger'
        });
        setIsOpen(false);
    };

    const handleDetachNexus = () => {
        setConfirmModal({
            isOpen: true,
            title: "Leaving from Application?",
            message: "Confirming global disconnect from the network. Your session will be terminated.",
            onConfirm: () => handleDetach(),
            type: 'danger'
        });
        setIsOpen(false);
    };


    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-black/5 rounded-full text-darkSlate transition-colors"
                title="Secure Actions"
            >
                <MoreVertical size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-64 backdrop-blur-[10px] bg-white/70 border border-white/40 rounded-3xl shadow-glass z-[100] overflow-hidden"
                    >
                        {/* Info Section */}
                        <div className="p-4 border-b border-black/5 bg-black/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Users size={14} className="text-tealAccent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-darkSlate">Stream Insights</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-secondarySlate">{members.length || 0} Channels</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-tealAccent shadow-[0_0_5px_#44A194]" />
                                    <span className="text-[10px] font-black text-tealAccent uppercase">{onlineCount} Syncing</span>
                                </div>
                            </div>
                        </div>

                        {/* Member Roster List */}
                        <div className="max-h-40 overflow-y-auto px-4 py-2 custom-scrollbar border-b border-black/5 bg-white/30">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-secondarySlate opacity-40 mb-2">Member Roster</p>
                            {loadingMembers ? (
                                <div className="flex items-center justify-center py-6">
                                    <Loader2 size={24} className="animate-spin text-tealAccent opacity-50" />
                                </div>
                            ) : (
                                members.map(member => (
                                    <div key={member._id} className="flex items-center justify-between py-1.5 group/member">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="relative">
                                                <img
                                                    src={getAvatarUrl(member.avatar) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`}
                                                    className="w-6 h-6 rounded-full border border-white/50"
                                                    alt=""
                                                />
                                                {member.isOnline && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-tealAccent border border-white shadow-[0_0_3px_#44A194]" />
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-bold text-darkSlate truncate group-hover/member:text-tealAccent transition-colors">{member.name}</p>
                                                <p className="text-[8px] text-secondarySlate opacity-50 truncate">@{member.username}</p>
                                            </div>
                                        </div>
                                        {member.isOnline && (
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 2 }}
                                                className="text-[7px] font-black text-tealAccent uppercase tracking-tighter"
                                            >
                                                Live
                                            </motion.div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>


                        {/* Specialized Sections based on Chat Type */}
                        {!selectedChat.isGroupChat && !selectedChat.isCommunity ? (
                            // PRIVATE CHAT MENU
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={handleSummarize}
                                    disabled={summaryLoading}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-tealAccent/10 hover:text-tealAccent transition-all text-xs font-bold disabled:opacity-50"
                                >
                                    {summaryLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    {summaryLoading ? "Consulting AI..." : "Summarize Recent Chat"}
                                </button>

                                <button
                                    onClick={() => {
                                        const otherUser = selectedChat.users.find(u => u._id !== user._id);
                                        onShowProfile(otherUser);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-tealAccent/10 hover:text-tealAccent transition-all text-xs font-bold"
                                >
                                    <UserIcon size={16} /> {selectedChat.users.find(u => u._id !== user._id)?.name}'s Profile
                                </button>

                                <div className="px-4 py-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-secondarySlate/50">Background</span>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => toggleTheme('focus')}
                                            className="flex-1 py-1.5 rounded-xl border border-[#44A194]/30 text-[9px] font-black uppercase text-[#44A194] hover:bg-[#44A194] hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Wind size={10} /> Focus
                                        </button>
                                        <button
                                            onClick={() => toggleTheme('energetic')}
                                            className="flex-1 py-1.5 rounded-xl border border-softCoral/30 text-[9px] font-black uppercase text-softCoral hover:bg-softCoral hover:text-white transition-all flex items-center justify-center gap-1"
                                        >
                                            <Zap size={10} /> Energy
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-black/5 mx-2 my-1" />

                                <button
                                    onClick={handleToggleDisappearing}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all text-xs font-bold ${selectedChat.disappearingMessages ? 'text-tealAccent bg-tealAccent/5' : 'text-[#1A202C] hover:bg-black/5'}`}
                                >
                                    <Timer size={16} />
                                    {selectedChat.disappearingMessages ? "Auto-Disappearing : ON" : "Data Retention: ON"}
                                </button>

                                <button onClick={onOpenGallery} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-black/5 transition-all text-xs font-bold">
                                    <Image size={16} /> Shared Media Vault
                                </button>

                                <div className="h-px bg-black/5 mx-2 my-1" />

                                <button onClick={handleBlock} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-softCoral hover:bg-softCoral/10 transition-all text-xs font-bold">
                                    <ShieldOff size={16} /> Terminate Link (Block)
                                </button>
                            </div>
                        ) : (
                            // GROUP / COMMUNITY MENU
                            <div className="p-2 space-y-1">
                                {isGroupAdmin && (
                                    <button onClick={handleRename} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-[#44A194]/10 hover:text-[#44A194] transition-all text-xs font-bold">
                                        <Edit2 size={16} /> Rename Chat
                                    </button>
                                )}

                                <button
                                    onClick={handleSummarize}
                                    disabled={summaryLoading}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-tealAccent/10 hover:text-tealAccent transition-all text-xs font-bold disabled:opacity-50"
                                >
                                    {summaryLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    {summaryLoading ? "Consulting AI..." : " AI Summary"}
                                </button>

                                <button onClick={() => toggleMute(selectedChat._id)} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-[#44A194]/10 hover:text-[#44A194] transition-all text-xs font-bold">
                                    {isMuted ? <Bell size={16} /> : <BellOff size={16} />}
                                    {isMuted ? "Unmute Alerts" : "Mute Alerts"}
                                </button>

                                <div className="px-4 py-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-secondarySlate/50">Background</span>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => toggleTheme('chill')} className="flex-1 py-1.5 rounded-xl border border-[#44A194]/30 text-[9px] font-black uppercase text-[#44A194] hover:bg-[#44A194] hover:text-white transition-all">Chill</button>
                                        <button onClick={() => toggleTheme('energy')} className="flex-1 py-1.5 rounded-xl border border-softCoral/30 text-[9px] font-black uppercase text-softCoral hover:bg-softCoral hover:text-white transition-all">Energy</button>
                                    </div>
                                </div>

                                <button onClick={onOpenGallery} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-[#44A194]/10 hover:text-[#44A194] transition-all text-xs font-bold">
                                    <Image size={16} /> Media Vault
                                </button>

                                {isGroupAdmin && (
                                    <button onClick={onOpenBroadcast} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-[#44A194]/10 hover:text-[#44A194] transition-all text-xs font-bold">
                                        <Megaphone size={16} /> Broadcast Hub
                                    </button>
                                )}

                                <div className="h-px bg-black/5 mx-2 my-1" />

                                <button onClick={handleClearHistory} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#1A202C] hover:bg-black/5 transition-all text-xs font-bold">
                                    <Trash2 size={16} /> Clear History
                                </button>

                                <button
                                    onClick={handleLeave}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-[#EC8F8D] hover:bg-[#EC8F8D]/10 transition-all text-xs font-bold"
                                >
                                    <LogOut size={16} /> Exit {selectedChat.isCommunity ? "Community" : "Group"}
                                </button>

                                <button
                                    onClick={handleDetachNexus}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-secondarySlate hover:bg-black/5 transition-all text-xs font-bold"
                                >
                                    <Wind size={16} /> Disconnect from Application
                                </button>
                            </div>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </div>
    );
};


export default ChatActionsMenu;
