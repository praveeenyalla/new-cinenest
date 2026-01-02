// Refresh: 2025-12-31T00:50:00
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import { API_URL } from '../../config/api';
import Link from 'next/link';

export default function ContentManagement() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        sort: 'year',
        order: 'desc',
        platform: 'all',
        year: 'all',
        minRating: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 15 });
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('adminToken');
            if (!token) {
                // router.push('/auth'); // In a real app, strict redirect
            }

            try {
                // Fetch both datasets
                const [finalRes, newRes] = await Promise.all([
                    fetch('/data/final_df_cleaned.json'),
                    fetch('/data/new_data.json')
                ]);

                const finalData = await finalRes.json();
                const newData = await newRes.json();

                // Normalize New Data
                const normalizedNewData = newData.map((item, idx) => ({
                    _id: `new-${idx}`,
                    Title: item.title,
                    Year: item.year,
                    IMDb: item.imdb_rating,
                    Type: item.type,
                    Netflix: item.platform === 'Netflix' ? 1 : 0,
                    'Prime Video': item.platform === 'Prime Video' ? 1 : 0,
                    Hulu: item.platform === 'Hulu' ? 1 : 0,
                    'Disney+': item.platform === 'Disney+' ? 1 : 0,
                    isNew: true
                }));

                // Normalize Final Data (ensure IDs)
                const normalizedFinalData = finalData.map((item, idx) => ({
                    ...item,
                    _id: `final-${idx}`,
                    // Ensure numeric types
                    Year: parseInt(item.Year),
                    IMDb: parseFloat(item.IMDb)
                }));

                // Combine
                const combined = [...normalizedNewData, ...normalizedFinalData];
                setContent(mapMovies(combined));
                setLoading(false);
            } catch (err) {
                console.error("Failed to load data", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Filtering Logic ---
    const filteredContent = useMemo(() => {
        let result = content;

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.Title || '').toLowerCase().includes(term)
            );
        }

        // Filters
        if (filters.type !== 'all') {
            result = result.filter(item => (item.Type || '').toLowerCase() === filters.type.toLowerCase());
        }
        if (filters.platform !== 'all') {
            result = result.filter(item => item[filters.platform] === 1);
        }
        if (filters.year !== 'all') {
            result = result.filter(item => item.Year === parseInt(filters.year));
        }
        if (filters.minRating > 0) {
            result = result.filter(item => (item.IMDb || 0) >= filters.minRating);
        }

        // Sorting
        result.sort((a, b) => {
            let valA, valB;
            if (filters.sort === 'year') {
                valA = a.Year || 0;
                valB = b.Year || 0;
            } else if (filters.sort === 'imdb') {
                valA = a.IMDb || 0;
                valB = b.IMDb || 0;
            } else {
                valA = a.Title || '';
                valB = b.Title || '';
            }

            if (filters.order === 'asc') return valA > valB ? 1 : -1;
            return valA < valB ? 1 : -1;
        });

        return result;
    }, [content, filters, searchTerm]);

    // --- Pagination Logic ---
    const paginatedData = useMemo(() => {
        const start = (pagination.page - 1) * pagination.limit;
        return filteredContent.slice(start, start + pagination.limit);
    }, [filteredContent, pagination]);

    const totalPages = Math.ceil(filteredContent.length / pagination.limit);

    // --- Unique Years for Filter ---
    const years = useMemo(() => {
        const y = new Set(content.map(c => c.Year).filter(Boolean));
        return Array.from(y).sort((a, b) => b - a);
    }, [content]);


    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans flex font-display selection:bg-primary selection:text-white">
            <Head>
                <title>Content Library | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="flex-1 ml-[260px] relative z-10">
                {/* Header */}
                <header className="h-20 bg-black/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Content Library</h1>
                        <p className="text-xs text-gray-500">Manage global movie and series database</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/create" className="px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                            <span className="text-lg">+</span> Add Content
                        </Link>
                    </div>
                </header>

                <main className="p-8">
                    {/* Controls Bar */}
                    <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-3 flex-1">
                            <div className="relative group">
                                <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search titles..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
                                    className="bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-primary focus:outline-none w-64 transition-all"
                                />
                            </div>

                            <select
                                value={filters.platform}
                                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                                className="filter-select"
                            >
                                <option value="all">All Platforms</option>
                                <option value="Netflix">Netflix</option>
                                <option value="Prime Video">Prime Video</option>
                                <option value="Hulu">Hulu</option>
                                <option value="Disney+">Disney+</option>
                            </select>

                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="filter-select"
                            >
                                <option value="all">All Types</option>
                                <option value="movie">Movies</option>
                                <option value="series">Series</option>
                                <option value="tv show">TV Shows</option>
                            </select>

                            <select
                                value={filters.year}
                                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                                className="filter-select"
                            >
                                <option value="all">All Years</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>

                            <select
                                value={filters.minRating}
                                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                                className="filter-select"
                            >
                                <option value="0">All Ratings</option>
                                <option value="9">9+ (Masterpiece)</option>
                                <option value="8">8+ (Great)</option>
                                <option value="7">7+ (Good)</option>
                                <option value="6">6+ (Okay)</option>
                            </select>
                        </div>

                        <div className="flex gap-2 border-l border-white/10 pl-4">
                            <button
                                onClick={() => setFilters(f => ({ ...f, sort: 'year' }))}
                                className={`sort-btn ${filters.sort === 'year' ? 'active' : ''}`}
                            >Year</button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, sort: 'imdb' }))}
                                className={`sort-btn ${filters.sort === 'imdb' ? 'active' : ''}`}
                            >Rating</button>
                            <button
                                onClick={() => setFilters(f => ({ ...f, order: filters.order === 'asc' ? 'desc' : 'asc' }))}
                                className="icon-btn"
                            >
                                {filters.order === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>

                    {/* Content Table */}
                    <div className="glass-panel rounded-xl overflow-hidden min-h-[500px]">
                        <table className="w-full text-left text-sm text-gray-400">
                            <thead className="bg-white/5 uppercase font-medium text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 text-white">Title</th>
                                    <th className="px-6 py-4">Release</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Platform</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr><td colSpan="6" className="p-8 text-center">Loading Content Library...</td></tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center">No content found.</td></tr>
                                ) : (
                                    paginatedData.map((item) => (
                                        <tr key={item._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-white font-medium">
                                                <div className="flex items-center gap-3">
                                                    {item.isNew && <span className="bg-primary text-[10px] uppercase font-bold px-1.5 rounded">New</span>}
                                                    {item.Title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{item.Year}</td>
                                            <td className="px-6 py-4 capitalize">
                                                <span className="px-2 py-1 rounded border border-white/10 text-xs bg-white/5">
                                                    {item.Type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {item.Netflix === 1 && <PlatformBadge name="Netflix" color="#e50914" />}
                                                    {item['Prime Video'] === 1 && <PlatformBadge name="Prime" color="#3b82f6" />}
                                                    {item['Disney+'] === 1 && <PlatformBadge name="Disney" color="#0ea5e9" />}
                                                    {item.Hulu === 1 && <PlatformBadge name="Hulu" color="#22c55e" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-bold text-white">
                                                    <span className="text-yellow-500">★</span> {item.IMDb}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-500 hover:text-white transition-colors px-2">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                            <button
                                disabled={pagination.page === 1}
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="text-sm text-gray-500 font-mono">
                                Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{totalPages}</span>
                            </div>
                            <button
                                disabled={pagination.page >= totalPages}
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </main>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }
                .filter-select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    outline: none;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }
                .filter-select:hover, .filter-select:focus {
                    border-color: #e60a15;
                }
                .filter-select option {
                    background: #1a1a1a;
                }
                .sort-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #888;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .sort-btn:hover {
                    color: white;
                    background: rgba(255,255,255,0.05);
                }
                .sort-btn.active {
                    color: white;
                    background: #e60a15;
                }
                .icon-btn {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    background: rgba(255,255,255,0.05);
                    color: white;
                }
            `}</style>
        </div>
    );
}

const PlatformBadge = ({ name, color }) => (
    <span style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`
    }} className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border">
        {name}
    </span>
);
