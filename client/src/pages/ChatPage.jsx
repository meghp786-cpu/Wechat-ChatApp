import React, { useState, useEffect } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ShieldLock from '../components/ShieldLock';
import SearchModal from '../components/SearchModal';
import GroupModal from '../components/GroupModal';
import BroadcastModal from '../components/BroadcastModal';
import { Send, Users, User, User as UserIcon, Plus, Smile, Megaphone, Zap, LogOut, Paperclip, Download, FileText, Image as ImageIcon, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import toast from 'react-hot-toast';
import DiscoverCommunities from '../components/DiscoverCommunities';
import CreateCommunityModal from '../components/CreateCommunityModal';
import ChatActionsMenu from '../components/ChatActionsMenu';
import MediaVault from '../components/MediaVault';
import AIInsightModal from '../components/AIInsightModal';
import UserProfileModal from '../components/UserProfileModal';

const MessageBubble = ({ message, user, isMe, onEdit, onDeleteMe, onDeleteEveryone }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);

    useEffect(() => {
        if (message.isSelfDestruct && !isMe) {
            const timer = setTimeout(async () => {
                setIsVisible(false);
                try {
                    await axios.delete(`/api/messages/${message._id}`);
                } catch (error) {
                    console.error("Failed to delete self-destructing message", error);
                }
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [message, isMe]);

    if (!isVisible) return null;

    const isFile = message.fileUrl;
    const isImage = message.fileType?.startsWith('image/');
    const isDeleted = message.type === 'deleted';

    const handleEditSubmit = (e) => {
        if (e.key === 'Enter') {
            onEdit(message._id, editContent);
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditContent(message.content);
        }
    };

    return (
        <div className={`relative group flex w-full gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && message.sender?.avatar && (
                <img 
                    src={getAvatarUrl(message.sender.avatar)} 
                    alt={message.sender?.name || "User"} 
                    className="w-8 h-8 rounded-full shadow-sm border border-white/20 flex-shrink-0 mb-1"
                    title={message.sender?.name}
                />
            )}
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[70%]`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => isMe && !isDeleted && setShowMenu(!showMenu)}
                    className={`w-fit p-4 rounded-2xl relative cursor-pointer ${isMe ? 'bg-teal-blue-gradient text-white shadow-tealGlow' : 'bg-white/40 text-[#1A202C] border border-white/50 shadow-glass backdrop-blur-[20px]'} shadow-md`}
                >
                {message.isBroadcast && (
                    <div className="absolute -top-2 -left-2 bg-tealAccent text-white p-1 rounded-full shadow-lg border border-white/20">
                        <Megaphone size={10} />
                    </div>
                )}
                {message.isSelfDestruct && (
                    <div className="absolute -top-2 -right-2 bg-softCoral text-white p-1 rounded-full shadow-lg border border-white/20">
                        <Zap size={10} className="animate-pulse" />
                    </div>
                )}

                {isFile && !isDeleted && (
                    <div className="mb-2">
                        {isImage ? (
                            <img src={message.fileUrl} alt="sent" className="rounded-xl max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity border border-white/10" onClick={() => window.open(message.fileUrl)} />
                        ) : (
                            <div className={`flex items-center gap-3 p-3 rounded-xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/5'}`}>
                                <FileText size={24} className={isMe ? "text-white" : "text-tealAccent"} />
                                <div className="flex-1 overflow-hidden">
                                    <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-darkSlate'}`}>{message.fileName || "File"}</p>
                                    <p className={`text-[10px] ${isMe ? 'text-white/60' : 'text-secondarySlate'}`}>{message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ""}</p>
                                </div>
                                <a href={message.fileUrl} download className={`p-2 hover:bg-black/5 rounded-full transition-colors ${isMe ? 'text-white' : 'text-tealAccent'}`}>
                                    <Download size={18} />
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {isEditing ? (
                    <input
                        autoFocus
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={handleEditSubmit}
                        onBlur={() => setIsEditing(false)}
                        className="bg-white/20 text-white border-none outline-none w-full p-1 rounded"
                    />
                ) : (
                    <p className={`text-sm leading-relaxed font-medium break-words whitespace-pre-wrap ${isDeleted ? 'italic opacity-60' : ''}`}>
                        {message.content}
                    </p>
                )}

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        {message.isEdited && !isDeleted && (
                            <span className={`text-[8px] font-bold uppercase ${isMe ? 'text-white/40' : 'text-secondarySlate/40'}`}>Edited</span>
                        )}
                    </div>
                    <p className={`text-[8px] font-black uppercase tracking-tighter ${isMe ? 'opacity-70' : 'text-secondarySlate/60'}`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <AnimatePresence>
                    {showMenu && isMe && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-black/5 overflow-hidden z-30 min-w-[150px]"
                        >
                            {!isDeleted && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-xs font-bold text-darkSlate hover:bg-black/5 transition-colors flex items-center gap-2"
                                >
                                    Edit Message
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteEveryone(message._id); setShowMenu(false); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-softCoral hover:bg-black/5 transition-colors flex items-center gap-2 border-t border-black/5"
                            >
                                Delete for Everyone
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteMe(message._id); setShowMenu(false); }}
                                className="w-full text-left px-4 py-2 text-xs font-bold text-secondarySlate hover:bg-black/5 transition-colors flex items-center gap-2 border-t border-black/5"
                            >
                                Delete for Me
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            </div>
            {isMe && user?.avatar && (
                <img 
                    src={getAvatarUrl(user.avatar)} 
                    alt={user.name || "Me"} 
                    className="w-8 h-8 rounded-full shadow-sm border border-white/20 flex-shrink-0 mb-1"
                    title={user.name || "Me"}
                />
            )}
        </div>
    );
};

const ChatPage = () => {
    const { user } = useAuth();
    const { selectedChat, setSelectedChat, chats, setChats, messages, setMessages, socket, socketConnected, orbColor, setOrbColor, mutedChats, handleDetach } = useChat();
    const { chatId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [activeTab, setActiveTab] = useState("chats"); // "chats" or "communities"
    const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isMemberListOpen, setIsMemberListOpen] = useState(false);
    const [isEncrypting, setIsEncrypting] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isGroupOpen, setIsGroupOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [aiSummary, setAiSummary] = useState("");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);



    const fetchChats = async () => {
        const { data } = await axios.get('/api/chats');
        setChats(data);
    };

    const onEmojiClick = (emojiData) => {
        setContent(prev => prev + emojiData.emoji);
    };

    const fetchMessages = async () => {
        if (!selectedChat) return;
        try {
            const { data } = await axios.get(`/api/messages/${selectedChat._id}`);
            setMessages(data);
        } catch (error) {
            toast.error("Failed to fetch messages");
        }
    };

    const handleLogout = () => {
        toast.success("Safely disconnecting from Wechat...");
        handleDetach();
    };


    useEffect(() => {
        fetchChats();
    }, [user]);

    useEffect(() => {
        fetchMessages();
    }, [selectedChat]);

    useEffect(() => {
        if (chatId && chats.length > 0) {
            const foundChat = chats.find(c => c._id === chatId);
            if (foundChat) {
                setSelectedChat(foundChat);
            }
        }
    }, [chatId, chats, setSelectedChat]);

    useEffect(() => {
        if (socket) {
            socket.on("toggle_disappearing_messages", ({ chatId, enabled }) => {
                if (selectedChat && selectedChat._id === chatId) {
                    setSelectedChat(prev => ({ ...prev, disappearingMessages: enabled }));
                    toast(enabled ? "auto-Disappear active" : " memory retention enabled", {
                        icon: '🛡️',
                    });
                }
                setChats(prev => prev.map(c => c._id === chatId ? { ...c, disappearingMessages: enabled } : c));
            });
        }
    }, [socket, selectedChat]);

    const handleShowProfile = () => {
        if (!selectedChat || selectedChat.isGroupChat || selectedChat.isCommunity) return;
        const otherUser = selectedChat.users.find(u => u._id !== user._id);
        setProfileData(otherUser);
        setIsProfileModalOpen(true);
    };

    const handleAccessChat = async (userId) => {

        try {
            const { data } = await axios.post('/api/chats', { userId });
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
            setSelectedChat(data);
            setOrbColor(['#44A194', '#537D96', '#EC8F8D', '#44A194', '#537D96']); // Default theme
            setIsSearchOpen(false);
        } catch (error) {
            console.error("Error accessing chat", error);
        }
    };

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        if (chat.isCommunity) {
            setOrbColor(['#44A194', '#388E81', '#4DB6AC', '#26A69A', '#009688']); // Teal theme for community
        } else {
            setOrbColor(['#44A194', '#537D96', '#EC8F8D', '#44A194', '#537D96']); // Default theme
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const { data } = await axios.post('/api/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Auto-send message with file if it's an image, or just set content
            const { data: messageData } = await axios.post('/api/messages', {
                content: `Sent a file: ${file.name}`,
                chatId: selectedChat._id,
                fileUrl: data.fileUrl,
                fileType: data.fileType,
                fileName: file.name,
                fileSize: file.size
            });

            socket.emit("new message", messageData);
            setMessages([...messages, messageData]);
            toast.success("File transmitted");
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Transmission failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!content) return;

        setIsEncrypting(true);
        setTimeout(async () => {
            try {
                const { data } = await axios.post('/api/messages', {
                    content,
                    chatId: selectedChat._id,
                });
                socket.emit("new message", data);
                setMessages([...messages, data]);
                setContent("");
            } catch (error) {
                console.error(error);
                toast.error("Transmission failed");
            } finally {
                setIsEncrypting(false);
            }
        }, 150); // Visual delay for encryption effect
    };

    const handleEditMessage = async (messageId, newContent) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/edit/${messageId}`, { content: newContent }, { withCredentials: true });
            socket.emit("message_update", data);
            setMessages(prev => prev.map(m => m._id === messageId ? data : m));
            toast.success("Message modified");
        } catch (error) {
            toast.error("Modification failed");
        }
    };

    const handleDeleteEveryone = async (messageId) => {
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/delete-everyone/${messageId}`, {}, { withCredentials: true });
            socket.emit("message_delete", data);
            setMessages(prev => prev.map(m => m._id === messageId ? data : m));
            toast.success("Message erased for all");
        } catch (error) {
            toast.error("Erasure failed");
        }
    };

    const handleDeleteMe = async (messageId) => {
        try {
            await axios.delete(`/api/messages/${messageId}`);
            setMessages(prev => prev.filter(m => m._id !== messageId));
            toast.success("Message hidden for you");
        } catch (error) {
            toast.error("Failed to hide message");
        }
    };

    useEffect(() => {
        if (socket) {
            const handleMessageReceived = (newMessage) => {
                const senderName = newMessage.sender.name || "User";
                const isGroupChat = newMessage.chat.isGroupChat;
                const isBroadcast = newMessage.isBroadcast;

                if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
                    if (!mutedChats.includes(newMessage.chat._id)) {
                        let toastMsg = `New message from ${senderName}`;
                        let icon = '💬';

                        if (isBroadcast) {
                            toastMsg = `Broadcasting update from ${senderName}`;
                            icon = '📢';
                        } else if (isGroupChat) {
                            toastMsg = `New update in ${newMessage.chat.chatName}`;
                            icon = '👥';
                        }

                        toast.custom((t) => (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => {
                                    navigate('/chat/' + newMessage.chat._id);
                                    if (socket) socket.emit("join chat", newMessage.chat._id);
                                    toast.dismiss(t.id);
                                }}
                                className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white/40 backdrop-blur-[20px] shadow-glass border border-white/50 rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer overflow-hidden group`}
                            >
                                <div className="flex-1 w-0 p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 pt-0.5">
                                            <div className="w-10 h-10 rounded-full bg-teal-blue-gradient flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                                                <span className="text-xl">{icon}</span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <p className="text-sm font-black text-darkSlate tracking-tight">
                                                {isBroadcast ? "New Broadcast" : (isGroupChat ? "New Group Update" : "New Transmission")}
                                            </p>
                                            <p className="mt-1 text-xs font-bold text-secondarySlate leading-tight opacity-80">
                                                {toastMsg}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex border-l border-black/5">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toast.dismiss(t.id);
                                        }}
                                        className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black uppercase tracking-widest text-secondarySlate hover:text-softCoral transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        ), {
                            duration: 4000,
                            position: 'top-right'
                        });
                    }
                } else {
                    setMessages([...messages, newMessage]);
                }
            };

            socket.on("message recieved", handleMessageReceived);

            socket.on("message_updated", (updatedMessage) => {
                setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
            });

            socket.on("message_deleted", (deletedMessage) => {
                setMessages(prev => prev.map(m => m._id === deletedMessage._id ? deletedMessage : m));
            });

            return () => {
                socket.off("message recieved", handleMessageReceived);
                socket.off("message_updated");
                socket.off("message_deleted");
            };
        }
    }, [socket, selectedChat, messages]);


    return (
        <div className="flex h-screen w-full text-darkSlate overflow-hidden p-6 gap-6 font-space">
            <ShieldLock isVisible={isEncrypting} />
            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectUser={handleAccessChat}
            />
            <GroupModal
                isOpen={isGroupOpen}
                onClose={() => setIsGroupOpen(false)}
                fetchChats={fetchChats}
            />
            <BroadcastModal
                isOpen={isBroadcastOpen}
                onClose={() => setIsBroadcastOpen(false)}
                fetchChats={fetchChats}
            />
            <DiscoverCommunities isOpen={isDiscoverOpen} onClose={() => setIsDiscoverOpen(false)} />
            <CreateCommunityModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {/* File Transfer Animation */}
            <AnimatePresence>
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, x: -100, y: 100, rotate: -45 }}
                        animate={{ opacity: 1, scale: 1, x: 200, y: -200, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 400, y: -400 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="fixed bottom-20 left-1/4 z-[100] pointer-events-none"
                    >
                        <div className="bg-white/20 p-6 rounded-3xl border border-white/30 shadow-glass backdrop-blur-[12px]">
                            <FileText size={64} className="text-tealAccent" />
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                className="mt-2 text-center text-[10px] font-bold text-tealAccent uppercase tracking-widest"
                            >
                                Transmitting...
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="backdrop-blur-[20px] bg-white/40 border border-white/50 rounded-3xl w-80 flex flex-col shadow-glass"
            >
                <div className="p-6 border-b border-black/5 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-black text-darkSlate italic tracking-tighter">Wechat</h1>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90, boxShadow: "0 0 15px rgba(68, 161, 148, 0.4)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 bg-white/30 hover:bg-white/50 rounded-full transition-colors text-tealAccent border border-white/20"
                                title="Search Users"
                            >
                                <Plus size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(68, 161, 148, 0.4)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                    setProfileData(user);
                                    setIsProfileModalOpen(true);
                                }}
                                className="p-2 bg-white/30 hover:bg-white/50 rounded-full transition-colors text-tealAccent border border-white/20"
                                title="My Profile"
                            >
                                <UserIcon size={20} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(236, 143, 141, 0.3)" }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLogout}
                                className="p-2 bg-white/30 hover:bg-softCoral/20 rounded-full transition-colors text-softCoral border border-white/20"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsGroupOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/20 hover:bg-white/40 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all text-secondarySlate"
                        >
                            <Users size={14} /> Group
                        </button>
                        <motion.button
                            animate={{ boxShadow: ["0 0 0px rgba(68, 161, 148, 0)", "0 0 10px rgba(68, 161, 148, 0.4)", "0 0 0px rgba(68, 161, 148, 0)"] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            onClick={() => setIsBroadcastOpen(true)}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-tealAccent text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-tealAccent/50 transition-all shadow-tealGlow"
                        >
                            <Zap size={14} /> Broadcast
                        </motion.button>
                    </div>

                    <div className="flex bg-black/5 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setActiveTab("chats")}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "chats" ? "bg-white text-darkSlate shadow-sm" : "text-secondarySlate hover:bg-white/20"}`}
                        >
                            Chats
                        </button>
                        <button
                            onClick={() => setActiveTab("communities")}
                            className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "communities" ? "bg-white text-darkSlate shadow-sm" : "text-secondarySlate hover:bg-white/20"}`}
                        >
                            Communities
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {activeTab === "communities" && (
                        <div className="space-y-2 mb-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="w-full p-4 rounded-2xl bg-tealAccent text-white flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                                style={{ backgroundColor: '#44A194' }}
                            >
                                <Plus size={16} /> Create Community
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setIsDiscoverOpen(true)}
                                className="w-full p-4 rounded-2xl bg-tealAccent/10 border border-tealAccent/30 text-tealAccent flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
                            >
                                <Zap size={16} /> Discover Communities
                            </motion.button>

                            <div className="pt-4 pb-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondarySlate opacity-50 px-2">My Communities</h3>
                            </div>
                        </div>
                    )}
                    {chats.filter(chat => activeTab === "communities" ? chat.isCommunity : !chat.isCommunity).map(chat => (
                        <div
                            key={chat._id}
                            onClick={() => handleSelectChat(chat)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedChat?._id === chat._id ? 'bg-white/50 border-white/30 shadow-sm' : 'hover:bg-white/20 border-transparent'} border`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-blue-gradient flex items-center justify-center text-white shadow-md">
                                    {chat.isGroupChat ? <Users size={20} /> : <User size={20} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm text-darkSlate truncate">
                                        {chat.isGroupChat ? chat.chatName : chat.users.find(u => u._id !== user._id).name}
                                    </h3>
                                    {!chat.isGroupChat && (
                                        <p className="text-[10px] text-tealAccent font-bold font-mono">
                                            @{chat.users.find(u => u._id !== user._id).username}
                                        </p>
                                    )}
                                    <p className={`text-xs truncate ${chat.isCommunity ? 'text-darkSlate font-medium' : 'text-secondarySlate'}`}>
                                        {chat.isCommunity ? (chat.community?.description || "Gateway to Nexus") : (chat.latestMessage?.content || "No messages yet")}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex-1 backdrop-blur-[20px] bg-white/40 border border-white/50 rounded-3xl flex flex-col shadow-glass"
            >
                {selectedChat ? (
                    <>
                        <div className="p-6 border-b border-black/5 flex items-center justify-between">
                            <h2 className="text-lg font-black text-darkSlate tracking-tight">
                                {selectedChat.isGroupChat ? selectedChat.chatName : (
                                    <div className="flex flex-col">
                                        <span>{selectedChat.users.find(u => u._id !== user._id).name}</span>
                                        <span className="text-xs text-tealAccent font-bold font-mono">@{selectedChat.users.find(u => u._id !== user._id).username}</span>
                                    </div>
                                )}
                                {selectedChat.disappearingMessages && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-tealAccent/10 rounded-full border border-tealAccent/20">
                                        <Timer size={10} className="text-tealAccent animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-tealAccent">Purge</span>
                                    </div>
                                )}
                            </h2>


                            {(selectedChat.isGroupChat || selectedChat.isCommunity) ? (
                                <ChatActionsMenu
                                    onOpenBroadcast={() => setIsBroadcastOpen(true)}
                                    onOpenGallery={() => setIsGalleryOpen(true)}
                                    onShowAIInsight={(text) => {
                                        setAiSummary(text);
                                        setIsAIModalOpen(true);
                                    }}
                                />
                            ) : (
                                <ChatActionsMenu
                                    onOpenGallery={() => setIsGalleryOpen(true)}
                                    onShowAIInsight={(text) => {
                                        setAiSummary(text);
                                        setIsAIModalOpen(true);
                                    }}
                                    onShowProfile={handleShowProfile}
                                />
                            )}


                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col">
                            {messages.map((m, i) => {
                                const isMe = m.sender?._id === user?._id;
                                return (
                                    <MessageBubble
                                        key={m?._id || i}
                                        message={m}
                                        user={user}
                                        isMe={isMe}
                                        onEdit={handleEditMessage}
                                        onDeleteMe={handleDeleteMe}
                                        onDeleteEveryone={handleDeleteEveryone}
                                    />
                                );
                            })}
                        </div>

                        <div className="px-6 relative">
                            <AnimatePresence>
                                {isEmojiOpen && (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0, scale: 0.95 }}
                                        animate={{ y: 0, opacity: 1, scale: 1 }}
                                        exit={{ y: 20, opacity: 0, scale: 0.95 }}
                                        className="absolute bottom-full left-6 mb-4 z-50 shadow-glass rounded-3xl overflow-hidden"
                                    >
                                        <EmojiPicker
                                            theme="light"
                                            onEmojiClick={onEmojiClick}
                                            searchDisabled
                                            skinTonesDisabled
                                            width={350}
                                            height={400}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-6 border-t border-black/5 flex gap-4 items-center">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className={`p-3 rounded-2xl transition-all ${uploading ? 'bg-tealAccent text-white' : 'hover:bg-white/40 text-secondarySlate border border-white/20'}`}
                                disabled={uploading}
                            >
                                <Paperclip size={24} className={uploading ? "animate-bounce" : ""} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                                className={`p-2 rounded-2xl transition-all ${isEmojiOpen ? 'bg-tealAccent text-white' : 'hover:bg-white/40 text-secondarySlate border border-white/20'}`}
                            >
                                <Smile size={24} />
                            </button>
                            <input
                                type="text"
                                placeholder="Secure message..."
                                className="flex-1 bg-white/60 border border-white/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-tealAccent transition-colors font-bold text-darkSlate placeholder:text-secondarySlate/50 shadow-inner"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-tealAccent text-white p-4 rounded-2xl hover:opacity-90 transition-opacity shadow-tealGlow"
                            >
                                <Send size={24} />
                            </motion.button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-secondarySlate/50 font-black italic uppercase tracking-widest text-sm">
                        Select a chat to start chatting
                    </div>
                )}
            </motion.div>

            {/* Member List Drawer */}
            <AnimatePresence>
                {isMemberListOpen && selectedChat?.isCommunity && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="w-64 backdrop-blur-[20px] bg-white/40 border border-white/50 rounded-3xl flex flex-col shadow-glass overflow-hidden"
                    >
                        <div className="p-6 border-b border-black/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondarySlate">Community Roster</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar" >
                            {selectedChat.users.map((member) => (
                                <div key={member._id} className="flex items-center gap-3 p-2 rounded-xl bg-white/20 border border-white/10" >
                                    <img src={getAvatarUrl(member.avatar)} className="w-8 h-8 rounded-full" alt="" />
                                    <div className="min-w-0" >
                                        <p className="text-xs font-bold text-darkSlate truncate" > {member.name}</p >
                                        <p className="text-[8px] text-tealAccent font-mono" > @{member.username}</p >
                                    </div >
                                </div >
                            ))}
                        </div >
                    </motion.div >
                )}
            </AnimatePresence >

            {/* Modals */}
            <MediaVault
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                messages={messages}
            />
            <AIInsightModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                summary={aiSummary}
            />
            <UserProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
                userProfile={profileData}
            />
        </div>



    );
};

export default ChatPage;
