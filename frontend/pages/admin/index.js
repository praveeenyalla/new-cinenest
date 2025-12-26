import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';

import AdminAnalytics from '../../components/AdminAnalytics';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
    LineChart, Line,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ScatterChart, Scatter, ZAxis
} from 'recharts';

// --- Mock Data ---
const platformTrafficData = [
    { name: 'Nov 24', Netflix: 1100, Prime: 2000, Hulu: 400, Disney: 2200 },
    { name: 'Nov 26', Netflix: 900, Prime: 1900, Hulu: 300, Disney: 2000 },
    { name: 'Nov 28', Netflix: 1000, Prime: 1500, Hulu: 500, Disney: 1800 },
    { name: 'Nov 30', Netflix: 700, Prime: 1600, Hulu: 400, Disney: 2300 },
    { name: 'Dec 02', Netflix: 1100, Prime: 2800, Hulu: 600, Disney: 1500 },
    { name: 'Dec 04', Netflix: 700, Prime: 2000, Hulu: 300, Disney: 1700 },
    { name: 'Dec 05', Netflix: 719, Prime: 2005, Hulu: 379, Disney: 114 },
    { name: 'Dec 08', Netflix: 900, Prime: 1900, Hulu: 500, Disney: 1600 },
    { name: 'Dec 10', Netflix: 800, Prime: 1500, Hulu: 400, Disney: 2100 },
    { name: 'Dec 14', Netflix: 1200, Prime: 2200, Hulu: 700, Disney: 1300 },
    { name: 'Dec 16', Netflix: 850, Prime: 1600, Hulu: 500, Disney: 1500 },
    { name: 'Dec 18', Netflix: 950, Prime: 1900, Hulu: 600, Disney: 2100 },
    { name: 'Dec 20', Netflix: 900, Prime: 1700, Hulu: 550, Disney: 1800 },
    { name: 'Dec 22', Netflix: 700, Prime: 1400, Hulu: 300, Disney: 900 },
    { name: 'Dec 24', Netflix: 1200, Prime: 2400, Hulu: 800, Disney: 2500 },
];

// Detailed Category Data per Platform
const platformCategoryDetails = {
    Netflix: [
        { name: 'Drama', value: 8500, color: '#e60a15' },
        { name: 'Thriller', value: 6200, color: '#b00710' },
        { name: 'Action', value: 4500, color: '#ff4d4d' },
        { name: 'Comedy', value: 3800, color: '#ff8080' },
        { name: 'Doc', value: 2100, color: '#ffb3b3' }
    ],
    Prime: [
        { name: 'Action', value: 7800, color: '#3b82f6' },
        { name: 'Drama', value: 5400, color: '#2563eb' },
        { name: 'Comedy', value: 4900, color: '#1d4ed8' },
        { name: 'Sci-Fi', value: 3500, color: '#1e40af' },
        { name: 'Doc', value: 1200, color: '#1e3a8a' }
    ],
    Hulu: [
        { name: 'TV Shows', value: 9200, color: '#22c55e' },
        { name: 'Drama', value: 5100, color: '#16a34a' },
        { name: 'Comedy', value: 4800, color: '#15803d' },
        { name: 'Reality', value: 3900, color: '#166534' },
        { name: 'Action', value: 2100, color: '#14532d' }
    ],
    Disney: [
        { name: 'Animation', value: 9800, color: '#0ea5e9' },
        { name: 'Family', value: 8500, color: '#0284c7' },
        { name: 'Action', value: 7200, color: '#0369a1' },
        { name: 'Sci-Fi', value: 5400, color: '#075985' },
        { name: 'Doc', value: 3100, color: '#0c4a6e' }
    ]
};

const categoryData = [
    { name: 'Drama', current: 4500, last: 3200 },
    { name: 'Unknown', current: 1200, last: 900 },
    { name: 'Comedy', current: 3800, last: 2900 },
    { name: 'Thriller', current: 2900, last: 2100 },
    { name: 'Action', current: 5200, last: 4800 },
    { name: 'Documentary', current: 1800, last: 1500 },
    { name: 'Romance', current: 2400, last: 2000 },
];

const userActivityData = [
    { name: '00:00', visitors: 120, members: 80 },
    { name: '04:00', visitors: 40, members: 30 },
    { name: '08:00', visitors: 200, members: 150 },
    { name: '12:00', visitors: 450, members: 300 },
    { name: '16:00', visitors: 380, members: 280 },
    { name: '20:00', visitors: 600, members: 500 },
    { name: '23:59', visitors: 300, members: 200 },
];

