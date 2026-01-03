import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../config/api';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterStatus, setFilterStatus] = useState('all');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        subscription_tier: 'Free',
        account_status: 'Active'
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            const res = await fetch(`${API_URL}/admin/user-analytics?page=${page}&limit=10`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data.data);
                setTotalPages(data.total_pages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditFormData({
            subscription_tier: user.subscription_tier || 'Free',
            account_status: user.account_status || 'Active'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
            const response = await fetch(`${API_URL}/admin/user/${editingUser._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editFormData)
            });

            if (response.ok) {
                await fetchUsers();
                setIsEditModalOpen(false);
            } else {
                alert('Failed to update user');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating user');
        } finally {
            setUpdating(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (filterStatus === 'all') return users;
        return users.filter(u => (u.account_status || 'Active') === filterStatus);
    }, [users, filterStatus]);

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

                    <div className="glass-panel overflow-hidden rounded-xl relative">
                        {loading && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>}
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 uppercase font-medium text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-white">User</th>
                                    <th className="px-6 py-4">Current Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                                                    {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{user.username}</div>
                                                    <div className="text-xs text-gray-600">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${user.subscription_tier === 'Premium' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' : user.subscription_tier === 'Standard' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' : 'border-gray-700 text-gray-500'}`}>
                                                {user.subscription_tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${getStatusColor(user.account_status || 'Active')}`}></span>
                                                {user.account_status || 'Active'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">{new Date(user.joined_date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="text-gray-500 hover:text-white text-xs px-2 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </td>
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

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">Edit User Plan</h3>
                                <p className="text-xs text-gray-500 mt-1">Updating {editingUser?.username}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subscription Plan</label>
                                <select
                                    value={editFormData.subscription_tier}
                                    onChange={(e) => setEditFormData({ ...editFormData, subscription_tier: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="Free">Free</option>
                                    <option value="Basic">Basic</option>
                                    <option value="Standard">Standard</option>
                                    <option value="Premium">Premium</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Account Status</label>
                                <select
                                    value={editFormData.account_status}
                                    onChange={(e) => setEditFormData({ ...editFormData, account_status: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                                >
                                    <option value="Active">Active</option>
                                    <option value="Banned">Banned</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
