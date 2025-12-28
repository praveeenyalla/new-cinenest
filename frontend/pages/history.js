import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function History() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Redirect if not logged in
        const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
        if (!token) {
            router.push('/auth');
            return;
        }
        setLoading(false);
    }, []);

    // Mock Data for "History"
    const historyItems = [
        { id: 1, title: 'John Wick: Chapter 4', poster: 'https://m.media-amazon.com/images/S/pv-target-images/00a4a221f0846799ae0982f0607488e9e7a7ebc0537ece4e1edd9c0b515966fd.jpg', progress: 85 },
        { id: 2, title: 'Breaking Bad', poster: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDQ1LWFhMjMtNjIxZDUwY2ZhNzY2XkEyXkFqcGc@._V1_.jpg', progress: 40 },
        { id: 3, title: 'Interstellar', poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGc@._V1_.jpg', progress: 100 },
    ];

    if (loading) return null;

    return (
        <Layout>
            <Head>
                <title>CINE NEST - Recently Watched</title>
            </Head>
            <div className="min-h-screen bg-background-dark text-white font-display pt-28 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="material-symbols-outlined text-4xl text-primary">history</span>
                        <h1 className="text-4xl font-bold">Recently Watched</h1>
                    </div>

                    {historyItems.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {historyItems.map((item) => (
                                <div key={item.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-surface-dark border border-white/5 hover:border-primary/50 transition-all">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${item.poster}')` }}>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                                    {/* Progress Bar */}
                                    <div className="absolute bottom-0 left-0 w-full">
                                        <div className="h-1 bg-gray-700 w-full">
                                            <div className="h-full bg-primary" style={{ width: `${item.progress}%` }}></div>
                                        </div>
                                        <div className="p-4 bg-black/60 backdrop-blur-sm">
                                            <h3 className="text-white font-bold text-lg leading-tight mb-1">{item.title}</h3>
                                            <p className="text-xs text-gray-300">{item.progress === 100 ? 'Completed' : `${item.progress}% watched`}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <span className="material-symbols-outlined text-6xl mb-4">history_toggle_off</span>
                            <p className="text-xl">No watch history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
