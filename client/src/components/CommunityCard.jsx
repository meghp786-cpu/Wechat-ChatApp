import React from 'react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import { motion } from 'framer-motion';
import { Users, Star, ArrowRight } from 'lucide-react';

const CommunityCard = ({ community, onJoin, joining }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="group relative overflow-hidden rounded-[32px] bg-white/30 border border-white/50 backdrop-blur-xl shadow-glass transition-all duration-300 h-[280px] flex flex-col"
        >
            {/* Banner Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src={getAvatarUrl(community.banner || community.avatar) || "https://images.unsplash.com/photo-1614850523296-d8c1af03d400?q=80&w=2070&auto=format&fit=crop"}
                    className="w-full h-full object-cover blur-[2px] opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                    alt=""
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/40 to-transparent" />
            </div>

            <div className="relative z-10 p-6 flex flex-col h-full">
                {/* Header: Avatar and badge */}
                <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-teal-blue-gradient flex items-center justify-center text-white shadow-tealGlow overflow-hidden border-2 border-white/50">
                        {community.avatar ? (
                            <img src={getAvatarUrl(community.avatar)} alt={community.name} className="w-full h-full object-cover" />
                        ) : (
                            <Users size={24} />
                        )}
                    </div>
                    <div className="bg-tealAccent/10 backdrop-blur-md border border-tealAccent/20 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <Users size={12} className="text-tealAccent" />
                        <span className="text-[10px] font-black text-tealAccent font-mono tracking-tighter">
                            {community.members?.length || 0}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-lg font-black text-darkSlate leading-tight mb-2 group-hover:text-tealAccent transition-colors">
                        {community.name}
                    </h3>
                    <p className="text-xs text-secondarySlate line-clamp-2 font-medium italic opacity-80 leading-relaxed">
                        "{community.description}"
                    </p>
                </div>

                {/* Footer: Join Action */}
                <button
                    onClick={() => onJoin(community._id)}
                    disabled={joining}
                    className="w-full mt-4 py-3 bg-tealAccent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-tealGlow shadow-lg active:scale-95"
                >
                    {joining ? "Synchronizing..." : (
                        <>
                            Join Community <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default CommunityCard;
