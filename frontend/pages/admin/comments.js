import { useState } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';

const MOCK_COMMENTS = [
    { id: 1, user: "movie_buff_99", avatar: "M", movie: "Inception", platform: "Netflix", text: "The ending is still ambiguous to me. Does the top stop spinning?", likes: 45, date: "10 mins ago", replies: 12 },
    { id: 2, user: "sci_fi_fan", avatar: "S", movie: "Stranger Things", platform: "Netflix", text: "Can't wait for the final season! The trailer looks insane.", likes: 120, date: "30 mins ago", replies: 45 },
    { id: 3, user: "critic_01", avatar: "C", movie: "The Rings of Power", platform: "Prime Video", text: "Visually stunning, but the pacing feels a bit off in episode 3.", likes: 15, date: "1 hour ago", replies: 8 },
    { id: 4, user: "mando_way", avatar: "M", movie: "The Mandalorian", platform: "Disney+", text: "This is the way.", likes: 882, date: "2 hours ago", replies: 105 },
    { id: 5, user: "hulu_watcher", avatar: "H", movie: "The Bear", platform: "Hulu", text: "Stressful but incredible. Jeremy Allen White is a genius.", likes: 67, date: "3 hours ago", replies: 22 },
    { id: 6, user: "anime_lover", avatar: "A", movie: "Demon Slayer", platform: "Netflix", text: "The animation quality just keeps getting better. Ufotable is god-tier.", likes: 230, date: "4 hours ago", replies: 56 },
    { id: 7, user: "classic_watcher", avatar: "C", movie: "The Godfather", platform: "Prime Video", text: "It insists upon itself.", likes: 3, date: "5 hours ago", replies: 2 },
    { id: 8, user: "marvel_stan", avatar: "M", movie: "Loki", platform: "Disney+", text: "Glorious purpose! The finale blew my mind.", likes: 95, date: "6 hours ago", replies: 30 },
];

export default function CommentsManagement() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex font-display selection:bg-primary selection:text-white">
            <Head>
                <title>Community Comments | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="flex-1 ml-[260px] relative z-10">
                <header className="h-20 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Community Feed</h1>
                        <p className="text-xs text-gray-500">Live discussions and moderation</p>
                    </div>
                </header>

                <main className="p-8 max-w-5xl">
                    <div className="grid gap-4">
                        {MOCK_COMMENTS.map(comment => (
                            <div key={comment.id} className="glass-panel p-5 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-t from-gray-800 to-gray-700 flex items-center justify-center font-bold text-sm border border-white/10 shadow-lg">
                                        {comment.avatar}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm hover:text-primary cursor-pointer transition-colors">{comment.user}</span>
                                            <span className="text-xs text-gray-500">• {comment.date}</span>
                                        </div>
                                        <PlatformTag platform={comment.platform} />
                                    </div>

                                    <div className="text-xs text-gray-500 mb-2">
                                        on <span className="text-gray-300 font-medium">{comment.movie}</span>
                                    </div>

                                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                        {comment.text}
                                    </p>

                                    <div className="flex items-center gap-6 text-xs text-gray-500 font-medium">
                                        <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
                                            <span>♥</span> {comment.likes}
                                        </div>
                                        <div className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors">
                                            <span>💬</span> {comment.replies} Replies
                                        </div>
                                        <button className="hover:text-red-500 transition-colors ml-auto">Remove</button>
                                        <button className="hover:text-yellow-500 transition-colors">Flag</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.4);
                    backdrop-filter: blur(12px);
                }
            `}</style>
        </div>
    );
}

const PlatformTag = ({ platform }) => {
    let color = "#888";
    if (platform === 'Netflix') color = "#e50914";
    if (platform === 'Prime Video') color = "#3b82f6";
    if (platform === 'Hulu') color = "#22c55e";
    if (platform === 'Disney+') color = "#0ea5e9";

    return (
        <span style={{ color: color, borderColor: `${color}40`, backgroundColor: `${color}10` }} className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border">
            {platform}
        </span>
    );
};
