import React, { useState, useEffect, useRef } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Image, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useChat } from '../context/ChatContext';
import toast from 'react-hot-toast';

const CreateCommunityModal = ({ isOpen, onClose }) => {
    const { setIsHighSpeed, setChats, setSelectedChat, setOrbColor } = useChat();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [banner, setBanner] = useState('');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const [isNameAvailable, setIsNameAvailable] = useState(null);
    const [loading, setLoading] = useState(false);

    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (name.length > 2) {
                checkNameAvailability();
            } else {
                setIsNameAvailable(null);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [name]);

    const checkNameAvailability = async () => {
        setIsCheckingName(true);
        try {
            const { data } = await axios.get(`/api/chats/community/check-name?name=${name}`);
            setIsNameAvailable(data.available);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCheckingName(false);
        }
    };

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            if (type === 'avatar') setUploadingAvatar(true);
            else setUploadingBanner(true);

            const { data } = await axios.post('/api/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (type === 'avatar') setAvatar(data.fileUrl);
            else setBanner(data.fileUrl);

            toast.success("Image uploaded");
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            if (type === 'avatar') setUploadingAvatar(false);
            else setUploadingBanner(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !description || isNameAvailable === false) return;

        setLoading(true);
        setIsHighSpeed(true); // Trigger Silk Orb high-speed animation

        try {
            const { data } = await axios.post('/api/chats/community', {
                name, description, bio, avatar, banner, isPublic: true
            });

            toast.success("Community established");
            setOrbColor(['#44A194', '#2D5A56', '#44A194', '#537D96', '#2D5A56']); // Teal theme
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Creation failed");
        } finally {
            setLoading(false);
            setTimeout(() => setIsHighSpeed(false), 300);
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
                        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg backdrop-blur-3xl bg-white/70 border border-white/50 rounded-[40px] shadow-glass p-8 overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tealAccent to-transparent opacity-50" />

                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-darkSlate tracking-tight">Community</h2>
                                <p className="text-xs text-secondarySlate font-mono uppercase tracking-widest mt-1 opacity-60">Forge a new community</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                                <X size={24} className="text-darkSlate" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Banner Upload */}
                            <div
                                onClick={() => bannerInputRef.current?.click()}
                                className="relative h-32 w-full rounded-2xl bg-black/5 border-2 border-dashed border-black/10 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-tealAccent/30 transition-colors"
                            >
                                {banner ? (
                                    <img src={getAvatarUrl(banner)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-secondarySlate/40 group-hover:text-tealAccent transition-colors">
                                        <Image size={32} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Community Banner</span>
                                    </div>
                                )}
                                {uploadingBanner && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="animate-spin text-tealAccent" />
                                    </div>
                                )}
                                <input type="file" ref={bannerInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'banner')} accept="image/*" />
                            </div>

                            <div className="flex gap-6 items-end">
                                {/* Avatar Upload */}
                                <div
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="relative w-24 h-24 rounded-3xl bg-black/5 border-2 border-dashed border-black/10 flex items-center justify-center cursor-pointer overflow-hidden group shrink-0 hover:border-tealAccent/30 transition-colors"
                                >
                                    {avatar ? (
                                        <img src={getAvatarUrl(avatar)} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <Camera className="text-secondarySlate/40 group-hover:text-tealAccent transition-colors" />
                                    )}
                                    {uploadingAvatar && (
                                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                            <Loader2 className="animate-spin text-tealAccent" />
                                        </div>
                                    )}
                                    <input type="file" ref={avatarInputRef} className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} accept="image/*" />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="COMMUNITY NAME"
                                            className="w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-tealAccent transition-all font-black text-darkSlate tracking-tight placeholder:text-secondarySlate/30"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isCheckingName && <Loader2 size={16} className="animate-spin text-tealAccent" />}
                                            {isNameAvailable === true && <Check size={16} className="text-green-500" />}
                                            {isNameAvailable === false && <AlertCircle size={16} className="text-red-500" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="BRIEF DESCRIPTION"
                                    className="w-full bg-white/40 border border-white/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-tealAccent transition-all font-bold text-darkSlate placeholder:text-secondarySlate/30"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <textarea
                                    placeholder="EXTENDED BIO"
                                    className="w-full h-24 bg-white/40 border border-white/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-tealAccent transition-all font-medium text-darkSlate placeholder:text-secondarySlate/30 resize-none"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading || isNameAvailable === false}
                                className="w-full bg-tealAccent text-white py-4 rounded-[20px] font-black uppercase tracking-widest text-sm shadow-tealGlow disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <span>Create Community</span>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateCommunityModal;
