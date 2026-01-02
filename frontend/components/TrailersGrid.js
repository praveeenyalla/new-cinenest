import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrailerCard from './TrailerCard';

export const TRAILERS_DATA = [
    {
        title: "Stranger Things",
        platform: "Netflix",
        trailerUrl: "https://www.youtube.com/embed/PssKpzB0Ah0",
        posterUrl: "/posters/stranger_things.png"
    },
    {
        title: "John Wick: Chapter 4",
        platform: "Prime Video",
        trailerUrl: "https://www.youtube.com/embed/qEVUtrk8_B4",
        posterUrl: "/posters/john_wick_4.png"
    },
    {
        title: "Avengers: Endgame",
        platform: "Disney+",
        trailerUrl: "https://www.youtube.com/embed/SKOIpVLXM7Q",
        posterUrl: "/posters/avengers_endgame.png"
    },
    {
        title: "The Bear",
        platform: "Hulu",
        trailerUrl: "https://www.youtube.com/embed/vOyRo-Yjr2Q",
        posterUrl: "/posters/the_bear.png"
    },
    {
        title: "Money Heist",
        platform: "Netflix",
        trailerUrl: "https://www.youtube.com/embed/_InqQJRqGW4",
        posterUrl: "/posters/money_heist.png"
    },
    {
        title: "The Boys",
        platform: "Prime Video",
        trailerUrl: "https://www.youtube.com/embed/5SKP1_F7ReE",
        posterUrl: "/posters/the_boys.png"
    },
    {
        title: "The Mandalorian",
        platform: "Disney+",
        trailerUrl: "https://www.youtube.com/embed/aOC8E8z_ifw",
        posterUrl: "/posters/mandalorian.png"
    },
    {
        title: "Only Murders in the Building",
        platform: "Hulu",
        trailerUrl: "https://www.youtube.com/embed/QdGZcu4qzqE",
        posterUrl: "/posters/only_murders.png"
    }
];

export default function TrailersGrid({ activeId, onPlay, onStop }) {
    const columns = [
        {
            title: "Trending on Netflix",
            color: "#E50914",
            items: [
                { ...TRAILERS_DATA[0], index: 0, ratio: "aspect-[2/3]" },
                { ...TRAILERS_DATA[4], index: 4, ratio: "aspect-video" }
            ]
        },
        {
            title: "Top on Prime",
            color: "#00A8E1",
            items: [
                { ...TRAILERS_DATA[1], index: 1, ratio: "aspect-[2/3]" },
                { ...TRAILERS_DATA[5], index: 5, ratio: "aspect-video" }
            ]
        },
        {
            title: "Disney+ Heroes",
            color: "#113CCF",
            items: [
                { ...TRAILERS_DATA[2], index: 2, ratio: "aspect-[2/3]" },
                { ...TRAILERS_DATA[6], index: 6, ratio: "aspect-video" }
            ]
        },
        {
            title: "Hulu Hits",
            color: "#1ce783",
            items: [
                { ...TRAILERS_DATA[3], index: 3, ratio: "aspect-[2/3]" },
                { ...TRAILERS_DATA[7], index: 7, ratio: "aspect-video" }
            ]
        }
    ];

    return (
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {columns.map((col, colIdx) => (
                    <div key={colIdx} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: col.color }}></div>
                            <span className="text-white font-bold text-lg">{col.title}</span>
                        </div>
                        {col.items.map((movie) => (
                            <TrailerCard
                                key={movie.index}
                                index={`grid-${movie.index}`}
                                {...movie}
                                aspectRatio={movie.ratio}
                                isPlaying={activeId === `grid-${movie.index}`}
                                onPlay={(id, embedUrl, withAudio) => onPlay({ id: `grid-${movie.index}`, ...movie }, embedUrl, withAudio)}
                                onStop={onStop}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
