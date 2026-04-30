import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User as UserIcon, Mail, Shield, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfileModal = ({ isOpen, onClose, userProfile }) => {
    const { user, setUser } = useAuth();
    const [uploading, setUploading] = useState(false);

    if (!userProfile) return null;

    const isMe = user && user._id === userProfile._id;

    const handleAvatarUpdate = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const updateRes = await axios.put('/api/users/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update user state for cache busting
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updatedInfo = { ...userInfo, avatar: updateRes.data.avatar };
            localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
            setUser(updatedInfo);

            toast.success("Profile photo updated!");
            onClose(); // Optional: Close modal or stay open to let them see it
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile photo");
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/20 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md backdrop-blur-[30px] bg-white/70 border border-white/50 rounded-[40px] shadow-glass overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-end mb-4">
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#1A202C]/50"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 rounded-full border-4 border-white/80 shadow-lg overflow-hidden relative group">
                                        <img
                                            src={getAvatarUrl(isMe ? user.avatar : userProfile.avatar)}
                                            alt={userProfile.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {isMe && (
                                            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                {uploading ? <Loader2 className="animate-spin text-white" size={24} /> : <Camera className="text-white" size={24} />}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpdate} disabled={uploading} />
                                            </label>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-tealAccent border-2 border-white shadow-sm" />
                                </div>

                                <h2 className="text-2xl font-black text-[#1A202C] mb-1">{userProfile.name}</h2>
                                <p className="text-secondarySlate font-bold text-sm mb-2">@{userProfile.username}</p>
                                <p className="text-[#1A202C]/70 text-xs italic mb-6 px-4">"{userProfile.bio || 'Available'}"</p>

                                <div className="w-full space-y-3">
                                    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-3xl border border-white/20">
                                        <div className="p-2 bg-tealAccent/10 rounded-xl text-tealAccent">
                                            <Mail size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase text-secondarySlate opacity-50">Email</p>
                                            <p className="text-xs font-bold text-[#1A202C]">{userProfile.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-3xl border border-white/20">
                                        <div className="p-2 bg-softCoral/10 rounded-xl text-softCoral">
                                            <Calendar size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase text-secondarySlate opacity-50">Date</p>
                                            <p className="text-xs font-bold text-[#1A202C]">
                                                {new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white/40 rounded-3xl border border-white/20">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                            <Shield size={18} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black uppercase text-secondarySlate opacity-50">Status</p>
                                            <p className="text-xs font-bold text-[#1A202C]">Active Member</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Premium Gradient bar */}
                        <div className="h-1.5 w-full bg-teal-blue-gradient" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileModal;
