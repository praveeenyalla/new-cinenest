
// Last Updated: 2025-12-31T00:49:00
import { useState, useMemo } from 'react';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import moviesData from '../../utils/movies_data.json';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

const cleanTitle = (title) => {
    if (!title) return '';
    // Removes trailing space followed by a single digit (synthetic data suffix)
    return title.replace(/\s\d$/, '');
};

export default function MovieAnalytics() {
    const [filters, setFilters] = useState({
        release_year: 'All',
        industry: 'All',
        category: 'All',
        platform: 'All',
        status: 'All'
    });

    const [sortConfig, setSortConfig] = useState({ key: 'imdb_rating', direction: 'desc' });

    // Unique Filter Options
    const uniqueYears = ['2025', '2026'];
    const uniqueIndustries = Array.from(new Set(moviesData.map(m => m.industry)));
    const uniqueCategories = Array.from(new Set(moviesData.map(m => m.category)));
    const uniquePlatforms = Array.from(new Set(moviesData.map(m => m.platform)));
    const uniqueStatus = Array.from(new Set(moviesData.map(m => m.status)));

    // Filter Logic
    const filteredData = useMemo(() => {
        return moviesData.filter(movie => {
            if (filters.release_year !== 'All' && movie.release_year.toString() !== filters.release_year) return false;
            if (filters.industry !== 'All' && movie.industry !== filters.industry) return false;
            if (filters.category !== 'All' && movie.category !== filters.category) return false;
            if (filters.platform !== 'All' && movie.platform !== filters.platform) return false;
            if (filters.status !== 'All' && movie.status !== filters.status) return false;
            return true;
        });
    }, [filters]);

    // Sorting Logic
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle nulls
                if (aValue === null) aValue = -1;
                if (bValue === null) bValue = -1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    const requestSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // --- Deduplication Logic ---
    const deduplicatedData = useMemo(() => {
        const seen = new Set();
        return sortedData.filter(movie => {
            const title = cleanTitle(movie.title);
            if (seen.has(title)) return false;
            seen.add(title);
            return true;
        });
    }, [sortedData]);

    // KPI Calculations
    const kpis = useMemo(() => {
        const totalMovies = filteredData.length;
        const releasedCount = filteredData.filter(m => m.status === 'released').length;
        const upcomingCount = filteredData.filter(m => m.status === 'upcoming').length;

        const releasedMovies = filteredData.filter(m => m.status === 'released' && m.imdb_rating != null);
        const avgRating = releasedMovies.length > 0
            ? (releasedMovies.reduce((acc, curr) => acc + curr.imdb_rating, 0) / releasedMovies.length).toFixed(1)
            : 'N/A';

        const totalCollection = filteredData
            .filter(m => m.status === 'released' && m.total_collection_crore != null)
            .reduce((acc, curr) => acc + curr.total_collection_crore, 0);

        return { totalMovies, releasedCount, upcomingCount, avgRating, totalCollection };
    }, [filteredData]);

    // Chart Data Preparation
    const industryDistribution = useMemo(() => {
        const counts = {};
        filteredData.forEach(m => { counts[m.industry] = (counts[m.industry] || 0) + 1; });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [filteredData]);

    const collectionByIndustry = useMemo(() => {
        const data = {};
        filteredData.forEach(m => {
            if (m.status === 'released' && m.total_collection_crore != null) {
                if (!data[m.industry]) data[m.industry] = 0;
                data[m.industry] += m.total_collection_crore;
            }
        });
        return Object.keys(data).map(key => ({
            name: key,
            collection: data[key]
        }));
    }, [filteredData]);

    const topMoviesByCollection = useMemo(() => {
        return [...filteredData]
            .filter(m => m.total_collection_crore != null)
            .sort((a, b) => b.total_collection_crore - a.total_collection_crore)
            .slice(0, 10)
            .map(m => ({ name: m.title.length > 15 ? m.title.substring(0, 12) + '...' : m.title, collection: m.total_collection_crore }));
    }, [filteredData]);

    const yearlyTrend = useMemo(() => {
        const years = ['2025', '2026'];
        return years.map(y => {
            const count = filteredData.filter(m => m.release_year.toString() === y).length;
            return { year: y, count };
        });
    }, [filteredData]);

    const COLORS = ['#e50914', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <>
            <Head>
                <title>{`Movie Analytics | Admin`}</title>
            </Head>
            <div className="flex bg-black min-h-screen text-white font-sans">
                <AdminSidebar />
                <main className="flex-1 ml-[260px] p-8 overflow-y-auto h-screen bg-[#0f0f0f] custom-scrollbar">
                    <header className="mb-8 flex justify-between items-center bg-[#151515] p-6 rounded-xl border border-gray-800">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
                                Movie Analysis
                            </h1>
                            <p className="text-gray-500 mt-1 uppercase text-xs font-bold tracking-widest">Database Insights • 2025-2026 Roadmap</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-black/40 px-4 py-2 rounded-lg border border-gray-800 text-center">
                                <p className="text-[10px] text-gray-500 font-bold uppercase">Update Status</p>
                                <p className="text-sm font-mono text-green-400">LIVE</p>
                            </div>
                        </div>
                    </header>

                    {/* Filters Section */}
                    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 mb-8 shadow-2xl">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {[
                                { label: 'Release Year', key: 'release_year', options: uniqueYears },
                                { label: 'Industry', key: 'industry', options: uniqueIndustries },
                                { label: 'Category', key: 'category', options: uniqueCategories },
                                { label: 'Platform', key: 'platform', options: uniquePlatforms },
                                { label: 'Status', key: 'status', options: uniqueStatus }
                            ].map((filter) => (
                                <div key={filter.key} className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">{filter.label}</label>
                                    <select
                                        value={filters[filter.key]}
                                        onChange={(e) => setFilters(prev => ({ ...prev, [filter.key]: e.target.value }))}
                                        className="bg-black border border-gray-700 text-white rounded-lg p-2.5 text-sm focus:border-primary outline-none transition-all hover:border-gray-500 cursor-pointer appearance-none"
                                    >
                                        <option value="All">All {filter.label}s</option>
                                        {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        {[
                            { label: 'Total Content', value: kpis.totalMovies, color: 'text-blue-400', border: 'border-blue-500/50' },
                            { label: 'Released', value: kpis.releasedCount, color: 'text-green-400', border: 'border-green-500/50' },
                            { label: 'Upcoming', value: kpis.upcomingCount, color: 'text-yellow-400', border: 'border-yellow-500/50' },
                            { label: 'Avg Rating', value: kpis.avgRating, color: 'text-purple-400', border: 'border-purple-500/50', suffix: '★' },
                            { label: 'Box Office', value: `$${kpis.totalCollection.toLocaleString()}`, color: 'text-red-400', border: 'border-red-500/50', suffix: 'M' }
                        ].map((kpi, idx) => (
                            <div key={idx} className={`bg-[#1a1a1a] p-6 rounded-xl border-t-2 ${kpi.border} shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300`}>
                                <h3 className="text-gray-500 text-[10px] font-extrabold uppercase mb-2 tracking-widest">{kpi.label}</h3>
                                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value} <span className="text-xs opacity-50">{kpi.suffix}</span></p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Pie Chart: Industry Distribution */}
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h3 className="text-lg font-bold mb-6 text-white text-center">Industry Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={industryDistribution}
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {industryDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Total collection by industry */}
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h3 className="text-lg font-bold mb-6 text-white text-center">Collection by Industry</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={collectionByIndustry}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                        <XAxis dataKey="name" stroke="#666" fontSize={11} />
                                        <YAxis stroke="#666" fontSize={11} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,196,159,0.1)' }}
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(v) => `$${v} M`}
                                        />
                                        <Bar dataKey="collection" fill="#00C49F" radius={[6, 6, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Top 10 movies by collection */}
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h3 className="text-lg font-bold mb-6 text-white text-center">Top 10 Movies by Collection</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topMoviesByCollection} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#333" />
                                        <XAxis type="number" stroke="#666" fontSize={11} />
                                        <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={100} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                            formatter={(v) => `$${v} M`}
                                        />
                                        <Bar dataKey="collection" fill="#e50914" radius={[0, 6, 6, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Line Chart: Movies released per year */}
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                            <h3 className="text-lg font-bold mb-6 text-white text-center">Yearly Release Trend</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={yearlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                        <XAxis dataKey="year" stroke="#666" fontSize={12} />
                                        <YAxis stroke="#666" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Line type="monotone" dataKey="count" stroke="#e50914" strokeWidth={3} dot={{ fill: '#e50914', r: 6 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Data Table */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151515]">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">database</span>
                                Detailed Movie Insights
                            </h3>
                            <span className="text-xs font-mono text-gray-500 bg-black px-2 py-1 rounded">ROWS: {filteredData.length}</span>
                        </div>
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#0f0f0f] text-[10px] uppercase font-bold text-gray-500 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('title')}>Movie Title</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('industry')}>Industry</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('category')}>Category</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('release_year')}>Year</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors text-right" onClick={() => requestSort('imdb_rating')}>IMDb Score</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors text-right" onClick={() => requestSort('total_collection_crore')}>Collection (M)</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('platform')}>Platform</th>
                                        <th className="px-6 py-4 cursor-pointer hover:bg-gray-800 transition-colors" onClick={() => requestSort('status')}>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {deduplicatedData.map((movie) => (
                                        <tr key={movie.movie_id} className="hover:bg-white/[0.03] transition-colors border-b border-gray-800/50">
                                            <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{cleanTitle(movie.title)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${movie.industry === 'Hollywood' ? 'bg-blue-500/10 text-blue-400' :
                                                    movie.industry === 'Bollywood' ? 'bg-orange-500/10 text-orange-400' : 'bg-green-500/10 text-green-400'}`}>
                                                    {movie.industry}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{movie.category}</td>
                                            <td className="px-6 py-4 text-gray-300 font-mono">{movie.release_year}</td>
                                            <td className="px-6 py-4 text-right">
                                                {movie.imdb_rating ? (
                                                    <span className="text-yellow-500 font-bold px-2 py-1 bg-yellow-500/10 rounded">{movie.imdb_rating} ★</span>
                                                ) : <span className="text-gray-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-green-400">
                                                {movie.total_collection_crore ? `$${movie.total_collection_crore}M` : <span className="text-gray-600">—</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-medium border ${movie.platform === 'Netflix' ? 'border-red-600/30 bg-red-600/5 text-red-500' :
                                                    movie.platform === 'Disney+' ? 'border-blue-500/30 bg-blue-500/5 text-blue-400' : 'border-gray-700 bg-gray-800/50 text-gray-400'}`}>
                                                    {movie.platform}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${movie.status === 'released' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400 animate-pulse'}`}>
                                                    {movie.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: #0f0f0f; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
                `}</style>
            </div>
        </>
    );
}
