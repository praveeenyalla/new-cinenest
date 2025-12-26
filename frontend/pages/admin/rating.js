import { useState, useMemo } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../config/api';

const MOCK_RATINGS = [
    { id: 1, user: "Alex Mercer", avatar: "A", movie: "Inception", rating: 9.5, review: "Mind-bending masterpiece!", date: "2 mins ago" },
    { id: 2, user: "Sarah Connor", avatar: "S", movie: "Terminator 2", rating: 10, review: "Best action movie ever.", date: "15 mins ago" },
    { id: 3, user: "John Wick", avatar: "J", movie: "The Matrix", rating: 8.8, review: "Classic sci-fi.", date: "1 hour ago" },
    { id: 4, user: "Ellen Ripley", avatar: "E", movie: "Alien", rating: 9.0, review: "Terrifyingly good.", date: "2 hours ago" },
    { id: 5, user: "Marty McFly", avatar: "M", movie: "Back to the Future", rating: 9.8, review: "Great Scott!", date: "3 hours ago" },
    { id: 6, user: "Tony Stark", avatar: "T", movie: "Iron Man", rating: 8.5, review: "Solid start to the MCU.", date: "5 hours ago" },
    { id: 7, user: "Bruce Wayne", avatar: "B", movie: "The Dark Knight", rating: 9.9, review: "Why so serious? Because it's amazing.", date: "1 day ago" },
    { id: 8, user: "Clark Kent", avatar: "C", movie: "Man of Steel", rating: 7.2, review: "A bit destructive.", date: "1 day ago" },
    { id: 9, user: "Diana Prince", avatar: "D", movie: "Wonder Woman", rating: 8.0, review: "Empowering.", date: "2 days ago" },
    { id: 10, user: "Peter Parker", avatar: "P", movie: "Spider-Man: No Way Home", rating: 9.2, review: "The nostalgia hit hard.", date: "2 days ago" },
    { id: 11, user: "Wanda M.", avatar: "W", movie: "Doctor Strange 2", rating: 6.5, review: "Messy plot.", date: "3 days ago" },
    { id: 12, user: "Steve Rogers", avatar: "S", movie: "Captain America: Winter Soldier", rating: 9.1, review: "Best MCU film.", date: "4 days ago" },
];

export default function RatingManagement() {
    const [filterStar, setFilterStar] = useState('all');

    const filteredRatings = useMemo(() => {
        if (filterStar === 'all') return MOCK_RATINGS;
        const min = parseInt(filterStar);
        return MOCK_RATINGS.filter(r => r.rating >= min && r.rating < min + 2); // approximate range
    }, [filterStar]);

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex font-display selection:bg-primary selection:text-white">
            <Head>
                <title>User Ratings | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="flex-1 ml-[260px] relative z-10">
                <header className="h-20 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">User Ratings</h1>
                        <p className="text-xs text-gray-500">Monitor and manage community feedback</p>
                    </div>
                </header>

                <main className="p-8">
                    {/* Stats Row */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <StatCard label="Total Ratings" value="12,543" change="+12%" />
                        <StatCard label="Avg Rating" value="8.4" change="+0.2" />
                        <StatCard label="Reviews Today" value="142" change="+5%" />
                        <StatCard label="Pending Moderation" value="5" color="text-yellow-500" />
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold">Recent Ratings</h2>
                            <select
                                value={filterStar}
                                onChange={(e) => setFilterStar(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-red-600"
                            >
                                <option value="all">All Ratings</option>
                                <option value="9">9★ - 10★ (Excellent)</option>
                                <option value="7">7★ - 8★ (Good)</option>
                                <option value="5">5★ - 6★ (Average)</option>
                                <option value="0">Low Ratings</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            {filteredRatings.map(rating => (
                                <div key={rating.id} className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-colors flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center font-bold text-sm">
                                        {rating.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-sm text-white">{rating.user}</h4>
                                                <div className="text-xs text-gray-500 mb-1">reviewed <span className="text-gray-300">{rating.movie}</span></div>
                                            </div>
                                            <span className="text-xs text-gray-600">{rating.date}</span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="flex text-yellow-500 text-sm">
                                                {"★".repeat(Math.round(rating.rating / 2))}
                                                <span className="text-gray-700">{"★".repeat(5 - Math.round(rating.rating / 2))}</span>
                                            </div>
                                            <span className="text-xs font-bold bg-white/10 px-1.5 rounded">{rating.rating}</span>
                                        </div>

                                        <p className="text-sm text-gray-400 italic">"{rating.review}"</p>

                                        <div className="mt-3 flex gap-4">
                                            <button className="text-xs text-gray-500 hover:text-white">Reply</button>
                                            <button className="text-xs text-gray-500 hover:text-white">Details</button>
                                            <button className="text-xs text-red-500/50 hover:text-red-500 ml-auto">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    );
}

const StatCard = ({ label, value, change, color }) => (
    <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
        <div className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">{label}</div>
        <div className="flex items-end justify-between">
            <div className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</div>
            {change && (
                <div className={`text-xs font-mono ${change.includes('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </div>
            )}
        </div>
    </div>
);
