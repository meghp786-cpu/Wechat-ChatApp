import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/chat');
        } catch (error) {
            alert(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="backdrop-blur-[12px] bg-white/20 p-8 rounded-3xl border border-white/20 shadow-glass w-full max-w-md"
            >
                <h2 className="text-3xl font-black text-darkSlate italic tracking-tighter mb-6 text-center">
                    Login to Wechat
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">Email Endpoint</label>
                        <input
                            type="email"
                            className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors placeholder:text-secondarySlate/40"
                            placeholder="neural@nexus.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-secondarySlate uppercase tracking-widest mb-1 ml-1">Security Key</label>
                        <input
                            type="password"
                            className="w-full bg-white/40 border border-white/20 rounded-xl py-3 px-4 text-darkSlate focus:outline-none focus:border-tealAccent transition-colors placeholder:text-secondarySlate/40"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-tealAccent text-white font-black py-4 rounded-xl hover:opacity-90 transition-opacity mt-6 shadow-tealGlow uppercase tracking-widest text-sm"
                    >
                        Login
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-white/20" />
                        <span className="text-xs text-secondarySlate/50 font-bold uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-white/20" />
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await loginWithGoogle();
                                navigate('/chat');
                            } catch (err) {
                                alert('Google sign-in failed: ' + err.message);
                            }
                        }}
                        className="w-full flex items-center justify-center gap-3 bg-white/20 hover:bg-white/30 border border-white/20 text-darkSlate font-black py-3 rounded-xl transition-all uppercase tracking-widest text-sm"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                        Continue with Google
                    </button>
                </form>
                <p className="text-secondarySlate/70 text-center mt-6 text-xs font-bold uppercase tracking-widest">
                    New here? <Link to="/signup" className="text-tealAccent hover:underline decoration-tealAccent/30 decoration-2 underline-offset-4">Create Account</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
