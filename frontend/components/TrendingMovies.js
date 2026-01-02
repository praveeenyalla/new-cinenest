
// Refresh: 2025-12-31T00:50:00
import { useState, useMemo } from 'react';
import moviesData from '../utils/movies_data.json';

export default function TrendingMovies({ isDashboard = false }) {
    const [filters, setFilters] = useState({
        release_year: 'All',
        industry: [],
        category: [],
        platform: []
    });

    const industries = ['Hollywood', 'Bollywood', 'Tollywood'];
    const categories = ['Action', 'Drama', 'Sci-Fi', 'Thriller', 'Family', 'Fantasy', 'Romance'];
    const platforms = ['Theatrical', 'Netflix', 'Prime Video', 'Disney+', 'Hulu'];

    const toggleFilter = (type, value) => {
        setFilters(prev => {
            const current = prev[type];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [type]: updated };
        });
    };

    const filteredMovies = useMemo(() => {
        return moviesData.filter(movie => {
            // Filter by Release Year
            if (filters.release_year !== 'All' && movie.release_year.toString() !== filters.release_year) return false;

            // Filter by Industry
            if (filters.industry.length > 0 && !filters.industry.includes(movie.industry)) return false;

            // Filter by Category
            if (filters.category.length > 0 && !filters.category.includes(movie.category)) return false;

            // Filter by Platform
            if (filters.platform.length > 0 && !filters.platform.includes(movie.platform)) return false;

            return true;
        }).sort((a, b) => {
            // Sort by IMDb Rating (Highest first)
            const ratingA = a.imdb_rating || 0;
            const ratingB = b.imdb_rating || 0;
            if (ratingB !== ratingA) return ratingB - ratingA;

            // Then by Collection (Highest first)
            const collectionA = a.total_collection_crore || 0;
            const collectionB = b.total_collection_crore || 0;
            return collectionB - collectionA;
        });
    }, [filters]);

    const upcoming2026 = useMemo(() => {
        return moviesData.filter(m => m.release_year === 2026 && m.status === 'upcoming').slice(0, 8);
    }, []);

    return (
        <section className={`${isDashboard ? 'py-0 px-0' : 'py-16 px-4 md:px-10 lg:px-20'} bg-transparent text-white`}>
            <div className={`${isDashboard ? 'max-w-full' : 'max-w-[1400px]'} mx-auto`}>
                <div className="mb-10">
                    {!isDashboard && <h2 className="text-3xl font-bold mb-6 border-l-4 border-primary pl-4">Trending Movies</h2>}
                    {isDashboard && (
                        <div className="flex items-end justify-between border-b border-white/5 pb-6 mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                                <span className="w-2 h-6 bg-primary rounded-full"></span>
                                Trending Movies (2025-2026)
                            </h2>
                        </div>
                    )}

                    {/* Filters */}
                    <div className={`flex flex-col ${isDashboard ? 'gap-4' : 'lg:flex-row gap-6'} bg-[#1f1f1f] p-6 rounded-xl border border-white/10 shadow-2xl`}>
                        {/* Year Selection */}
                        <div className="flex flex-col gap-2 min-w-[120px]">
                            <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Release Year</label>
                            <div className="relative">
                                <select
                                    value={filters.release_year}
                                    onChange={(e) => setFilters(prev => ({ ...prev, release_year: e.target.value }))}
                                    className="w-full bg-black border border-white/20 rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none appearance-none cursor-pointer hover:border-white/40 transition-all font-bold"
                                >
                                    <option value="All">All Years</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">expand_more</span>
                            </div>
                        </div>

                        {/* Industry Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Industry</label>
                            <div className="flex flex-wrap gap-2">
                                {industries.map(ind => (
                                    <button
                                        key={ind}
                                        onClick={() => toggleFilter('industry', ind)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filters.industry.includes(ind)
                                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {ind}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Genre</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => toggleFilter('category', cat)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filters.category.includes(cat)
                                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Platform Filter */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] uppercase text-gray-400 font-extrabold tracking-wider">Platform</label>
                            <div className="flex flex-wrap gap-2">
                                {platforms.map(plt => (
                                    <button
                                        key={plt}
                                        onClick={() => toggleFilter('platform', plt)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${filters.platform.includes(plt)
                                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(229,9,20,0.3)]'
                                            : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                                            }`}
                                    >
                                        {plt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                {filteredMovies.length === 0 ? (
                    <div className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-dashed border-white/10">
                        <span className="material-symbols-outlined text-5xl mb-4 opacity-20">movie_filter</span>
                        <p className="text-lg font-medium">No movies found matching your criteria.</p>
                        <button onClick={() => setFilters({ release_year: 'All', industry: [], category: [], platform: [] })} className="mt-4 text-primary hover:underline font-bold">Clear all filters</button>
                    </div>
                ) : (
                    <div className={`grid grid-cols-1 ${isDashboard ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-4'} gap-8`}>
                        {filteredMovies.slice(0, 100).map((movie) => (
                            <MovieCard key={movie.movie_id} movie={movie} />
                        ))}
                    </div>
                )}

                {/* Upcoming 2026 Section */}
                {!isDashboard && upcoming2026.length > 0 && (
                    <div className="mt-24">
                        <div className="flex items-center justify-between mb-10 border-b border-white/10 pb-6">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tight uppercase">Upcoming 2026</h2>
                                <p className="text-gray-500 text-sm mt-1 font-bold">THE FUTURE OF CINEMA • ANTICIPATED RELEASES</p>
                            </div>
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black border border-primary/20">2026 CATALOG</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {upcoming2026.map((movie) => (
                                <MovieCard key={movie.movie_id} movie={movie} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

function MovieCard({ movie }) {
    return (
        <div className="bg-[#151515] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative">
            <div className="absolute top-4 right-4 z-10">
                {movie.status === 'released' && movie.imdb_rating && (
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-yellow-500/30 flex items-center gap-1 shadow-lg">
                        <span className="material-symbols-outlined text-yellow-500 text-xs filled">star</span>
                        <span className="text-yellow-500 font-black text-xs">{movie.imdb_rating.toFixed(1)}</span>
                    </div>
                )}
                {movie.status !== 'released' && (
                    <div className="bg-primary/90 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shadow-lg">
                        AWARD WINNING
                    </div>
                )}
            </div>

            <div className="p-6">
                <div className="flex gap-2 mb-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm ${movie.industry === 'Hollywood' ? 'bg-blue-600 text-white' :
                        movie.industry === 'Bollywood' ? 'bg-orange-500 text-white' :
                            'bg-green-600 text-white'
                        }`}>
                        {movie.industry}
                    </span>
                </div>

                <h3 className="text-white font-black text-xl mb-1 leading-tight group-hover:text-primary transition-colors min-h-[3rem] line-clamp-2">{movie.title}</h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-6">
                    <span>{movie.release_year}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                    <span>{movie.category}</span>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Global Box Office</span>
                        <span className="text-white font-mono font-black text-sm text-green-400">
                            {movie.status === 'released' ? (movie.total_collection_crore ? `$${movie.total_collection_crore}M` : '-') : '—'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Digital Platform</span>
                        <span className="text-gray-300 text-xs font-bold">{movie.platform}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest">Market Status</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${movie.status === 'released' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {movie.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <button className="w-full bg-white text-black font-black py-3 rounded-xl text-sm uppercase tracking-tighter hover:bg-primary hover:text-white transition-colors">
                    View Analysis
                </button>
            </div>
        </div>
    );
}
