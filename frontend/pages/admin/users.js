import { useState, useMemo } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';

const MOCK_USERS = [
    { id: 1, username: "neo_the_one", email: "neo@matrix.inc", role: "Super Admin", status: "Active", plan: "Ultimate", joined: "2023-01-15", avatar: "N" },
    { id: 2, username: "trinity_dev", email: "trinity@matrix.inc", role: "Admin", status: "Active", plan: "Ultimate", joined: "2023-02-10", avatar: "T" },
    { id: 3, username: "morpheus_l", email: "morpheus@zion.gov", role: "User", status: "Active", plan: "Standard", joined: "2023-03-05", avatar: "M" },
    { id: 4, user_404: "agent_smith", email: "smith@system.exe", role: "User", status: "Banned", plan: "Basic", joined: "2023-04-01", avatar: "A" },
    { id: 5, username: "oracle_seer", email: "cookie@kitchen.net", role: "Moderator", status: "Active", plan: "Premium", joined: "2023-04-12", avatar: "O" },
    { id: 6, username: "cypher_steak", email: "ignorance@bliss.com", role: "User", status: "Inactive", plan: "Basic", joined: "2023-05-20", avatar: "C" },
    { id: 7, username: "tank_oper", email: "tank@nebuchadnezzar.ship", role: "User", status: "Active", plan: "Standard", joined: "2023-06-11", avatar: "T" },
    { id: 8, username: "dozer_med", email: "dozer@nebuchadnezzar.ship", role: "User", status: "Active", plan: "Standard", joined: "2023-06-15", avatar: "D" },
    { id: 9, username: "switch_w", email: "notlikethis@matrix.inc", role: "User", status: "Banned", plan: "Basic", joined: "2023-07-01", avatar: "S" },
    { id: 10, username: "mouse_kid", email: "tastywheat@matrix.inc", role: "User", status: "Active", plan: "Premium", joined: "2023-08-08", avatar: "M" },
];

export default function UserManagement() {
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = useMemo(() => {
        if (filterStatus === 'all') return MOCK_USERS;
        return MOCK_USERS.filter(u => u.status === filterStatus);
    }, [filterStatus]);

    const getStatusColor = (s) => {
        if (s === 'Active') return 'bg-green-500';
        if (s === 'Banned') return 'bg-red-500';
        return 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex font-display selection:bg-primary selection:text-white">
            <Head>
                <title>User Management | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="flex-1 ml-[260px] relative z-10">
                <header className="h-20 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">User Management</h1>
                        <p className="text-xs text-gray-500">Manage user accounts and permissions</p>
                    </div>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Export CSV
                    </button>
                </header>

                <main className="p-8">
                    <div className="flex gap-4 mb-6">
                        {['all', 'Active', 'Banned', 'Inactive'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filterStatus === status ? 'bg-primary text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="glass-panel overflow-hidden rounded-xl">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 uppercase font-medium text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-white">User</th>
                                    <th className="px-6 py-4">Current Plan</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                                    {user.avatar}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{user.username || user.user_404}</div>
                                                    <div className="text-xs text-gray-600">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${user.plan === 'Ultimate' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : user.plan === 'Premium' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-gray-700 text-gray-500'}`}>
                                                {user.plan}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white">{user.role}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`}></span>
                                                {user.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{user.joined}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-500 hover:text-white text-xs px-2">Edit</button>
                                        </td>
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
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
            `}</style>
        </div>
    );
}