const radarData = [
    { subject: 'Visuals', A: 120, B: 110, fullMark: 150 },
    { subject: 'Plot', A: 98, B: 130, fullMark: 150 },
    { subject: 'Sound', A: 86, B: 130, fullMark: 150 },
    { subject: 'Acting', A: 99, B: 100, fullMark: 150 },
    { subject: 'Engage', A: 85, B: 90, fullMark: 150 },
    { subject: 'Pacing', A: 65, B: 85, fullMark: 150 },
];

const scatterData = [
    { x: 100, y: 200, z: 200 }, { x: 120, y: 100, z: 260 },
    { x: 170, y: 300, z: 400 }, { x: 140, y: 250, z: 280 },
    { x: 150, y: 400, z: 500 }, { x: 110, y: 280, z: 200 },
];

export default function AdminDashboard() {
    const [isMounted, setIsMounted] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState('Netflix');

    useEffect(() => { setIsMounted(true); }, []);

    return (
        <div className="min-h-screen bg-[#020202] text-white font-display flex overflow-hidden bg-tech-grid selection:bg-primary selection:text-white">
            <Head>
                <title>CINE NEST Admin Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <style jsx global>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }
                .orb-glow-small {
                    box-shadow: 0 0 15px rgba(230,10,21,0.4);
                    animation: pulse-red 3s infinite;
                }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 15px rgba(230,10,21,0.4); }
                    50% { box-shadow: 0 0 25px rgba(230,10,21,0.7); }
                    100% { box-shadow: 0 0 15px rgba(230,10,21,0.4); }
                }
                .bg-tech-grid {
                    background-size: 100% 100%, 40px 40px, 40px 40px;
                }
                /* Custom Platform Toggle Styles */
                .platform-btn {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .platform-btn::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }
                .platform-btn:hover::before {
                    width: 200%;
                    height: 200%;
                }
            `}</style>

            {/* Background Effects */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] opacity-40 mix-blend-screen"></div>
                <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-transparent via-slate-900/10 to-transparent blur-3xl opacity-50"></div>
            </div>

            <AdminSidebar />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-transparent pl-[260px]">
                {/* Header */}
                <header className="h-20 bg-background-dark/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white tracking-tight">Dashboard Overview</h2>
                        <div className="h-6 w-px bg-white/10"></div>
                        <span className="text-sm text-gray-500 flex items-center gap-2 font-mono">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            System Online
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="material-symbols-outlined text-gray-400">search</span>
                        <div className="relative">
                            <span className="material-symbols-outlined text-gray-400 hover:text-white transition-colors">notifications</span>
                            <span className="absolute top-0 right-0 size-2 bg-primary rounded-full animate-pulse"></span>
                        </div>
                    </div>
                </header>

                <div className="p-8 overflow-y-auto scroll-smooth">
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { title: 'Total Views', value: '+24K', badge: '+12.5%', icon: 'visibility', color: 'text-primary', border: 'group-hover:border-primary/50' },
                            { title: 'Rated App', value: '+55K', badge: '+5.2%', icon: 'star', color: 'text-yellow-500', border: 'group-hover:border-yellow-500/50' },
                            { title: 'Downloaded', value: '+1M', badge: '-2.1%', icon: 'download', color: 'text-blue-500', border: 'group-hover:border-blue-500/50' },
                            { title: 'Visitors', value: '+2M', badge: '+18.4%', icon: 'group', color: 'text-green-500', border: 'group-hover:border-green-500/50' }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel rounded-xl p-6 group hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 bg-white/5 rounded-lg ${stat.color} group-hover:bg-white/10 transition-colors border border-white/5 ${stat.border}`}>
                                        <span className="material-symbols-outlined">{stat.icon}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded border ${stat.badge.startsWith('+') ? 'text-green-400 bg-green-500/5 border-green-500/20' : 'text-red-400 bg-red-500/5 border-red-500/20'}`}>
                                        {stat.badge}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</h3>
                                <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                            </div>
                        ))}
                    </div>

                    {/* Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Platform Traffic (Unified) */}
                        <div className="lg:col-span-2 glass-panel rounded-xl p-6 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="font-bold text-lg text-white">Platform Traffic Breakdown</h3>
                                    <p className="text-xs text-gray-500 mt-1">Real-time streaming bandwidth usage</p>
                                </div>
                                <div className="flex gap-4 text-xs font-mono">
                                    <span className="text-red-500">● Netflix</span>
                                    <span className="text-blue-500">● Prime</span>
                                    <span className="text-green-500">● Hulu</span>
                                    <span className="text-sky-500">● Disney+</span>
                                </div>
                            </div>
                            <div className="h-[300px] w-full relative z-10">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={platformTrafficData}>
                                            <defs>
                                                <linearGradient id="colorNetflix" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#e60a15" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#e60a15" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorPrime" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorHulu" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorDisney" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} stroke="#333" strokeDasharray="3 3" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} />
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                            <Area type="monotone" dataKey="Netflix" stroke="#e60a15" fillOpacity={1} fill="url(#colorNetflix)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Prime" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPrime)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Hulu" stroke="#22c55e" fillOpacity={1} fill="url(#colorHulu)" strokeWidth={2} />
                                            <Area type="monotone" dataKey="Disney" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorDisney)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                        </div>

                        {/* Brain Engine Status */}
                        <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden border-t-2 border-t-white/10">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                </span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 z-10 text-white">Brain Engine Status</h3>
                            <p className="text-xs text-gray-500 mb-6 z-10">Real-time AI Processing Load</p>
                            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                    <div className="w-48 h-48 border border-white rounded-full"></div>
                                    <div className="w-64 h-64 border border-white rounded-full absolute"></div>
                                </div>
                                <div className="w-32 h-32 rounded-full border border-primary/30 flex items-center justify-center orb-glow-small bg-black/80 backdrop-blur-sm mb-4 relative shadow-2xl">
                                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" style={{ animationDuration: '3s' }}></div>
                                    <span className="material-symbols-outlined text-4xl text-primary animate-pulse relative z-10">neurology</span>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-black text-white tracking-tighter drop-shadow-lg">98<span className="text-xl text-primary align-top">%</span></div>
                                    <div className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-2 font-semibold">Load Capacity</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Categories Bar Chart */}
                        <div className="lg:col-span-2 glass-panel rounded-xl p-6">
                            <h3 className="font-bold text-lg text-white mb-6">Categories Distribution</h3>
                            <div className="h-[200px]">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={categoryData} barSize={20}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 10 }} dy={10} />
                                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', color: '#fff' }} />
                                            <Bar dataKey="current" fill="#e60a15" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="last" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Interactive Platform Category Pie Chart */}
                        <div className="glass-panel rounded-xl p-6 flex flex-col items-center">
                            <div className="w-full flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white">Category Preferences</h3>
                                    <p className="text-xs text-gray-500">By Platform</p>
                                </div>
                            </div>

                            {/* Platform Selectors */}
                            <div className="flex gap-1 mb-4 bg-white/5 p-1 rounded-lg w-full">
                                {['Netflix', 'Prime', 'Hulu', 'Disney'].map(platform => (
                                    <button
                                        key={platform}
                                        onClick={() => setSelectedPlatform(platform)}
                                        className={`flex-1 py-1 text-[10px] uppercase font-bold tracking-wider rounded transition-all platform-btn ${selectedPlatform === platform ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
                                    >
                                        {platform === 'Disney' ? 'Disney+' : platform}
                                    </button>
                                ))}
                            </div>

                            <div className="w-48 h-48 relative">
                                {isMounted && (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={platformCategoryDetails[selectedPlatform]}
                                                innerRadius={60}
                                                outerRadius={80}
                                                dataKey="value"
                                                stroke="none"
                                                paddingAngle={5}
                                                animationDuration={800}
                                            >
                                                {platformCategoryDetails[selectedPlatform].map((entry, index) => (
                                                    <Cell key={`cell-\${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '4px', fontSize: '12px' }} itemStyle={{ color: '#fff' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-white tracking-tight">
                                        {(platformCategoryDetails[selectedPlatform].reduce((a, b) => a + b.value, 0) / 1000).toFixed(1)}k
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{selectedPlatform}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center mt-4 w-full">
                                {platformCategoryDetails[selectedPlatform].slice(0, 3).map((d, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-300 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                        <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: d.color, color: d.color }}></span>
                                        {d.name} <span className="opacity-50">|</span> <span className="font-mono">{(d.value / 1000).toFixed(1)}k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Advanced Analytics */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-primary pl-4">Advanced Analytics & User Activity</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* 1. User Activity Line Chart */}
                            <div className="glass-panel rounded-xl p-6 md:col-span-2 lg:col-span-1">
                                <h3 className="font-bold text-lg text-white mb-4">Real-Time User Visits</h3>
                                <div className="h-[250px]">
                                    {isMounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={userActivityData}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                                <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', color: '#fff' }} />
                                                <Line type="monotone" dataKey="visitors" stroke="#e60a15" strokeWidth={3} dot={false} />
                                                <Line type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={3} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                                <div className="flex justify-center gap-4 mt-2 text-xs">
                                    <span className="text-primary">● Visitors</span>
                                    <span className="text-blue-500">● Members</span>
                                </div>
                            </div>

                            {/* 2. Content Performance Radar */}
                            <div className="glass-panel rounded-xl p-6">
                                <h3 className="font-bold text-lg text-white mb-4">Content Metrics Radar</h3>
                                <div className="h-[250px]">
                                    {isMounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid stroke="#333" />
                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                                <Radar name="Review A" dataKey="A" stroke="#e60a15" fill="#e60a15" fillOpacity={0.4} />
                                                <Radar name="Review B" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                                <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', color: '#fff' }} />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            {/* 3. Engagement Scatter Plot */}
                            <div className="glass-panel rounded-xl p-6">
                                <h3 className="font-bold text-lg text-white mb-4">Engagement Correlations</h3>
                                <div className="h-[250px]">
                                    {isMounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <XAxis type="number" dataKey="x" name="Time" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <YAxis type="number" dataKey="y" name="Rating" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Score" />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0a0a0a', border: 'none', color: '#fff' }} />
                                                <Scatter name="A school" data={scatterData} fill="#e60a15" shape="circle" />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Content Table */}
                    <div className="glass-panel rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white/[0.02] to-transparent">
                            <div>
                                <h3 className="font-bold text-lg text-white">Recent Content Uploads</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Manage and review newly added titles</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors border border-white/10 text-gray-300 backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-base">filter_list</span> Filter
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-sm font-bold transition-all text-white shadow-[0_0_15px_rgba(230,10,21,0.3)] hover:shadow-[0_0_25px_rgba(230,10,21,0.5)]">
                                    <span className="material-symbols-outlined text-base">add</span> Add New
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-black/40 text-xs uppercase font-medium text-gray-500 font-mono tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">AI Confidence</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-16 bg-gray-800 rounded bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow border border-white/5" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACge5918lWCM_VF6J-qN0KboiWAxJIHifwa6uIbtMrZ6Cr5RmumxGZv-n4vqgprkR0G6u4uMLF8K-mann5ShPykDb28PS89oOWYzmtq19hpJMoT02zUrF7zMj-SH5lQ7N5Yfo_JbLCac7GV1Ok8nUDu01YVV9IvQfyGdA-i_ytM0h-P4mtIhW18T6yZ6bkY3S_EeL9gsBGL43yx01rvg_rlaBzT6uiuJP9XcPryzbr1jGR3P8yqrmC4npIat0P0UMFe3GSuK6gqLM')" }}></div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-primary transition-colors">Stellar Drift</div>
                                                    <div className="text-xs font-mono text-gray-600">ID: #83920</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5 text-gray-300">Sci-Fi</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                                    <div className="h-full bg-green-500 w-[98%] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                </div>
                                                <span className="text-white font-mono text-xs">98%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 text-xs font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(34,197,94,0.1)]">Published</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined">more_vert</span></button>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-16 bg-gray-800 rounded bg-cover bg-center shadow-md group-hover:shadow-lg transition-shadow border border-white/5" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD2-UKyS86fskUIhJel8zR1CKOcDb_gmECIOVdhxjgY_oHx1NiViyHobXMv1xmujRsAVYFkjXKfoUK5n6xxQ6mzhNU3dqRZTYSKB-P_LHRLzPR8tI4THUL5zikufmY3lijlrnGy5O6AYTBELd-USp7-1safy6s_AxHATrgRi_kkgtiqlbq-J-8_ReV7k8MHdnMRnN62CyvLGe5vuWPy6LDu_On3gsv61x928tr_I-GydjBI2X1qrV6DKptaK_rPZ-HpQLKf19YIb_U')" }}></div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-primary transition-colors">Circuit Breaker</div>
                                                    <div className="text-xs font-mono text-gray-600">ID: #83923</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5 text-gray-300">Action</span></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                                    <div className="h-full bg-primary w-[30%] shadow-[0_0_8px_rgba(230,10,21,0.5)]"></div>
                                                </div>
                                                <span className="text-white font-mono text-xs">30%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wide shadow-[0_0_10px_rgba(230,10,21,0.1)]">Processing</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"><span className="material-symbols-outlined">more_vert</span></button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>




                    {/* Admin Analytics Section */}
                    <section className="mt-12 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                            <h2 className="text-xl font-bold text-white">Admin Intelligence Panels</h2>
                        </div>
                        <div className="bg-surface-dark border border-white/10 rounded-xl overflow-hidden p-6 relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
                            <AdminAnalytics />
                        </div>
                    </section>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600 relative z-10 flex items-center justify-center gap-4">
                        <span className="h-px w-8 bg-gradient-to-r from-transparent to-gray-700"></span>
                        <p>&copy; 2024 CINE NEST Admin Console. v2.4.1 (Stable)</p>
                        <span className="h-px w-8 bg-gradient-to-l from-transparent to-gray-700"></span>
                    </div>
                </div>

            </div>
        </div>
    );
}
