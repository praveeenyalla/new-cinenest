import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config/api';
import TrailerModal from '../components/TrailerModal';
import { TRAILERS_DATA } from '../components/TrailersGrid';

export default function AICommandCenter() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // Default/Loading state
  const [username, setUsername] = useState('Commander');
  const [history, setHistory] = useState([]);
  const [activeTrailer, setActiveTrailer] = useState(null);
  const chatEndRef = useRef(null);

  const handlePlayMovie = (movie) => {
    // 1. Try to find a hardcoded trailer first
    const match = TRAILERS_DATA.find(t =>
      t.title.toLowerCase().includes(movie.title.toLowerCase()) ||
      movie.title.toLowerCase().includes(t.title.toLowerCase())
    );

    let url = match ? match.trailerUrl : "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Default fallback

    // Ensure embed format
    if (url.includes('watch?v=')) {
      url = url.replace('watch?v=', 'embed/');
    }

    setActiveTrailer({
      title: movie.title,
      trailerUrl: url
    });
  };

  // --- 1. Initialization & History ---
  useEffect(() => {
    // Client-side only logic for localStorage
    const storedEmail = localStorage.getItem('userEmail') || 'guest@ott.com';
    const storedUser = localStorage.getItem('username') || 'Commander';
    setUserEmail(storedEmail);
    setUsername(storedUser.split('@')[0]); // Simple username extraction
    fetchHistory(storedEmail);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async (email) => {
    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
      if (!token) return;

      const res = await fetch(`${API_URL}/ai/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  // --- 2. Chat Logic ---
  const sendMessage = async (msgText = '', category = 'general') => {
    const text = msgText || input;
    if (!text) return;

    // UI Updates
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');

      // Determine if it's a search query or general chat
      const isSearchQuery = /movie|show|film|recommend|best|top|high rated|202[0-9]/i.test(text);

      let response;
      if (isSearchQuery) {
        response = await fetch(`${API_URL}/ai/search?q=${encodeURIComponent(text)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        response = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ user_email: userEmail, message: text, category }),
        });
      }

      if (response.status === 401) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Authentication failed. Please login to use Brain Engine.' }]);
        return;
      }

      const data = await response.json();

      const aiMsg = {
        role: 'ai',
        text: data.response || data.text || (isSearchQuery ? `I found ${data.results?.length || 0} matches for your request:` : "I've analyzed your request."),
        results: data.results || null,
        chartData: data.chartData,
        chartType: data.chartType
      };
      setMessages(prev => [...prev, aiMsg]);

      // Refresh history slightly delayed to show the new convo
      setTimeout(() => fetchHistory(userEmail), 1000);

    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'System Error: Connection to Brain Engine lost. Please retry.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    let prompt = "";
    switch (action) {
      case 'surprise': prompt = "Surprise me with a hidden gem movie recommendation that has high ratings but low popularity."; break;
      case 'explain': prompt = "Explain why you recommended the last movie purely based on cinematography and tone."; break;
      case '2025': prompt = "What are the best movies releasing in 2025?"; break;
      case 'netflix': prompt = "Search for top rated movies on Netflix for 2026."; break;
      default: return;
    }
    sendMessage(prompt);
  };

  // --- 3. Render Helpers ---
  // A simple function to determine if a message likely contains a movie recommendation to show a "Card" style
  // For now, we'll stick to text, but style it nicely.

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-display overflow-hidden selection:bg-primary selection:text-white">
      <Head>
        <title>CINE NEST - AI Command Center</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* --- SIDEBAR --- */}
      <aside className="w-64 h-full hidden lg:flex flex-col border-r border-[#222] bg-surface-dark/95 backdrop-blur-md z-20">
        <div className="p-6 flex items-center gap-3">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="size-8 rounded-full bg-gradient-to-br from-primary to-black flex items-center justify-center shadow-[0_0_15px_rgba(230,10,21,0.5)] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-white text-[20px]">movie_filter</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-black tracking-widest leading-none group-hover:text-primary transition-colors drop-shadow-lg">CINE NEST</h1>
                <p className="text-gray-500 text-xs font-medium tracking-wide">BRAIN ENGINE v2.4</p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">home</span>
            <span className="text-sm font-medium">Home Base</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-[0_0_10px_rgba(230,10,21,0.1)] cursor-default">
            <span className="material-symbols-outlined fill-current">smart_toy</span>
            <span className="text-sm font-bold">Command Center</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors group">
            <span className="material-symbols-outlined group-hover:text-primary transition-colors">analytics</span>
            <span className="text-sm font-medium">Analytics HUB</span>
          </Link>

          <div className="mt-8 px-4 overflow-y-auto max-h-[40vh] custom-scrollbar">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Recent Sessions</p>
            <div className="flex flex-col gap-3">
              {history.slice(0, 10).map((h, i) => (
                <button key={i} onClick={() => setInput(h.query)} className="text-left text-sm text-gray-400 hover:text-white truncate transition-colors w-full">
                  {h.query}
                </button>
              ))}
              {history.length === 0 && <span className="text-xs text-gray-700 italic">No recent history</span>}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-[#222]">
          <div className="mt-4 flex items-center gap-3 px-4">
            <div className="size-8 rounded-full bg-cover bg-center border border-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAmsuzPFWEcNkjMp3XVWjRP4x83Vw2HHm2AFsZuyhDpro-QN9mFhZTtMQDDzhp-3Ks-dtALFgkb1H9s9s_ykIqUU4GWHjG97rm82dwcdW57anTnHcoFCckz3tzrj39_EK273ZqHa6jEYY5b2Gx6EeNyqxaoHnpxns1UOtXFYXGuWORZbqGGggbM582rjdcD_dbfcNRA88wXastmbXwUSVPwZ8rSJC9YAtm2aVtYa3Kot0lS3RaWeSZs2TiI5PlUXIuBFObX0jGgoWE')" }}></div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{username}</span>
              <span className="text-xs text-primary">Pro Plan Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a1a1a] via-background-dark to-background-dark">
        {/* HEADER */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-background-dark/50 backdrop-blur-sm z-10 grid-cols-3">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-white text-xl font-bold tracking-tight">AI COMMAND CENTER</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] animate-pulse"></span>
                <p className="text-gray-500 text-xs font-mono uppercase">Brain Engine Online • Latency 12ms</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button title="Notifications" className="size-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
          </div>
        </header>

        {/* CHAT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 scroll-smooth relative" id="chat-container">
          {/* Ambient Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

          {/* Date Divider */}
          <div className="flex justify-center my-4 z-10 opacity-60">
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-500 text-xs font-mono border border-white/5">TODAY</span>
          </div>

          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-6 z-10 animate-[fadeIn_1s_ease-out]">
              <div className="relative size-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-primary/40 to-transparent blur-xl animate-pulse"></div>
                <div className="relative z-10 size-24 rounded-full bg-gradient-to-br from-[#2a1a1b] to-black border border-primary/50 shadow-[0_0_30px_rgba(230,10,21,0.4)] flex items-center justify-center overflow-hidden">
                  <span className="material-symbols-outlined text-primary text-4xl animate-pulse">neurology</span>
                </div>
              </div>
              <div className="text-center max-w-lg">
                <h3 className="text-white text-2xl font-bold mb-2">Systems Online</h3>
                <p className="text-gray-400 text-sm">I am ready to curate your cinematic experience. My protocols are initialized for deep analysis of plot structures, tonal matches, and director styles.</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} z-10 w-full`}>
              {m.role === 'ai' && (
                <div className="mr-3 mt-2 size-10 rounded-full bg-gradient-to-br from-primary/20 to-black border border-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(230,10,21,0.2)]">
                  <span className="material-symbols-outlined text-primary text-sm">neurology</span>
                </div>
              )}

              <div className={`${m.role === 'user' ? 'max-w-[80%] md:max-w-[60%]' : (m.results ? 'max-w-full' : 'max-w-[90%] md:max-w-[75%]')} flex flex-col gap-2`}>
                <div className={`
                            ${m.role === 'user' ? 'bg-[#222] rounded-2xl rounded-tr-sm border-white/10' : 'bg-surface-dark rounded-2xl rounded-tl-sm border-white/5'}
                            border text-white px-6 py-4 shadow-lg backdrop-blur-md
                        `}>
                  <p className="text-base font-light leading-relaxed whitespace-pre-wrap">{m.text}</p>
                </div>

                {/* AI Movie Recommendations Cards */}
                {m.results && m.results.length > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar mt-2 max-w-full">
                    {m.results.map((movie, idx) => (
                      <div
                        key={idx}
                        onClick={() => handlePlayMovie(movie)}
                        className="min-w-[220px] w-[220px] bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden group/card hover:border-primary/50 transition-all shadow-2xl cursor-pointer"
                      >
                        <div className="aspect-[2/3] relative bg-[#222] flex items-center justify-center overflow-hidden">
                          {movie.image ? (
                            <img src={movie.image} alt={movie.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <span className="material-symbols-outlined text-4xl text-gray-700">movie</span>
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">No Poster</span>
                            </div>
                          )}

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10">
                            <div className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)] transform scale-75 group-hover/card:scale-100 transition-transform duration-500">
                              <span className="material-symbols-outlined text-3xl filled">play_arrow</span>
                            </div>
                          </div>

                          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-20">
                            <div className="bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg flex items-center gap-1 backdrop-blur-sm">
                              <span className="material-symbols-outlined text-[10px] filled">star</span>
                              {movie.imdb}
                            </div>
                            {movie.is_realtime && (
                              <div className="bg-green-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-tighter backdrop-blur-sm animate-pulse">
                                Live
                              </div>
                            )}
                          </div>

                          {/* Decorative overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        </div>
                        <div className="p-3">
                          <h4 className="text-white text-sm font-bold truncate group-hover/card:text-primary transition-colors">{movie.title}</h4>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-gray-500">{movie.year}</span>
                            <div className="flex gap-1">
                              {movie.platforms && movie.platforms.slice(0, 2).map((p, pidx) => (
                                <span key={pidx} className={`text-[8px] font-bold px-1 rounded ${p === 'Netflix' ? 'bg-red-600' : p === 'Disney+' ? 'bg-blue-600' : 'bg-green-600'} text-white`}>{p}</span>
                              ))}
                            </div>
                          </div>
                          {movie.description && (
                            <p className="text-[9px] text-gray-400 mt-2 line-clamp-2 leading-tight italic">"{movie.description}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* If chart data exists, one could render it here */}
                {m.chartData && (
                  <div className="mt-2 text-xs text-primary font-mono">* Visual data available in Analytics Hub</div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="ml-3 mt-auto size-8 rounded-full bg-gray-700 bg-cover border border-gray-600 shrink-0"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCdENsN6kv5IGA86T3HbISHDpVe7qYNiyUcziGdQY0wm8ncJ_uJ_hjmLf7dv6xdh7EbwcD4RrYMxr7VUr1d6rX23xD5D28RrUbTtduCqQDhZn4xedMoTQqf-ojjAr0ZNxRQSGlapPWzHx7v49Jx5ObN9RvpfdqMRnXaGsFVYvK3ff4eE48iZ0jenNmUC-h4i-5VRARqr_M9nziwvmi7HzLyS1F0InO0bEnpIh6VYHtP86zy1shPbUifzE_YbyjK3zGREhc56Hv9BIU')" }}>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start z-10 w-full">
              <div className="mr-3 mt-2 size-10 rounded-full bg-gradient-to-br from-primary/20 to-black border border-primary/30 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-sm animate-spin">neurology</span>
              </div>
              <div className="bg-surface-dark border border-white/5 text-gray-200 rounded-2xl rounded-tl-sm px-6 py-4 shadow-lg">
                <p className="text-sm text-primary font-mono uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Processing...
                </p>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
          <div className="h-40"></div> {/* Enhanced Spacer */}
        </div>

        {/* INPUT AREA */}
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 z-30 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
          <div className="max-w-4xl mx-auto flex flex-col gap-3">
            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-linear-fade">
              <button onClick={() => handleQuickAction('surprise')} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all flex items-center gap-2 group hover:text-white">
                <span className="material-symbols-outlined text-[14px] text-primary group-hover:scale-110 transition-transform">bolt</span>
                Surprise me
              </button>
              <button onClick={() => handleQuickAction('2025')} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all hover:text-white">
                Best of 2025
              </button>
              <button onClick={() => handleQuickAction('netflix')} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all hover:text-white">
                Netflix 2026
              </button>
              <button onClick={() => handleQuickAction('explain')} className="whitespace-nowrap px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 transition-all hover:text-white">
                Explain logic
              </button>
            </div>

            {/* Input Input */}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-[#151515] border border-white/10 rounded-xl shadow-2xl p-2 transition-colors focus-within:border-primary/50 focus-within:bg-[#1a1a1a]">
                <button type="button" className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <input
                  className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:ring-0 text-sm font-light px-3 py-2"
                  placeholder="Ask Brain Engine for movies, analysis, or insights..."
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex items-center gap-1 pr-1">
                  <button type="submit" disabled={loading} className="p-2 bg-primary hover:bg-red-600 text-white rounded-lg transition-all shadow-[0_0_10px_rgba(230,10,21,0.4)] flex items-center justify-center disabled:opacity-50">
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  </button>
                </div>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-600 font-mono mt-1">AI Recommendation Engine v2.0 • Data verified by CINE NEST Protocols</p>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {activeTrailer && (
          <TrailerModal
            trailerUrl={activeTrailer.trailerUrl}
            title={activeTrailer.title}
            onClose={() => setActiveTrailer(null)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-linear-fade { mask-image: linear-gradient(to right, black 85%, transparent 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #e60a15; }
      `}</style>
    </div>
  );
}
