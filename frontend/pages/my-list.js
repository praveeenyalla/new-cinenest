import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function MyList() {
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

    // Mock Data for "My List"
    const myListItems = [
        { id: 1, title: 'Stranger Things', poster: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrfLqWDO3ftXtuUdiRUoEV1yIn-StEcFku3r1YEZ-hMQYH9feL_q_PKsh9amKUPRSx0AhZ1A&s=10', type: 'TV Show' },
        { id: 2, title: 'The Batman', poster: 'https://m.media-amazon.com/images/M/MV5BMDdmMTBiNTYtMDIzNi00NGVlLWIzMDYtZTk3MTQ3NGQxZGEwXkEyXkFqcGc@._V1_.jpg', type: 'Movie' },
        { id: 3, title: 'Inception', poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg', type: 'Movie' },
    ];

    if (loading) return null;

    return (
        <Layout>
            <Head>
                <title>CINE NEST - My List</title>
            </Head>
            <div className="min-h-screen bg-background-dark text-white font-display pt-28 pb-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-4 mb-8">
                        <span className="material-symbols-outlined text-4xl text-primary">bookmark</span>
                        <h1 className="text-4xl font-bold">My List</h1>
                    </div>

                    {myListItems.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {myListItems.map((item) => (
                                <div key={item.id} className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-surface-dark border border-white/5 hover:border-primary/50 transition-all">
                                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                                        style={{ backgroundImage: `url('${item.poster}')` }}>
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <h3 className="text-white font-bold text-lg leading-tight mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-400">{item.type}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <span className="material-symbols-outlined text-6xl mb-4">playlist_add</span>
                            <p className="text-xl">Your list is empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
