import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState({ username: '', email: '' });

    useEffect(() => {
        // Redirect if not logged in
        const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!token) {
            router.push('/auth');
            return;
        }

        setUser({
            username: localStorage.getItem('username') || 'Guest User',
            email: localStorage.getItem('userEmail') || 'guest@cinenest.ai'
        });
    }, []);

    return (
        <Layout>
            <Head>
                <title>CINE NEST - My Profile</title>
            </Head>
            <div className="min-h-screen bg-background-dark text-white font-display pt-28 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2">Profile Settings</h1>
                            <p className="text-gray-400">Manage your account and preferences</p>
                        </div>
                        <div className="hidden md:block">
                            <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary">
                                ID: USER_{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-surface-dark rounded-2xl p-6 border border-white/5">
                                <div className="flex flex-col items-center text-center">
                                    <div className="size-24 rounded-full bg-surface-highlight border-2 border-primary mb-4 overflow-hidden bg-cover bg-center"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIJhsYNmNCTBCo3NNv9a8bn6tKxMP2V029SbUT-D01fwxh4LWyPsmZuVPw-nYI-D3W9ALBVHDOGq4-vX9Dl57aww4GGx7juhMm84yxeAyO9S34o9mEmcKCGPZ5QRKaXkA27y4lmda-uT4xoNSlMDXAthcM6WiS8zH2tXKmaQtwz8EMsz4gAKjdoffDXRuxeXa6mYtaMqmuMAssQDkQJbh-AMSJ6zlb6F3tb37GTMtDxFPMVHBKbJr6uzPgnVv14t3wM8qnUxAwHP8')" }}>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1">{user.username}</h3>
                                    <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                                    <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium mb-2">
                                        Change Avatar
                                    </button>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-2">
                                <button className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
                                    <span className="material-symbols-outlined">person</span>
                                    Account Details
                                </button>
                                <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">lock</span>
                                    Security
                                </button>
                                <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">credit_card</span>
                                    Subscription
                                </button>
                                <button className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">notifications</span>
                                    Notifications
                                </button>
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Personal Info */}
                            <div className="bg-surface-dark rounded-2xl p-8 border border-white/5">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">badge</span>
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Username</label>
                                        <input
                                            type="text"
                                            value={user.username}
                                            readOnly
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Email Address</label>
                                        <input
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Language</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 transition-colors">
                                            <option>English (US)</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">Region</label>
                                        <select className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-gray-300 focus:outline-none focus:border-primary/50 transition-colors">
                                            <option>United States</option>
                                            <option>United Kingdom</option>
                                            <option>Global</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button className="px-6 py-2 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-colors">
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
