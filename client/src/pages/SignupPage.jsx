import React, { useState } from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Copy, Check, Info, Camera, ArrowRight, User as UserIcon, Paperclip, Loader2 } from 'lucide-react';
import axios from 'axios';

const SignupPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showPhotoStep, setShowPhotoStep] = useState(false);
    const [generatedUsername, setGeneratedUsername] = useState('');
    const [copied, setCopied] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [uploading, setUploading] = useState(false);

    const { signup, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await signup({ firstName, lastName, email, password });
            setGeneratedUsername(data.username);
            setShowSuccessModal(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUsername);
        setCopied(true);
        toast.success('Username copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const { data } = await axios.post('/api/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setAvatar(data.fileUrl);
            toast.success("Profile photo uploaded!");
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const finalizeSignup = async () => {
        try {
            const finalAvatar = avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${generatedUsername}`;
            const { data } = await axios.put('/api/users/update', { avatar: finalAvatar });

            // Update local user context
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updatedInfo = { ...userInfo, avatar: data.avatar };
            localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
            setUser(updatedInfo);

            toast.success("Identity Verified. Entering Nexus.");
            navigate('/chat');
        } catch (error) {
            toast.error("Failed to finalize profile");
        }
    };

    const handleProceedToPhoto = () => {
        setShowSuccessModal(false);
        setShowPhotoStep(true);
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden relative">
            <AnimatePresence mode="wait">
                {!showSuccessModal && !showPhotoStep ? (
                    <motion.div
                        key="signup-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="backdrop-blur-[12px] bg-white/20 p-8 rounded-3xl border border-white/20 shadow-glass w-full max-w-md"
                    >
                        <h2 className="text-3xl font-black text-darkSlate mb-6 text-center italic tracking-tighter uppercase">
                            Signup Here
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-all placeholder:text-secondarySlate/40"
                                        placeholder="John"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-all placeholder:text-secondarySlate/40"
                                        placeholder="Doe"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">Email </label>
                                <input
                                    type="email"
                                    className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-all placeholder:text-secondarySlate/40"
                                    placeholder="neural@nexus.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">Security Key</label>
                                <input
                                    type="password"
                                    className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-all placeholder:text-secondarySlate/40"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <p className="text-[10px] text-secondarySlate/70 mt-2 flex items-center gap-1 font-bold">
                                    <Info size={10} /> REQUIRES 3 CAPS, 3 SMALL, 3 NUMBERS
                                </p>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-tealAccent text-white font-black py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all mt-6 shadow-tealGlow uppercase tracking-widest text-sm"
                            >
                                SignUp
                            </button>
                        </form>
                        <p className="text-secondarySlate/70 text-center mt-6 text-xs font-bold uppercase tracking-widest">
                            Existing User? <Link to="/login" className="text-tealAccent hover:underline font-bold decoration-tealAccent/30 decoration-2 underline-offset-4">Initiate Login</Link>
                        </p>
                    </motion.div>
                ) : showSuccessModal ? (
                    <motion.div
                        key="success-modal"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="backdrop-blur-[12px] bg-white/40 p-10 rounded-[2.5rem] border border-white/20 shadow-glass w-full max-w-md text-center border-l-4 border-l-tealAccent"
                    >
                        <div className="w-20 h-20 bg-tealAccent/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-tealAccent/30 shadow-tealGlow">
                            <Check className="text-tealAccent" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-darkSlate mb-2 tracking-tighter uppercase">Initialized</h2>
                        <p className="text-secondarySlate mb-8 text-xs font-bold uppercase tracking-widest">Welcome to the network. Your unique digital identifier has been generated.</p>

                        <div className="bg-white/40 border border-white/20 rounded-2xl p-6 mb-8 relative group shadow-sm">
                            <label className="absolute -top-3 left-4 bg-white/50 backdrop-blur-md px-2 text-[10px] font-black text-tealAccent uppercase tracking-widest border border-white/20 rounded-full">Digital ID</label>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-2xl font-mono font-black text-darkSlate tracking-wider">@{generatedUsername}</span>
                                <button
                                    onClick={copyToClipboard}
                                    className="p-3 bg-white/60 hover:bg-white/80 rounded-xl transition-all text-tealAccent group-active:scale-90 shadow-sm border border-white/20"
                                >
                                    {copied ? <Check size={20} /> : <Copy size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleProceedToPhoto}
                            className="w-full bg-tealAccent text-white font-black py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-tealGlow uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            Next: Profile Scan <ArrowRight size={18} />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="photo-modal"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="backdrop-blur-[12px] bg-white/40 p-10 rounded-[2.5rem] border border-white/20 shadow-glass w-full max-w-md text-center border-r-4 border-r-tealAccent"
                    >
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            <div className="w-full h-full rounded-full border-2 border-dashed border-tealAccent/50 flex items-center justify-center overflow-hidden bg-white/20">
                                {avatar ? (
                                    <img src={getAvatarUrl(avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={48} className="text-tealAccent/30" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-3 bg-tealAccent text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <Camera size={20} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        <h2 className="text-3xl font-black text-darkSlate mb-2 tracking-tighter uppercase">Visual ID Scan</h2>
                        <p className="text-secondarySlate mb-8 text-xs font-bold uppercase tracking-widest">Synchronize your biological appearance with your digital shard (Optional).</p>

                        <div className="space-y-4">
                            <button
                                onClick={finalizeSignup}
                                disabled={uploading}
                                className="w-full bg-tealAccent text-white font-black py-4 rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-tealGlow uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {uploading ? <Loader2 className="animate-spin" size={20} /> : avatar ? "Confirm Scan" : "Skip for now"}
                            </button>

                            {!avatar && (
                                <p className="text-[10px] text-secondarySlate/50 font-black uppercase tracking-widest">
                                    A default 3D avatar will be assigned if skipped.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SignupPage;
