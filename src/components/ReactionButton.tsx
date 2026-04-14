import React from 'react';
import { motion } from 'framer-motion';

interface ReactionButtonProps {
    eventId: number;
    userReaction?: string | null;  // legacy
    userReactions?: string[];
    isLiked?: boolean; // legacy
    reactionsCounts?: Record<string, number>;
    onReact: (type: string) => void;
    orientation?: 'vertical' | 'horizontal';
}

const reactions = [
    { type: 'like', label: '👍', activeBg: 'bg-blue-500/80', activeShadow: 'shadow-[0_0_12px_rgba(59,130,246,0.6)]' },
    { type: 'love', label: '❤️', activeBg: 'bg-red-500/80', activeShadow: 'shadow-[0_0_12px_rgba(239,68,68,0.6)]' },
    { type: 'haha', label: '😂', activeBg: 'bg-yellow-500/80', activeShadow: 'shadow-[0_0_12px_rgba(234,179,8,0.6)]' },
    { type: 'angry', label: '😡', activeBg: 'bg-orange-600/80', activeShadow: 'shadow-[0_0_12px_rgba(234,88,12,0.6)]' },
    { type: 'fire', label: '🔥', activeBg: 'bg-orange-500/80', activeShadow: 'shadow-[0_0_12px_rgba(249,115,22,0.6)]' },
];

const ReactionButton: React.FC<ReactionButtonProps> = ({ eventId, userReactions, userReaction, reactionsCounts = {}, onReact, orientation = 'vertical' }) => {
    // Merge new array format with legacy format to avoid breaks
    const activeReactions = userReactions ? userReactions : (userReaction ? [userReaction] : []);

    const isHorizontal = orientation === 'horizontal';

    return (
        <div className={`flex gap-1 pointer-events-auto ${isHorizontal ? 'flex-row items-center' : 'flex-col items-end'}`}>
            <div className={`flex bg-white/25 backdrop-blur-md rounded-[2rem] border border-gray-200/50 shadow-[0_8px_30px_rgba(0,0,0,0.15)] ${isHorizontal ? 'flex-row gap-3 px-4 py-2' : 'flex-col gap-[6px] p-1.5'}`}>
                {reactions.map((r) => {
                    const isActive = activeReactions.includes(r.type);
                    const count = reactionsCounts[r.type] || 0;

                    return (
                        <div key={r.type} className={`flex group relative ${isHorizontal ? 'flex-col items-center gap-1' : 'flex-row items-center gap-1.5'}`}>
                            {/* Le compteur pour le layout vertical */}
                            {!isHorizontal && count > 0 && (
                                <span className={`absolute right-full mr-3 text-sm font-black drop-shadow-sm transition-all duration-300 ${isActive ? 'text-red-600 scale-110' : 'text-red-500'}`}>
                                    {count}
                                </span>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.25 }}
                                whileTap={{ scale: 0.85 }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onReact(r.type);
                                }}
                                className={`flex items-center justify-center rounded-full transition-all duration-300 ${isHorizontal ? 'w-8 h-8' : 'w-7 h-7'} ${isActive
                                    ? `${r.activeBg} ${r.activeShadow} border-white/40 border scale-110`
                                    : `bg-transparent grayscale hover:grayscale-0 ${isHorizontal ? 'hover:bg-white/50' : 'hover:bg-gray-100'}`
                                    }`}
                                title={r.type}
                            >
                                <span className={`leading-none ${isHorizontal ? 'text-lg' : 'text-sm'} ${isActive ? '' : 'opacity-80'}`}>{r.label}</span>
                            </motion.button>

                            {/* Le compteur pour le layout horizontal */}
                            {isHorizontal && (
                                count > 0 ? (
                                    <span className={`text-[11px] font-black drop-shadow-sm transition-all duration-300 leading-none ${isActive ? 'text-red-600 scale-110' : 'text-red-500'}`}>
                                        {count}
                                    </span>
                                ) : (
                                    <span className="text-[11px] h-[11px] leading-none opacity-0 select-none">0</span>
                                )
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReactionButton;
