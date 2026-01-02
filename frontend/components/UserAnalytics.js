import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { API_URL } from '../config/api';

const UserAnalytics = () => {
    // --- State ---
    const [isMounted, setIsMounted] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [filters, setFilters] = useState({
        year: 'All Years',
        platform: 'All Platforms',
        imdbRange: [0, 10],
        type: 'All'
    });
    // Table State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // --- User Analytics State (New) ---
    const [userAnalyticsData, setUserAnalyticsData] = useState([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userLoading, setUserLoading] = useState(false);
    const [userPage, setUserPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userFilters, setUserFilters] = useState({
        username: '',
        platform: 'All Platforms',
        category: 'All Categories'
    });

    // --- Enhanced Theme Constants ---
    const BRAND_COLORS = {
        Netflix: '#e60a15',
        'Prime Video': '#3b82f6',
        'Disney+': '#0ea5e9',
        Hulu: '#22c55e',
        Other: '#8b5cf6'
    };

    // Vibrant colors for Content Types
    const TYPE_COLORS = {
        'Movie': '#e60a15',   // Netflix Red (Vibrant)
        'Series': '#3b82f6',  // Prime Blue (Vibrant)
        'Tv Show': '#22c55e', // Hulu Green (Vibrant)
        'TV Show': '#22c55e',
        'Tv show': '#22c55e'
    };

    const CHART_COLORS = ['#e60a15', '#3b82f6', '#22c55e', '#f59e0b', '#0ea5e9', '#ec4899'];

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/data/final_df_cleaned.json');
                const jsonData = await response.json();
                setData(jsonData);
                setLoading(false);
            } catch (error) {
                console.error("Error loading dataset:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- Fetch User Analytics (New) ---
    useEffect(() => {
        const fetchUserAnalytics = async () => {
            setUserLoading(true);
            try {
                const params = new URLSearchParams({
                    page: userPage,
                    limit: 10,
                    username: userFilters.username,
                    platform_filter: userFilters.platform,
                    category_filter: userFilters.category
                });

                // Using the new API endpoint
                const response = await fetch(`${API_URL}/admin/user-analytics?${params.toString()}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('userToken')}` } // Corrected key
                });

                if (response.ok) {
                    const result = await response.json();
                    setUserAnalyticsData(result.data);
                    setUserTotal(result.total);
                }
            } catch (error) {
                console.error("Error fetching user analytics:", error);
            } finally {
                setUserLoading(false);
            }
        };

        // Debounce for username search
        const timeoutId = setTimeout(() => {
            fetchUserAnalytics();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [userFilters, userPage]);

    // --- Extract Unique Years ---
    const availableYears = useMemo(() => {
        if (!data.length) return [];
        const years = new Set(data.map(item => item.Year).filter(Boolean));
        return Array.from(years).sort((a, b) => b - a);
    }, [data]);

    // --- Filter Logic ---
    const filteredData = useMemo(() => {
        if (!data.length) return [];

        return data.filter(item => {
            if (filters.year !== 'All Years') {
                if (parseInt(item.Year) !== parseInt(filters.year)) return false;
            }

            const imdb = parseFloat(item.IMDb) || 0;
            if (imdb < filters.imdbRange[0] || imdb > filters.imdbRange[1]) return false;

            const itemType = (item.Type || '').toLowerCase();
            if (filters.type !== 'All') {
                const filterType = filters.type.toLowerCase();
                if (filterType === 'series/tv show') {
                    if (!['series', 'tv show', 'tv-show'].includes(itemType)) return false;
                } else if (itemType !== filterType) {
                    return false;
                }
            }

            if (filters.platform !== 'All Platforms') {
                if (item[filters.platform] !== 1) return false;
            }

            return true;
        });
    }, [data, filters]);

    // --- Table Data Logic ---
    const tableData = useMemo(() => {
        let result = filteredData;

        // Search Filter
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.Title || '').toLowerCase().includes(lowerTerm)
            );
        }

        return result;
    }, [filteredData, searchTerm]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return tableData.slice(startIndex, startIndex + itemsPerPage);
    }, [tableData, currentPage]);

    const totalPages = Math.ceil(tableData.length / itemsPerPage);


    // --- KPI Calculations ---
    const kpis = useMemo(() => {
        const total = filteredData.length;
        const totalMovies = filteredData.filter(d => (d.Type || '').toLowerCase() === 'movie').length;
        const totalSeries = filteredData.filter(d => ['series', 'tv show'].includes((d.Type || '').toLowerCase())).length;

        const imdbValues = filteredData.map(d => parseFloat(d.IMDb) || 0).filter(v => v > 0);
        const avgImdb = imdbValues.length ? (imdbValues.reduce((a, b) => a + b, 0) / imdbValues.length).toFixed(1) : 0;
        const maxImdb = imdbValues.length ? Math.max(...imdbValues).toFixed(1) : 0;
        const minImdb = imdbValues.length ? Math.min(...imdbValues).toFixed(1) : 0;

        return { total, totalMovies, totalSeries, avgImdb, maxImdb, minImdb };
    }, [filteredData]);

    // --- Chart Data Preparation ---

    const yearChartData = useMemo(() => {
        const counts = {};
        filteredData.forEach(d => {
            const y = d.Year || 'Unknown';
            counts[y] = (counts[y] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([year, count]) => ({ year, count }))
            .sort((a, b) => a.year - b.year);
    }, [filteredData]);

    const platformChartData = useMemo(() => {
        const platforms = ["Netflix", "Prime Video", "Disney+", "Hulu"];
        return platforms.map(p => ({
            name: p === 'Prime Video' ? 'Prime' : p === 'Disney+' ? 'Disney' : p,
            fullName: p,
            count: filteredData.reduce((acc, item) => acc + (item[p] === 1 ? 1 : 0), 0),
            fill: BRAND_COLORS[p]
        }));
    }, [filteredData]);

    const imdbChartData = useMemo(() => {
        const buckets = { "0-4": 0, "4-6": 0, "6-7": 0, "7-8": 0, "8-9": 0, "9-10": 0 };
        filteredData.forEach(d => {
            const rating = parseFloat(d.IMDb) || 0;
            if (rating < 4) buckets["0-4"]++;
            else if (rating < 6) buckets["4-6"]++;
            else if (rating < 7) buckets["6-7"]++;
            else if (rating < 8) buckets["7-8"]++;
            else if (rating < 9) buckets["8-9"]++;
            else buckets["9-10"]++;
        });
        return Object.entries(buckets).map(([range, count]) => ({ range, count }));
    }, [filteredData]);

    const typeChartData = useMemo(() => {
        const counts = {};
        filteredData.forEach(d => {
            let t = (d.Type || 'Unknown').toLowerCase();
            t = t.charAt(0).toUpperCase() + t.slice(1);
            counts[t] = (counts[t] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            fill: TYPE_COLORS[name] || CHART_COLORS[0]
        }));
    }, [filteredData]);


    // --- Handlers ---
    const handleImdbChange = (e, index) => {
        const val = parseFloat(e.target.value);
        const newRange = [...filters.imdbRange];
        newRange[index] = val;
        setFilters({ ...filters, imdbRange: newRange });
    };

    if (loading) return <div className="p-8 text-white flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="w-full text-white font-sans bg-transparent" id="main-label-panel">
            <style jsx>{`
                .glass-panel {
                    background: rgba(10, 10, 10, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }
                .filter-input {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    padding: 6px 12px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .filter-input:focus {
                    border-color: #e60a15;
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(230, 10, 21, 0.2);
                }
                .filter-input option {
                    background-color: #1a1a1a;
                    color: white;
                    padding: 10px;
                }
                .range-slider {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    outline: none;
                }
                .range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #e60a15;
                    cursor: pointer;
                    border-radius: 50%;
                    border: 2px solid #000;
                    box-shadow: 0 0 10px rgba(230,10,21,0.5);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary rounded-full"></span>
                        User Analysis
                    </h2>

                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-2xl font-bold font-mono text-primary">{filteredData.length.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Active Records</div>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 glass-panel rounded-xl">
                {/* Year Filter */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Year</label>
                    <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="filter-input w-full bg-black/20"
                    >
                        <option value="All Years">All Years</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Platform Filter */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform</label>
                    <select
                        value={filters.platform}
                        onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                        className="filter-input w-full bg-black/20"
                    >
                        <option>All Platforms</option>
                        <option>Netflix</option>
                        <option>Prime Video</option>
                        <option>Disney+</option>
                        <option>Hulu</option>
                    </select>
                </div>

                {/* IMDb Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">IMDb Rating</label>
                    <div className="flex items-center justify-between text-sm font-mono text-yellow-500 mb-2">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">star</span> {filters.imdbRange[0]}</span>
                        <span className="text-gray-600">-</span>
                        <span>{filters.imdbRange[1]}</span>
                    </div>
                    <div className="relative h-6">
                        <input
                            type="range" min="0" max="10" step="0.1"
                            value={filters.imdbRange[0]}
                            onChange={(e) => handleImdbChange(e, 0)}
                            className="range-slider absolute w-full top-2 z-10"
                        />
                        <input
                            type="range" min="0" max="10" step="0.1"
                            value={filters.imdbRange[1]}
                            onChange={(e) => handleImdbChange(e, 1)}
                            className="range-slider absolute w-full top-2 z-10"
                        />
                    </div>
                </div>

                {/* Type Filter */}
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content Type</label>
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        className="filter-input w-full bg-black/20"
                    >
                        <option>All</option>
                        <option>Movie</option>
                        <option>Series</option>
                        <option>TV Show</option>
                    </select>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { title: "Total Titles", value: kpis.total, icon: "movie", color: "text-white" },
                    { title: "Movies", value: kpis.totalMovies, icon: "videocam", color: "text-blue-400" },
                    { title: "Series/TV", value: kpis.totalSeries, icon: "tv", color: "text-purple-400" },
                    { title: "Avg Rating", value: kpis.avgImdb, icon: "star_half", color: "text-yellow-400" },
                    { title: "Best Rating", value: kpis.maxImdb, icon: "trophy", color: "text-green-400" },
                    { title: "Low Rating", value: kpis.minImdb, icon: "trending_down", color: "text-red-400" },
                ].map((kpi, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-white/10">
                        <div className={`mb-2 p-2 rounded-full bg-white/5 ${kpi.color} group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-xl">{kpi.icon}</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">{kpi.title}</span>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Titles by Year */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <span className="material-symbols-outlined text-6xl text-primary">calendar_month</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">timeline</span>
                        Content Release Timeline
                    </h3>
                    <div className="h-[300px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={yearChartData}>
                                    <defs>
                                        <linearGradient id="colorYear" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e60a15" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#e60a15" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="year" stroke="#666" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#666" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#fff' }}
                                        cursor={{ stroke: '#e60a15', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#e60a15" strokeWidth={2} fillOpacity={1} fill="url(#colorYear)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Platform Distribution */}
                <div className="glass-panel p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">apps</span>
                        Platform Share
                    </h3>
                    <div className="h-[300px] w-full">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={platformChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" stroke="#666" tick={{ fontSize: 10, fill: '#9ca3af' }} hide />
                                    <YAxis dataKey="name" type="category" stroke="#fff" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#fff' }} width={70} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                                        {platformChartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* IMDb Distribution */}
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-yellow-500">star</span>
                        Rating Distribution
                    </h3>
                    <div className="h-[300px]">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={imdbChartData}>
                                    <defs>
                                        <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="range" stroke="#666" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis stroke="#666" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="count" fill="url(#colorRating)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Content Type Breakdown */}
                <div className="glass-panel p-6 rounded-xl flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-500">pie_chart</span>
                        Content Types
                    </h3>
                    <div className="h-[300px] flex-1">
                        {isMounted && (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={typeChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {typeChartData.map((entry, index) => (
                                            <Cell key={index} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Filtered Content Library Table (Paginated) */}
            <div className="glass-panel rounded-xl overflow-hidden p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">library_books</span>
                            Filtered Content Library
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, tableData.length)} - {Math.min(currentPage * itemsPerPage, tableData.length)} of {tableData.length} filtered titles.
                        </p>
                    </div>

                    {/* Integrated Search Filter */}
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Search in filtered results..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0a0a0a] text-xs uppercase font-medium text-gray-500 font-mono tracking-wider">
                            <tr>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Title</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Year</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">IMDb</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Type</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Available On</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white group-hover:text-primary transition-colors">{item.Title}</td>
                                        <td className="px-6 py-4 font-mono text-xs">{item.Year}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded border ${parseFloat(item.IMDb) >= 8 ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                                                parseFloat(item.IMDb) >= 6 ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' :
                                                    'text-red-400 bg-red-500/10 border-red-500/20'
                                                }`}>
                                                {item.IMDb}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            <span className="bg-white/5 px-2 py-1 rounded text-xs border border-white/5 text-gray-300">
                                                {item.Type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="flex gap-2 flex-wrap">
                                                {item.Netflix === 1 && <span className="text-[#e60a15] font-bold bg-[#e60a15]/10 px-1.5 py-0.5 rounded">Netflix</span>}
                                                {item['Prime Video'] === 1 && <span className="text-[#3b82f6] font-bold bg-[#3b82f6]/10 px-1.5 py-0.5 rounded">Prime</span>}
                                                {item['Disney+'] === 1 && <span className="text-[#0ea5e9] font-bold bg-[#0ea5e9]/10 px-1.5 py-0.5 rounded">Disney+</span>}
                                                {item.Hulu === 1 && <span className="text-[#22c55e] font-bold bg-[#22c55e]/10 px-1.5 py-0.5 rounded">Hulu</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 italic">No titles consistent with filter selection.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {tableData.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-6 border-t border-white/5 pt-4">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="text-sm text-gray-500 font-mono">
                            Page <span className="text-white">{currentPage}</span> of <span className="text-white">{totalPages}</span>
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-4 py-2 text-sm text-gray-400 bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* --- New User Analytics Section --- */}
            <div className="mt-12 mb-8 flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyan-400 rounded-full"></span>
                        User Intelligence & Analytics
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 ml-4">Real-time user monitoring and engagement tracking.</p>
                </div>
            </div>

            {/* User Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-6 glass-panel rounded-xl">
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Search User</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-500 text-sm">search</span>
                        <input
                            type="text"
                            placeholder="Username..."
                            value={userFilters.username}
                            onChange={(e) => setUserFilters({ ...userFilters, username: e.target.value })}
                            className="bg-black/40 border border-white/10 text-white text-sm rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:border-cyan-400 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Platform Interest</label>
                    <select
                        value={userFilters.platform}
                        onChange={(e) => setUserFilters({ ...userFilters, platform: e.target.value })}
                        className="filter-input w-full bg-black/20"
                    >
                        <option>All Platforms</option>
                        <option>Netflix</option>
                        <option>Prime Video</option>
                        <option>Disney+</option>
                        <option>Hulu</option>
                    </select>
                </div>
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Preference</label>
                    <select
                        value={userFilters.category}
                        onChange={(e) => setUserFilters({ ...userFilters, category: e.target.value })}
                        className="filter-input w-full bg-black/20"
                    >
                        <option>All Categories</option>
                        <option>Action</option>
                        <option>Comedy</option>
                        <option>Drama</option>
                        <option>Sci-Fi</option>
                    </select>
                </div>
            </div>

            {/* User Table */}
            <div className="glass-panel rounded-xl overflow-hidden p-6 relative">
                {userLoading && <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400"></div></div>}

                <div className="overflow-x-auto rounded-lg border border-white/5">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#0a0a0a] text-xs uppercase font-medium text-gray-500 font-mono tracking-wider">
                            <tr>
                                <th className="px-6 py-4 bg-[#0a0a0a]">User</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Email</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Subscription</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Preferences</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Watch Time</th>
                                <th className="px-6 py-4 bg-[#0a0a0a]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {userAnalyticsData.length > 0 ? userAnalyticsData.map((user) => (
                                <tr key={user._id} className="hover:bg-cyan-500/[0.05] transition-colors">
                                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${user.subscription_tier === 'Premium' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                            user.subscription_tier === 'Standard' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {user.subscription_tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {user.preferences.slice(0, 2).map((p, i) => (
                                                <span key={i} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-gray-300">{p}</span>
                                            ))}
                                            {user.preferences.length > 2 && <span className="text-[10px] text-gray-500">+{user.preferences.length - 2}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-cyan-400">{Math.round(user.total_watch_time_mins / 60)}h {(user.total_watch_time_mins % 60)}m</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            className="text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded transition-colors"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* User Pagination */}
                <div className="flex items-center justify-between mt-4">
                    <button
                        disabled={userPage === 1}
                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                    >Previous</button>
                    <span className="text-xs text-gray-500">Page <span className="text-white">{userPage}</span> of <span className="text-white">{Math.ceil(userTotal / 10)}</span></span>
                    <button
                        disabled={userPage * 10 >= userTotal}
                        onClick={() => setUserPage(p => p + 1)}
                        className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
                    >Next</button>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>

                        <div className="p-8">
                            <div className="flex items-start gap-6 border-b border-white/5 pb-8 mb-8">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/20">
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{selectedUser.full_name}</h2>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">alternate_email</span> {selectedUser.username}</span>
                                        <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                        <span>{selectedUser.email}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {selectedUser.preferences.map(p => (
                                            <span key={p} className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-full">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-400">history</span>
                                        Watch History
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedUser.history.slice(0, 5).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex-1">
                                                    <div className="text-sm font-bold text-white">{item.title}</div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span className={`font-bold ${item.platform === 'Netflix' ? 'text-red-500' : item.platform === 'Prime Video' ? 'text-blue-500' : item.platform === 'Hulu' ? 'text-green-500' : item.platform === 'Disney+' ? 'text-cyan-400' : 'text-gray-400'}`}>
                                                            {item.platform}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                                                        <span>{new Date(item.date).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-mono text-gray-400">{item.watched_duration_mins}m</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-yellow-400">star</span>
                                        Recent Ratings
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedUser.ratings.slice(0, 5).map((rate, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-bold text-white">{rate.title}</span>
                                                    <div className="flex text-yellow-500 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i} className="material-symbols-outlined text-[10px]">
                                                                {i < rate.rating ? 'star' : 'star_border'}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 translate-y-[-2px] italic">"{rate.review}"</p>
                                            </div>
                                        ))}
                                        {selectedUser.ratings.length === 0 && <p className="text-sm text-gray-500 italic">No ratings given yet.</p>}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserAnalytics;
