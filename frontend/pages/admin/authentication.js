import { useState } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';

const AUTH_LOGS = [
    { id: 10234, user: "admin", ip: "192.168.1.10", device: "Chrome / Windows", location: "New York, USA", time: "Just now", status: "Success", method: "Password" },
    { id: 10233, user: "neo_the_one", ip: "45.12.33.11", device: "Firefox / Linux", location: "Zion (Unknown)", time: "2 mins ago", status: "Success", method: "2FA" },
    { id: 10232, user: "unknown", ip: "203.0.113.5", device: "Headless / Bot", location: "Moscow, RU", time: "5 mins ago", status: "Failed", method: "Brute Force" },
    { id: 10231, user: "trinity_dev", ip: "172.16.0.5", device: "Safari / iOS", location: "San Francisco, USA", time: "12 mins ago", status: "Success", method: "Biometric" },
    { id: 10230, user: "agent_smith", ip: "10.0.0.1", device: "System / Core", location: "Matrix Mainframe", time: "12 mins ago", status: "Failed", method: "API Key" },
    { id: 10229, user: "morpheus_l", ip: "88.21.44.12", device: "Opera / Android", location: "Nebuchadnezzar", time: "25 mins ago", status: "Success", method: "Password" },
    { id: 10228, user: "oracle_seer", ip: "127.0.0.1", device: "Edge / Windows", location: "Localhost", time: "1 hour ago", status: "Success", method: "Cookie" },
    { id: 10227, user: "hacker_42", ip: "198.51.100.2", device: "Kali / Linux", location: "Unknown Proxy", time: "1 hour ago", status: "Blocked", method: "SQL Injection" },
    { id: 10226, user: "guest_user", ip: "203.0.113.88", device: "Safari / macOS", location: "London, UK", time: "2 hours ago", status: "Success", method: "OAuth (Google)" },
    { id: 10225, user: "test_acct", ip: "192.168.1.50", device: "Chrome / Android", location: "Toronto, CA", time: "3 hours ago", status: "Failed", method: "Password" },
];

export default function AuthLogs() {
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

                    <div className="glass-panel rounded-xl overflow-hidden">
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
                                {AUTH_LOGS.map(log => (
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
                </main>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(12px);
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
