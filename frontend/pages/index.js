import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';
import TrailersGrid, { TRAILERS_DATA } from '../components/TrailersGrid';
import TrailerCard from '../components/TrailerCard';
import TrailerModal from '../components/TrailerModal';
import { motion, AnimatePresence } from 'framer-motion';

import { API_URL } from '../config/api';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [curatedData, setCuratedData] = useState({ trending_now: [], top_rated: [], netflix_new: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeGlobalTrailer, setActiveGlobalTrailer] = useState(null);

  const handlePlay = (id, movie, embedUrl, withAudio = true) => {
    let finalEmbed = embedUrl;
    if (!finalEmbed) {
      const originalUrl = movie.trailerUrl || movie.trailer || "";
      finalEmbed = originalUrl.includes('watch?v=')
        ? originalUrl.replace('watch?v=', 'embed/')
        : originalUrl;
    }

    // Ensure embed format for final URL
    if (!finalEmbed.includes('embed/')) {
      finalEmbed = finalEmbed.replace('watch?v=', 'embed/');
    }

    setActiveGlobalTrailer({
      id,
      ...movie,
      trailerUrl: finalEmbed,
      withAudio
    });
  };


  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('username') || localStorage.getItem('userEmail');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUser || 'User');
    }

    const fetchCurated = async () => {
      // Fallback data in case API fails
      const fallbackCuratedData = {
        trending_now: [
          { title: "Stranger Things", year: 2025, imdb: 8.7, genres: ["Sci-Fi", "Horror"], platforms: ["Netflix"] },
          { title: "John Wick", year: 2014, imdb: 7.4, genres: ["Action", "Thriller"], platforms: ["Peacock"] },
          { title: "Cobra Kai", year: 2018, imdb: 8.5, genres: ["Action", "Comedy"], platforms: ["Netflix"] },
          { title: "Avengers", year: 2012, imdb: 8.0, genres: ["Action", "Sci-Fi"], platforms: ["Disney+"] },
          { title: "Money Heist", year: 2017, imdb: 8.2, genres: ["Crime", "Drama"], platforms: ["Netflix"] }
        ],
        top_rated: [
          { title: "Final Destination", year: 2000, imdb: 6.7, genres: ["Horror", "Thriller"] },
          { title: "ChinnaKesavaReddy", year: 2002, imdb: 6.8, genres: ["Action", "Drama"] },
          { title: "Suits", year: 2011, imdb: 8.4, genres: ["Drama", "Comedy"] },
          { title: "Friends", year: 1994, imdb: 8.9, genres: ["Comedy", "Romance"] },
          { title: "wednesday", year: 2022, imdb: 8.1, genres: ["Fantasy", "Comedy"] },
          { title: "Young Seldhon", year: 2017, imdb: 7.6, genres: ["Comedy"] }
        ],
        netflix_new: []
      };

      try {
        const url = `${API_URL}/ai/curated`;
        console.log("Fetching curated content from:", url);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();

          // OVERRIDE: Enforce manual titles for the first 5 Trending items to match hardcoded images
          const manualTrending = fallbackCuratedData.trending_now;
          const mergedTrending = (data.trending_now || []).map((item, index) => {
            if (index < manualTrending.length) {
              return { ...item, ...manualTrending[index] }; // Overwrite API title/meta with manual
            }
            return item;
          });

          // If API returns fewer items than manual, append manual ones
          if (mergedTrending.length < manualTrending.length) {
            for (let i = 0; i < manualTrending.length; i++) {
              if (!mergedTrending[i]) mergedTrending[i] = manualTrending[i];
              else mergedTrending[i] = { ...mergedTrending[i], ...manualTrending[i] };
            }
          }

          // OVERRIDE: Enforce manual titles for Hall of Fame (Top Rated) items to match hardcoded images
          const manualTopRated = fallbackCuratedData.top_rated;
          const mergedTopRated = (data.top_rated || []).map((item, index) => {
            if (index < manualTopRated.length) {
              return { ...item, ...manualTopRated[index] }; // Overwrite API title/meta with manual
            }
            return item;
          });

          // Ensure manual top rated items are present if API returns fewer
          if (mergedTopRated.length < manualTopRated.length) {
            for (let i = 0; i < manualTopRated.length; i++) {
              if (!mergedTopRated[i]) mergedTopRated[i] = manualTopRated[i];
              else mergedTopRated[i] = { ...mergedTopRated[i], ...manualTopRated[i] };
            }
          }

          setCuratedData({
            trending_now: mergedTrending,
            top_rated: mergedTopRated,
            netflix_new: data.netflix_new || []
          });
        } else {
          throw new Error(`API returned ${res.status}`);
        }
      } catch (err) {
        console.error("Failed to fetch curated content, using fallback:", err);
        setCuratedData(fallbackCuratedData);
      } finally {
        setLoading(false);
      }
    };
    fetchCurated();
  }, []);



  // reliable backdrops for demo
  const backdrops = [


    "https://pbs.twimg.com/media/DKi5oicVYAM6C2q.jpg",
    "https://img.airtel.tv/unsafe/fit-in/500x0/filters:format(webp)/https://xstreamcp-assets-msp.streamready.in/assets/HOTSTAR_DTH/SERIES/690e107c287dfd4cb48198c1/images/PORTRAIT/1734497809655-v?o=production",
    "https://media.posterstore.com/site_images/68631cf30b074212f55c844b_472608644_WB0074-8.jpg?auto=compress%2Cformat&fit=max&w=3840",
    "https://images-cdn.ubuy.ae/64efda27ec49f86e4c6ce257-wednesday-tv-show-poster-wednesday.jpg",
    "https://m.media-amazon.com/images/I/81c8B0UbFtL._AC_UF1000,1000_QL80_.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTnqWOZ99fTgmHd3uMpq_P6Y9didPr3IDK2aQ&s",

  ]
  const customTrendingImages = [
    "https://deadline.com/wp-content/uploads/2025/11/Stranger-Things-5_33a02d.jpg?w=1024", // 1: Stranger Things
    "https://www.tallengestore.com/cdn/shop/products/JohnWick-KeanuReeves-HollywoodEnglishActionMoviePoster-1_769183ab-298c-43d8-82ce-45b958ca2426.jpg?v=1649071596", // 2: John Wick
    "https://m.media-amazon.com/images/M/MV5BYjA3NDkwNzktNjJkYi00ODNhLWFhYzQtYzk5NjU4MDM0OWZmXkEyXkFqcGc@._V1_.jpg", // 3: Cobra Kai
    "https://resizing.flixster.com/CXOXbOpLNL1NNkXTQu-4Rgvcszs=/ems.cHJkLWVtcy1hc3NldHMvbW92aWVzLzM0NGRkMDM2LWVjNDQtNGZlMC04NGM3LWZkMzQ2Njg1OTUyNi53ZWJw", // 4: Avengers
    "https://m.media-amazon.com/images/M/MV5BZjkxZWJiNTUtYjQwYS00MTBlLTgwODQtM2FkNWMyMjMwOGZiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg", // 5: Money Heist
  ];

  // Manual Images for Hall of Fame (Top Rated)
  // User to populate these URLs
  const customTopRatedImages = [
    "", // 1
    "", // 2
    "", // 3
    "", // 4
    "", // 5
    "", // 6
  ];

  const getBackdrop = (index, type = 'trending') => {
    // Check if a custom image exists for this index based on type
    if (type === 'trending' && customTrendingImages[index] && customTrendingImages[index].trim() !== "") {
      return customTrendingImages[index];
    }
    if (type === 'top_rated' && customTopRatedImages[index] && customTopRatedImages[index].trim() !== "") {
      return customTopRatedImages[index];
    }

    // Fallback to default backdrops
    // If top_rated, offset the backdrop index to avoid repeating the same ones from trending immediately
    const offset = type === 'top_rated' ? 5 : 0;
    return backdrops[(index + offset) % backdrops.length];
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    router.reload();
  };

  return (
    <>
      <Head>
        <title>CINE NEST - AI Powered Discovery</title>
      </Head>

      <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden min-h-screen">
        {/* TopNavBar */}
        <header className="sticky top-0 z-50 w-full border-b border-[#392829]/50 bg-background-dark/80 backdrop-blur-md transition-all duration-300">
          <div className="flex items-center justify-between px-6 py-4 lg:px-20 max-w-[1440px] mx-auto">
            <Link href="/">
              <div className="flex items-center gap-3 text-white cursor-pointer group">
                <div className="text-primary group-hover:text-primary-dark transition-colors">
                  <span className="material-symbols-outlined text-3xl">smart_display</span>
                </div>
                <h2 className="text-white text-2xl font-black tracking-tight drop-shadow-lg">CINE NEST</h2>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Home</Link>
              <Link href="/ai" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">AI Curated</Link>
              <Link href="/dashboard" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Analytics</Link>
              <Link href="/about" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">About</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Contact</Link>

              {!isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link href="/auth?mode=login">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-primary hover:bg-red-700 border border-primary text-white text-sm font-bold tracking-wide transition-all">
                      <span className="truncate">Sign In</span>
                    </button>
                  </Link>
                  <Link href="/auth">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-5 bg-primary hover:bg-red-700 transition-colors text-white text-sm font-bold tracking-wide">
                      <span className="truncate">Sign Up</span>
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none"
                  >
                    <span className="hidden sm:block text-sm font-bold text-gray-300">Hi, {username.split('@')[0]}</span>
                    <div
                      className="size-10 rounded-full bg-surface-highlight border border-white/10 overflow-hidden bg-center bg-cover hover:border-primary transition-all"
                      style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIJhsYNmNCTBCo3NNv9a8bn6tKxMP2V029SbUT-D01fwxh4LWyPsmZuVPw-nYI-D3W9ALBVHDOGq4-vX9Dl57aww4GGx7juhMm84yxeAyO9S34o9mEmcKCGPZ5QRKaXkA27y4lmda-uT4xoNSlMDXAthcM6WiS8zH2tXKmaQtwz8EMsz4gAKjdoffDXRuxeXa6mYtaMqmuMAssQDkQJbh-AMSJ6zlb6F3tb37GTMtDxFPMVHBKbJr6uzPgnVv14t3wM8qnUxAwHP8')" }}
                    ></div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#181111] border border-white/10 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Account</p>
                      </div>
                      <Link href="/my-list" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        My Lists
                      </Link>
                      <Link href="/history" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        Recently Watched
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                        Profile Settings
                      </Link>
                      <div className="h-px bg-white/10 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
            <div className="md:hidden text-white cursor-pointer">
              <span className="material-symbols-outlined">menu</span>
            </div>
          </div>
        </header>

        {/* HeroSection */}
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 md:px-10 lg:px-20 overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'linear-gradient(rgba(34, 16, 17, 0.7) 0%, rgba(34, 16, 17, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCD3CILkN9QpAcikvg1ZCOT23qc9tr25jm9GHDxtWimBEThhiJICbshzL7YMcjdPQOl-jOOZMwAoYxvphr3-P-YmkGCIZKrh4fG9UmoycW7oaNXZpXp28AsRUmlIRRsNaP6vs6E6YzFIvtshxnTwSDZsSiDWyeMkc55ruXC7ilB7mbw3Ttm1YYvGd-DwAggn7vTerH8fDv9ZnGcEmUyG0JEJAjS38sHynzUD9Wk0UJlraA3XJe595HKHDzuhoeNX9J6MOb_NuAW2vM")' }}>
          </div>
          <div className="relative z-10 flex flex-col items-center max-w-4xl gap-8 text-center pt-20 pb-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-xs font-medium text-primary tracking-widest uppercase">Beta Access Open</span>
            </div>
            <h1 className="text-white text-5xl md:text-7xl font-bold leading-tight tracking-tight">
              Cinema Intelligence. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Curated by AI.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
              Stop searching. Start watching. Let the CINE NEST Brain Engine analyze your mood and taste to find your next obsession instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mt-4">
              <Link href="/ai">
                <button className="flex cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-primary hover:bg-red-700 transition-all transform hover:scale-105 text-white text-base font-bold tracking-wide shadow-lg shadow-primary/25 group">
                  <span>Discover Your Next Obsession</span>
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </Link>
              <Link href="/auth">
                <button className="flex cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-sm text-white text-base font-bold tracking-wide transition-all">
                  <span>View Demo</span>
                  <span className="material-symbols-outlined ml-2">play_circle</span>
                </button>
              </Link>
            </div>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce">
            <span className="material-symbols-outlined text-4xl">keyboard_arrow_down</span>
          </div>
        </section>

        {/* Unified Library Showcase (New Section) */}


        <section className="py-24 bg-[#1f0e0f] border-b border-white/5 overflow-hidden" id="content-showcase">
          <div className="max-w-[1400px] mx-auto px-4 md:px-10 lg:px-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-4">Unified Library</h2>
                <h3 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-4">
                  All Your Platforms. <br />One Intelligent Stream.
                </h3>
                <p className="text-gray-300 text-lg">
                  CINE NEST aggregates the best content from every major streaming service. Hover to play trailers (3.5s delay).
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">Netflix</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">Prime</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">Hulu</span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">Disney+</span>
              </div>
            </div>

            <TrailersGrid
              activeId={activeGlobalTrailer?.id}
              onPlay={(movieData, embedUrl, withAudio) => handlePlay(movieData.id, movieData, embedUrl, withAudio)}
              onStop={() => setActiveGlobalTrailer(null)}
            />
          </div>
        </section>

        {/* FeatureSection */}
        <section className="py-24 px-4 md:px-10 lg:px-20 bg-background-dark relative overflow-hidden" id="features">
          {/* Decorative Glow */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
          </div>
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row gap-12 mb-16 items-start md:items-end justify-between">
              <div className="flex flex-col gap-4 max-w-2xl">
                <h2 className="text-primary font-bold tracking-widest uppercase text-sm">Core Technology</h2>
                <h3 className="text-white text-4xl md:text-5xl font-bold leading-tight">
                  The Future of Discovery
                </h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Unlock a new way to experience entertainment with our proprietary technologies designed to kill decision fatigue.
                </p>
              </div>
              <div className="hidden md:block">
                <button className="text-white border-b border-primary pb-1 hover:text-primary transition-colors flex items-center gap-2">
                  Learn more about our tech
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/5 bg-card-dark p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">psychology</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-white text-xl font-bold">The Brain Engine</h4>
                  <p className="text-gray-300 leading-relaxed">AI that understands your emotional context. Sad? Inspired? Nostalgic? We match the movie to your mood, not just tags.</p>
                </div>
              </div>
              {/* Feature 2 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/5 bg-card-dark p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">hub</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-white text-xl font-bold">One Hub</h4>
                  <p className="text-gray-300 leading-relaxed">Connect Netflix, HBO, Disney+, and Prime. Search once, watch anywhere. Your entire digital library in one intelligent nest.</p>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="group flex flex-col gap-6 rounded-2xl border border-white/5 bg-card-dark p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <span className="material-symbols-outlined text-3xl">diamond</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h4 className="text-white text-xl font-bold">Deep Cuts</h4>
                  <p className="text-gray-300 leading-relaxed">Go beyond the mainstream algorithm. Our "Hidden Gems" filter surfaces critically acclaimed masterpieces you missed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic AI Curated: Trending Now (Re-inserted) */}
        <section className="py-20 bg-black">
          <div className="max-w-[1250px] mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Happening Now</h2>
                <p className="text-gray-500">AI-Curated Trending from New 2024-2025 Data</p>
              </div>
              <Link href="/dashboard" className="text-primary text-sm font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                View All <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
            {loading ? (
              <div className="text-white">Loading Intelligence...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {(curatedData.trending_now || []).slice(0, 5).map((item, index) => {
                  // Enhanced matching: handle cases like "Bear the Bear" -> "The Bear"
                  const trailerMatch = TRAILERS_DATA.find(t => {
                    const t1 = t.title.toLowerCase();
                    const t2 = item.title.toLowerCase();
                    return t1.includes(t2) || t2.includes(t1) ||
                      t1.replace('the ', '').includes(t2.replace('the ', '')) ||
                      t2.replace('the ', '').includes(t1.replace('the ', ''));
                  });
                  const posterUrl = getBackdrop(index, 'trending');

                  return (
                    <TrailerCard
                      key={index}
                      index={`trending-${index}`}
                      title={item.title}
                      platform={item.platforms?.[0] || 'Exclusive'}
                      posterUrl={posterUrl}
                      trailerUrl={trailerMatch ? trailerMatch.trailerUrl : "https://www.youtube.com/embed/dQw4w9WgXcQ"}
                      isPlaying={activeGlobalTrailer?.id === `trending-${index}`}
                      onPlay={(id, embedUrl, withAudio) => handlePlay(`trending-${index}`, item, embedUrl, withAudio)}
                      onStop={() => setActiveGlobalTrailer(null)}
                      year={item.year}
                      aspectRatio="aspect-[2/3]"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="py-24 px-4 md:px-10 lg:px-20 bg-[#1a0c0d]" id="reviews">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <h2 className="text-white text-3xl md:text-4xl font-bold">Community Favorites</h2>
              <p className="text-gray-300 text-lg">Join thousands of cinephiles discovering better cinema.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Review 1 */}
              <div className="flex flex-col gap-6 rounded-2xl bg-background-dark p-6 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCAARermyVE6eXYQRHdwpsLFayefe6vg6nw6M-ByXkOWXcHVD7bv12n-_fbwPCQ3PHBqgTbHxWM3U0DApIlDDKUIgyf8NsNf8cGgbPDLF-PqA2g5Y8cWs_6hLbIg0YtU6XBMfHvuLH4u9S3fwykhqJ86xisuMS3gflXk_jsPlmEEbpieLVjtcLzozmzQ6Nt5YrtmcabLGjdmAXVlHQwSZ5dUh3fFC60tR4czcpL2cAZaqnnJQ3XsrGSAWh98PqKEzWZU2s56D8A3Hk")' }}></div>
                  <div>
                    <p className="text-white text-base font-bold">Elena R.</p>
                    <p className="text-gray-300 text-xs">Film Critic • 2 days ago</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">"Finally, an algorithm that actually gets my taste. I've found three new favorite movies in one week without doom-scrolling for hours."</p>
                <div className="flex items-center gap-6 text-gray-300 text-sm pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span> 124
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_down</span> 2
                  </button>
                </div>
              </div>
              {/* Review 2 */}
              <div className="flex flex-col gap-6 rounded-2xl bg-background-dark p-6 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuClqB2-grnhnFTAv4dfRJqLanTNjWt3IqnGxDEmIb3pQlvEVob8Y18j8L6lHMJKOe1MXGaEjzDUjrCfZCaensRalbgqkHJMkAHiO80c73jWALsimyfI4cMNXqThOrpOJd93x79nFiv7EPd5OUFbDodSwtHq5HmAclcmv7OegWYx6LB1a9Ylq-FqqC81ZdWMcMHZtBfPiHms_Xtr5Sd5LQZ-J9Qbd2svcJP1_K8R_SKBVye_MJBG2Rqw06-NTQxFqSMKEluLiWmdBKU")' }}></div>
                  <div>
                    <p className="text-white text-base font-bold">Marcus T.</p>
                    <p className="text-gray-300 text-xs">Casual Viewer • 1 week ago</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">"The aggregation feature is a lifesaver. No more app hopping between HBO and Netflix. It's all right here in one beautiful interface."</p>
                <div className="flex items-center gap-6 text-gray-300 text-sm pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span> 89
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_down</span> 5
                  </button>
                </div>
              </div>
              {/* Review 3 */}
              <div className="flex flex-col gap-6 rounded-2xl bg-background-dark p-6 border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 border-2 border-primary/20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC0f-hXsI0NElY6Nmemr4xierJeVH5fcCYmNzqA7xL75qx8WwAQHlQuRo8y_9juPbmRI_D3fIU1PHBItxJhKkt9ICD_tQhDpcvrcgWTa418k7abrkobVukow0T5axecQhdKg5l9TLcyouJyWSLToD80cFJvQ0N8o1-9XoWqGB_8sigzecbmpDn_CJXCRWH-meuop28W6V1VRCBjzGEVDJzlY2yVOnSFIhVuYQHIq5xkvCA6MwuWbxhJB1-Exzuo-sL-6DMM61k1wZw")' }}></div>
                  <div>
                    <p className="text-white text-base font-bold">Jia L.</p>
                    <p className="text-gray-300 text-xs">Documentary Fan • 3 weeks ago</p>
                  </div>
                </div>
                <div className="flex text-yellow-500">
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                  <span className="material-symbols-outlined text-[20px] filled">star</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-grow">"CINE NEST found me an obscure 90s thriller I'd never heard of, and it was perfect. The deep cut engine is real."</p>
                <div className="flex items-center gap-6 text-gray-300 text-sm pt-4 border-t border-white/5">
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_up</span> 45
                  </button>
                  <button className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">thumb_down</span> 1
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic AI Curated: Top Rated Classics (Re-inserted) */}
        <section className="py-24 bg-background-dark">
          <div className="max-w-[1250px] mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-200">Hall of Fame</h2>
                <p className="text-gray-500 text-sm">Top Rated Content from All Platforms</p>
              </div>
            </div>
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {(curatedData.top_rated || []).slice(0, 6).map((item, index) => {
                  const trailerMatch = TRAILERS_DATA.find(t =>
                    t.title.toLowerCase().includes(item.title.toLowerCase()) ||
                    item.title.toLowerCase().includes(t.title.toLowerCase())
                  );
                  const posterUrl = getBackdrop(index, 'top_rated');

                  return (
                    <TrailerCard
                      key={`top-${index}`}
                      index={`top-${index}`}
                      title={item.title}
                      platform={item.platforms?.[0] || 'Top Rated'}
                      posterUrl={posterUrl}
                      trailerUrl={trailerMatch ? trailerMatch.trailerUrl : "https://www.youtube.com/watch?v=SKOIpVLXM7Q"}
                      isPlaying={activeGlobalTrailer?.id === `top-${index}`}
                      onPlay={(id, embedUrl, withAudio) => handlePlay(`top-${index}`, item, embedUrl, withAudio)}
                      onStop={() => setActiveGlobalTrailer(null)}
                      year={item.year}
                      aspectRatio="aspect-[2/3]"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 md:px-10 lg:px-20 bg-background-dark relative overflow-hidden flex justify-center">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDdlrsMIqT556CngPXUI0TaUM-u_livCdZ-aBA0zybt4ExDVTM_hPbOsm5qlD5w2o55q-R_K14OKvMPIVeMHqg6uf7cesK7iteZWar6hM8CUAQjJyE19jI_EhK1_VWUUYOH0bX4Eg8thaXYg6TAqIZfB3u9F3-no89xR9yzfi6vpC4p9DNwJx3H7vd9F3vZOdhRfU85DEe6DfE17Kfzx2F0sC6Ko9-uJaKKz_7v6OoZAHRue1hrEodbJcYkPY_Y9_C4UtlicF2QfnI")' }}>
          </div>
          <div className="relative z-20 max-w-4xl text-center flex flex-col items-center gap-8">
            <h2 className="text-white text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              Ready for your next obsession?
            </h2>
            <p className="text-gray-300 text-lg md:text-xl font-normal leading-relaxed max-w-2xl">
              Join thousands of users discovering cinema in a whole new way. Start your free 14-day trial of CINE NEST today.
            </p>
            <div className="w-full flex justify-center pt-4">
              <Link href="/auth">
                <button className="flex cursor-pointer items-center justify-center rounded-lg h-14 px-10 bg-primary hover:bg-red-700 transition-all transform hover:scale-105 text-white text-lg font-bold tracking-wide shadow-2xl shadow-primary/40">
                  <span className="truncate">Join Now</span>
                </button>
              </Link>
            </div>
            <p className="text-text-secondary text-sm mt-4">No credit card required for trial.</p>
          </div>
        </section>



        <style jsx global>{`
            .material-symbols-outlined.filled {
                font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
        `}</style>
        <Footer />

        {/* Global Trailer Popup */}
        <AnimatePresence>
          {activeGlobalTrailer && activeGlobalTrailer.withAudio && (
            <TrailerModal
              trailerUrl={activeGlobalTrailer.trailerUrl}
              title={activeGlobalTrailer.title}
              withAudio={activeGlobalTrailer.withAudio}
              onClose={() => setActiveGlobalTrailer(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
