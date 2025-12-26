import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from '../../components/AdminSidebar';
import UserAnalytics from '../../components/UserAnalytics';

export default function AdminAnalytics() {
    const router = useRouter();

    // Auth check removed as per user request to showcase data directly
    // useEffect(() => {
    //     const token = localStorage.getItem('adminToken');
    //     if (!token) {
    //         router.push('/auth');
    //     }
    // }, []);

    return (
        <div className="flex bg-background-dark min-h-screen text-white font-sans">
            <AdminSidebar />
            <main className="flex-1 p-8 ml-64">
                <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
                    User Analysis Dashboard
                </h1>
                <UserAnalytics />
            </main>
        </div>
    );
}
