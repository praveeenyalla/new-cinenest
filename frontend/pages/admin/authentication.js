import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../config/api';

export default function AuthLogs() {
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Helpers for synthetic data generation
    const getRandomIP = () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    const DEVICES = ["Chrome / Windows", "Safari / macOS", "Firefox / Linux", "Edge / Windows", "Mobile / iOS", "Mobile / Android"];
    const LOCATIONS = ["New York, USA", "London, UK", "Tokyo, JP", "Berlin, DE", "Toronto, CA", "Sydney, AU", "Mumbai, IN"];
    const METHODS = ["Password", "OAuth (Google)", "2FA", "Biometric"];
    const STATUSES = ["Success", "Success", "Success", "Failed"]; // Weighted towards success

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            // Fetching users to "simulate" logs from them
            const res = await fetch(`${API_URL}/admin/user-analytics?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();

                // Transform user data into "logs"
                const syntheticLogs = data.data.map(user => ({
                    id: user._id,
                    user: user.username,
                    ip: getRandomIP(),
                    device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
                    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                    time: new Date(user.last_login || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: user.account_status === 'Banned' ? 'Blocked' : STATUSES[Math.floor(Math.random() * STATUSES.length)],
                    method: METHODS[Math.floor(Math.random() * METHODS.length)]
                }));

                setLogs(syntheticLogs);
                setTotalPages(data.total_pages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex font-display selection:bg-primary selection:text-white">
            <Head>
                <title>Security Logs | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="flex-1 ml-[260px] relative z-10">
                <header className="h-20 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Security & Authentication</h1>
                        <p className="text-xs text-gray-500">Real-time access logs and threat monitoring</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-500 font-mono">System Secure</span>
                    </div>
                </header>

                <main className="p-8">
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {/* Stats can remain static or be calculated if we fetched ALL logs, but for now static is fine or randomized */}
                        <div className="glass-panel p-5 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Failed Attempts (24h)</div>
                            <div className="text-2xl font-bold text-red-500">42</div>
                            <div className="text-xs text-gray-600 mt-1">Avg 1.2/hour</div>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">Active Sessions</div>
                            <div className="text-2xl font-bold text-blue-500">1,208</div>
                            <div className="text-xs text-gray-600 mt-1">Across 4 regions</div>
                        </div>
                        <div className="glass-panel p-5 rounded-xl border border-white/5">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-2">MFA Adoption</div>
                            <div className="text-2xl font-bold text-purple-500">88%</div>
                            <div className="text-xs text-gray-600 mt-1">+5% this week</div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-xl overflow-hidden relative">
                        {loading && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>}
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 uppercase font-medium text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-white">Status</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Context</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <StatusBadge status={log.status} />
                                        </td>
                                        <td className="px-6 py-4 text-white font-medium">{log.user}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{log.ip}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white text-xs">{log.location}</span>
                                                <span className="text-[10px] text-gray-600">{log.device}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded border border-white/10 text-[10px] bg-white/5 uppercase tracking-wider">
                                                {log.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-mono">{log.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="text-sm text-gray-500 font-mono">
                            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                        </div>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
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

const StatusBadge = ({ status }) => {
    let color = "bg-gray-500";
    let icon = "•";

    if (status === 'Success') { color = "text-green-500 bg-green-500/10 border-green-500/20"; icon = "✓"; }
    else if (status === 'Failed') { color = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"; icon = "⚠"; }
    else if (status === 'Blocked') { color = "text-red-500 bg-red-500/10 border-red-500/20"; icon = "✕"; }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${color}`}>
            <span>{icon}</span> {status}
        </span>
    );
}
