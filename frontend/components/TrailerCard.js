import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TrailerCard({
    index,
    title,
    platform,
    trailerUrl,
    posterUrl,
    onPlay,
    year,
    aspectRatio = "aspect-[2/3]"
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rX = (y - centerY) / 10;
        const rY = (centerX - x) / 10;
        setRotateX(rX);
        setRotateY(rY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        setRotateX(0);
        setRotateY(0);
    };

    const handleClick = (e) => {
        // PREVENT ALL DEFAULT BROWSER BEHAVIOR
        e.preventDefault();
        e.stopPropagation();

        // Convert watch to embed format just in case it's used in state
        const finalUrl = trailerUrl.includes('watch?v=')
            ? trailerUrl.replace('watch?v=', 'embed/')
            : trailerUrl;

        // Trigger the in-app modal via parent state
        onPlay(index, finalUrl, true);
    };

    return (
        <div
            className="relative group perspective-1000"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                onClick={handleClick}
                style={{
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformStyle: 'preserve-3d',
                }}
                animate={{
                    scale: isHovered ? 1.05 : 1,
                    boxShadow: isHovered
                        ? '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(229, 9, 20, 0.3)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                className="relative bg-[#111] rounded-xl overflow-hidden cursor-pointer border border-white/10 transition-shadow duration-300 z-20"
            >
                {/* Poster Image Only (Safe and Simple) */}
                <div className={`${aspectRatio} relative overflow-hidden`}>
                    <img
                        src={posterUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-z-20 pointer-events-none">
                    <div className="flex items-center justify-between items-end gap-2">
                        <h3 className="text-white font-bold text-lg mb-1 leading-tight truncate flex-grow">{title}</h3>
                        {year && <span className="text-gray-400 text-[10px] mb-1.5">{year}</span>}
                    </div>
                    <p className="text-primary font-bold text-xs uppercase tracking-wider">{platform}</p>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 pointer-events-none">
                    <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)] transform scale-75 group-hover:scale-100 transition-transform duration-500 mb-3">
                        <span className="material-symbols-outlined text-4xl filled">play_arrow</span>
                    </div>
                    <span className="text-white text-[10px] font-bold tracking-[0.2em] uppercase bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Play Trailer</span>
                </div>

                {/* Hover Glow */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none z-10"
                    style={{
                        background: 'radial-gradient(circle at center, white 0%, transparent 70%)',
                    }}
                />
            </motion.div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .translate-z-20 {
                    transform: translateZ(20px);
                }
            `}</style>
        </div>
    );
}
