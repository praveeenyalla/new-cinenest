import { motion } from 'framer-motion';

export default function TrailerModal({ trailerUrl, title, onClose, withAudio = true }) {
    if (!trailerUrl) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8">
            {/* Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-pointer"
            />

            {/* Modal Container */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="relative w-full max-w-5xl bg-[#0b0b0b] rounded-2xl overflow-hidden shadow-[0_0_100px_rgba(229,9,20,0.3)] border border-white/10 z-50"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 bg-white/5 hover:bg-primary hover:text-white text-white p-2 rounded-full transition-all duration-300 border border-white/10 hover:border-primary group/close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/close:rotate-90 transition-transform">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Video Area */}
                <div className="aspect-video w-full bg-black">
                    <iframe
                        src={`${trailerUrl}?autoplay=1&mute=${withAudio ? '0' : '1'}&controls=1&modestbranding=1&rel=0`}
                        title={title || "Trailer"}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                </div>

                {/* Footer Info */}
                <div className="p-6 md:p-8 flex items-center justify-between bg-gradient-to-r from-[#0b0b0b] via-[#151515] to-[#0b0b0b]">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-1 uppercase tracking-tighter">
                            {title || "Now Playing"}
                        </h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Direct Feed
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
