import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { API_URL } from "../config/api";
import UserAnalytics from "../components/UserAnalytics";
import TrendingMovies from "../components/TrendingMovies";


export default function Dashboard() {
  const [platformStats, setPlatformStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pResponse = await fetch(`${API_URL}/analytics/platform-count`);
        if (pResponse.ok) {
          const pData = await pResponse.json();
          setPlatformStats(pData.platform_distribution || []);
        }
      } catch (err) {
        console.error("Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to safely get count
  const getCount = (name) => {
    const platform = platformStats.find(p => p._id === name);
    return platform ? platform.count.toLocaleString() : "Loading...";
  };

  const tabs = ["All Platforms", "Netflix", "Prime Video", "Hulu", "Disney+", "User Analysis"];

  // Helper for conditional rendering
  const showPlatform = (p) => activeTab === "All" || activeTab === "All Platforms" || activeTab === p;

  return (
    <Layout>
      <div className="flex-grow w-full px-4 md:px-10 pt-32 pb-12 mx-auto max-w-7xl font-display text-white">
        {/* Headline */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                Live Data
              </span>
              <span className="text-text-muted text-xs">Updated: Just now</span>
            </div>
            <h1 className="text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">PLATFORM INTELLIGENCE HUB</h1>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center rounded-lg bg-surface-dark border border-border-dark p-2 text-white hover:bg-border-dark transition-colors">
              <span className="material-symbols-outlined">download</span>
            </button>
            <button className="flex items-center justify-center rounded-lg bg-surface-dark border border-border-dark p-2 text-white hover:bg-border-dark transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
          </div>
        </div>

        {/* Brain Engine Insight Card */}
        <section className="mb-10">
          <div className="rounded-xl bg-surface-dark border border-border-dark p-1 shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="relative bg-gradient-to-r from-[#1a1213] to-[#271b1c] p-6 md:p-8 rounded-lg flex flex-col md:flex-row gap-8 items-center">
              {/* Decor */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="flex-1 z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-primary animate-pulse">psychology</span>
                  <h3 className="text-primary text-sm font-bold uppercase tracking-widest">Brain Engine Analysis</h3>
                </div>
                <p className="text-white text-lg md:text-xl font-medium leading-relaxed mb-2">
                  Cross-platform engagement indicates a <span className="text-primary font-bold">15% shift</span> towards horror content this weekend. Sci-Fi viewership on Disney+ is spiking due to recent legacy releases.
                </p>
                <p className="text-text-muted text-sm">
                  Confidence Score: 98.4% • Based on 45M interactions
                </p>
              </div>
              <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto z-10">
                <button
                  onClick={() => setActiveTab("User Analysis")}
                  className="group flex cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-[0_0_15px_rgba(230,10,21,0.3)]"
                >
                  <span>View Detailed Report</span>
                  <span className="material-symbols-outlined ml-2 text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <button className="flex cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-transparent border border-border-dark hover:border-text-muted transition-colors text-text-muted hover:text-white text-sm font-medium">
                  Dismiss Insight
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="mb-8 border-b border-border-dark overflow-x-auto">
          <div className="flex gap-8 px-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex flex-col items-center justify-center pb-4 pt-2 font-medium text-sm tracking-wide transition-colors group ${activeTab === tab
                  ? "text-primary font-bold"
                  : "text-text-muted hover:text-white"
                  }`}
              >
                {tab}
                {activeTab === tab ? (
                  <span className="absolute bottom-0 h-0.5 w-full bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(230,10,21,0.5)]"></span>
                ) : (
                  <span className="absolute bottom-0 h-0.5 w-full bg-transparent group-hover:bg-white/20 rounded-t-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Netflix Card (Expanded with Charts) */}
          {showPlatform("Netflix") && (
            <div className="lg:col-span-2 bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden group hover:border-primary/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-black flex items-center justify-center text-[#E50914] font-bold text-lg tracking-tighter">N</div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Netflix Content Analytics</h2>
                    <p className="text-xs text-text-muted">Global Performance & Genre Trends</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-background-dark p-1 rounded-lg border border-border-dark shadow-sm">
                  <button className="px-3 py-1.5 rounded text-xs font-bold bg-primary text-white shadow-[0_0_10px_rgba(230,10,21,0.2)]">24H</button>
                  <button className="px-3 py-1.5 rounded text-xs font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors">7D</button>
                  <button className="px-3 py-1.5 rounded text-xs font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors">30D</button>
                  <div className="w-px h-4 bg-border-dark mx-1"></div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-text-muted hover:text-white hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">tune</span> Filter
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10">
                {/* Main Chart Area */}
                <div className="lg:col-span-2 flex flex-col h-full bg-background-dark/50 border border-border-dark rounded-lg p-5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                      Genre Popularity Trends
                    </h3>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-1.5 text-white font-medium"><span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_4px_#e60a15]"></span> Sci-Fi</div>
                      <div className="flex items-center gap-1.5 text-text-muted"><span className="w-2 h-2 rounded-full bg-white/50"></span> Drama</div>
                      <div className="flex items-center gap-1.5 text-text-muted"><span className="w-2 h-2 rounded-full bg-white/20"></span> Action</div>
                    </div>
                  </div>
                  <div className="relative flex-1 min-h-[260px] w-full group/chart cursor-crosshair">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
                      <defs>
                        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#e60a15" stopOpacity="0.2"></stop>
                          <stop offset="100%" stopColor="#e60a15" stopOpacity="0"></stop>
                        </linearGradient>
                      </defs>
                      <line stroke="white" strokeDasharray="1 1" strokeOpacity="0.05" strokeWidth="0.1" x1="0" x2="100" y1="0" y2="0"></line>
                      <line stroke="white" strokeOpacity="0.05" strokeWidth="0.1" x1="0" x2="100" y1="12.5" y2="12.5"></line>
                      <line stroke="white" strokeOpacity="0.05" strokeWidth="0.1" x1="0" x2="100" y1="25" y2="25"></line>
                      <line stroke="white" strokeOpacity="0.05" strokeWidth="0.1" x1="0" x2="100" y1="37.5" y2="37.5"></line>
                      <line stroke="white" strokeOpacity="0.05" strokeWidth="0.1" x1="0" x2="100" y1="50" y2="50"></line>
                      <path d="M0,42 Q10,40 20,41 T40,38 T60,40 T80,36 T100,38" fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="0.4"></path>
                      <path d="M0,30 Q15,32 30,28 T50,25 T70,30 T85,22 T100,20" fill="none" stroke="white" strokeDasharray="2,1" strokeOpacity="0.5" strokeWidth="0.4"></path>
                      <path d="M0,25 Q15,22 30,15 T50,18 T70,5 T85,10 T100,8 V50 H0 Z" fill="url(#chartFill)"></path>
                      <path className="chart-line-glow" d="M0,25 Q15,22 30,15 T50,18 T70,5 T85,10 T100,8" fill="none" stroke="#e60a15" strokeLinecap="round" strokeWidth="0.6" vectorEffect="non-scaling-stroke"></path>
                      <g className="opacity-0 group-hover/chart:opacity-100 transition-opacity duration-300">
                        <line stroke="white" strokeDasharray="1,0.5" strokeOpacity="0.1" strokeWidth="0.2" x1="70" x2="70" y1="0" y2="50"></line>
                        <circle className="chart-line-glow" cx="70" cy="5" fill="#e60a15" r="1.2" stroke="white" strokeWidth="0.3"></circle>
                      </g>
                    </svg>
                    <div className="absolute top-[5%] left-[68%] bg-surface-dark border border-border-dark p-3 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] pointer-events-none opacity-0 group-hover/chart:opacity-100 transition-all transform translate-y-1 group-hover/chart:translate-y-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Peak Engagement</span>
                        <span className="text-[10px] text-text-muted">20:00 EST</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <p className="text-xl font-bold text-white leading-none">3.2M</p>
                        <span className="text-[10px] text-primary font-bold">+12.4%</span>
                      </div>
                      <p className="text-[10px] text-text-muted mt-1">Sci-Fi Genre Spike</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4 px-1 text-[10px] text-text-muted font-mono tracking-wider">
                    <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span className="text-primary font-bold">20:00</span><span>23:59</span>
                  </div>
                </div>

                {/* Side Widgets */}
                <div className="flex flex-col gap-4">
                  {/* Weekly Activity */}
                  <div className="flex-1 bg-background-dark/50 border border-border-dark rounded-lg p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Weekly Activity</h3>
                      <div className="flex items-center gap-1 text-[10px] text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live
                      </div>
                    </div>
                    <div className="flex-1 w-full flex items-end justify-between gap-1.5 min-h-[100px]">
                      {[
                        { d: 'Mon', h: '40%' }, { d: 'Tue', h: '50%' }, { d: 'Wed', h: '45%' }, { d: 'Thu', h: '60%' }
                      ].map((day, i) => (
                        <div key={i} className="w-full bg-white/5 hover:bg-white/10 transition-colors rounded-sm relative group cursor-pointer" style={{ height: day.h }}>
                          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 rounded">{day.d}</div>
                        </div>
                      ))}
                      <div className="w-full bg-gradient-to-t from-primary/50 to-primary h-[85%] rounded-sm bar-glow relative group cursor-pointer">
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-surface-dark border border-border-dark px-1.5 py-0.5 rounded shadow-lg">Fri</div>
                      </div>
                      <div className="w-full bg-gradient-to-t from-primary/50 to-primary h-[95%] rounded-sm bar-glow relative group cursor-pointer">
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-surface-dark border border-border-dark px-1.5 py-0.5 rounded shadow-lg">Sat</div>
                      </div>
                      <div className="w-full bg-white/10 hover:bg-white/20 transition-colors h-[75%] rounded-sm relative group cursor-pointer">
                        <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black px-1 rounded">Sun</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mt-2 font-mono">
                      <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                    </div>
                  </div>

                  {/* Engagement Score */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-surface-dark to-background-dark border border-border-dark rounded-lg p-5 flex items-center justify-between group hover:border-primary/30 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-xl rounded-full -mr-4 -mt-4"></div>
                    <div>
                      <p className="text-xs text-text-muted uppercase font-bold tracking-wider mb-1">Engagement Score</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-white">9.4</p>
                        <span className="text-xs text-text-muted">/ 10</span>
                      </div>
                      <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">trending_up</span> Top 5% vs Peers
                      </p>
                    </div>
                    <div className="relative size-12 flex items-center justify-center">
                      <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                        <path className="text-primary drop-shadow-[0_0_3px_rgba(230,10,21,0.5)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="94, 100" strokeWidth="3"></path>
                      </svg>
                      <span className="material-symbols-outlined absolute text-primary text-xl">bolt</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Content Row */}
              <div className="z-10 pt-4 border-t border-white/5">
                <p className="text-text-muted text-xs uppercase tracking-wider font-semibold mb-3">Trending Now</p>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  <div className="relative min-w-[80px] h-[120px] rounded-lg bg-cover bg-center overflow-hidden border border-white/10 group/poster cursor-pointer" data-alt="Poster for Stranger Things showing spooky red atmosphere" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBesmDNiiRNMz_5Fj5YfViDUHcETdltK0jneXc1kbdUY8CBPJSYZFWnKeDkXn4pVYGaAS5unzkN8QlIuadJ0DCOtOBR9EohEGLCH256iNdXW12T1ZmX1eL6pgnQpULJwmow9JhL97pMFAU8h5ebCThWkws2Aoi1qkjEMID-aU1t7giY43fb56oLwOqarW9kERfm_29sqLQg_wIgsPBQgfmGf4CvLheqBQWB3nieOgkIo3PyJy9kmXLWLLc953skpmFBPyzpaRgvkLE")' }}>
                    <div className="absolute top-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 rounded">#1</div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold">98% Match</span>
                    </div>
                  </div>
                  <div className="relative min-w-[80px] h-[120px] rounded-lg bg-cover bg-center overflow-hidden border border-white/10 group/poster cursor-pointer" data-alt="Poster for Wednesday TV show showing gothic style" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCzarkLbvICgWLSjcCz7k3iMNxTHdFdd6OedSm0biqVH2wyu_Qwktso08A1_jB14_uikKgUI70y6DG3E9REtjBprujOedG4vZap2S_cQGZFRnNXjEbRbloACz4DjH-aoB0gf_JRnY5kvTEa0t-NPboT9-QqSclSwQBFeVwLKQ_FvRv5KNoOM83f3PM1YiUS1eLN4Ni3uL9IUFnTGcA6EyRVi28-4s6bbdGZB5vyHog2FR7FTuNd-pJPff9v1v1PR9KdjlvujH5okFo")' }}>
                    <div className="absolute top-1 left-1 bg-surface-dark/90 text-white text-[10px] font-bold px-1.5 rounded">#2</div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold">92% Match</span>
                    </div>
                  </div>
                  <div className="relative min-w-[80px] h-[120px] rounded-lg bg-cover bg-center overflow-hidden border border-white/10 group/poster cursor-pointer" data-alt="Poster for The Crown showing royal imagery" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrcX1BRcv3P-zFBapTv_kK3FENbfIcv3kVswTSqRAJ9epqjRcBVGenEabaInqc1YXQetW4-7ujOF-K1wfhY_L5N_3uL5dzje6sfRQ2JcrZL3OmyG-hxdCGVSgNK9NaljlPIfX2UASUUiBuFfWeJ4gIzALAPteK-7IPeSi0YSqHVS-Zkc4dxjNi8MygaA53hEJQJET7iTFNtgaCgTzZgSjTRQQUrqJZI2jUiF8Tn-aIrG4iKDtW_qYpJRVNFWqWaGm1nJlwlzMbrlo")' }}>
                    <div className="absolute top-1 left-1 bg-surface-dark/90 text-white text-[10px] font-bold px-1.5 rounded">#3</div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/poster:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-bold">89% Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prime Video Card */}
          {showPlatform("Prime Video") && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#00A8E1] flex items-center justify-center text-white font-bold text-xs tracking-tighter">prime</div>
                  <h2 className="text-lg font-bold">Prime Video Stats</h2>
                </div>
                <div className="flex items-center gap-1 text-text-muted text-sm font-mono">
                  <span className="material-symbols-outlined text-base">remove</span>
                  0.0%
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8 flex-1 justify-center z-10">
                {/* Donut Chart */}
                <div className="relative size-40 rounded-full flex items-center justify-center" style={{ background: 'conic-gradient(#e60a15 0% 65%, #2a2a2a 65% 100%)' }}>
                  <div className="absolute inset-0 rounded-full blur-sm bg-primary/20"></div>
                  <div className="relative bg-surface-dark size-32 rounded-full flex flex-col items-center justify-center z-20">
                    <span className="text-2xl font-bold text-white">{getCount("Prime Video")}</span>
                    <span className="text-xs text-text-muted uppercase">Items</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary mt-1 shadow-[0_0_8px_#e60a15]"></div>
                    <div>
                      <p className="text-sm font-bold text-white">Feature Films</p>
                      <p className="text-xs text-text-muted">Avg Watch: 1h 42m</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#2a2a2a] mt-1"></div>
                    <div>
                      <p className="text-sm font-bold text-white">TV Series</p>
                      <p className="text-xs text-text-muted">Avg Watch: 45m / ep</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-background-dark rounded-lg border border-border-dark">
                <p className="text-xs text-text-muted">
                  <span className="text-white font-bold">Insight:</span> Action genre movies are seeing a 12% uptick on weekends between 8PM-11PM EST.
                </p>
              </div>
            </div>
          )}

          {/* Disney+ Card */}
          {showPlatform("Disney+") && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#113CCF] flex items-center justify-center text-white font-serif font-bold text-lg tracking-tighter">D+</div>
                  <h2 className="text-lg font-bold">Disney+ Growth</h2>
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-mono">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  +5.1%
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4 z-10">
                <p className="text-text-muted text-xs uppercase tracking-wider font-semibold">Subscriber Growth Pulse</p>
                <div className="flex items-end justify-between h-40 gap-2 md:gap-4 px-2">
                  <div className="w-full bg-white/5 rounded-t hover:bg-primary/50 transition-colors relative group h-[40%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Q1: 1.2M</div>
                  </div>
                  <div className="w-full bg-white/5 rounded-t hover:bg-primary/50 transition-colors relative group h-[55%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Q2: 1.8M</div>
                  </div>
                  <div className="w-full bg-white/5 rounded-t hover:bg-primary/50 transition-colors relative group h-[45%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Q3: 1.4M</div>
                  </div>
                  <div className="w-full bg-primary/80 rounded-t bar-glow relative group h-[85%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Q4: 2.9M</div>
                  </div>
                  <div className="w-full bg-white/5 rounded-t hover:bg-primary/50 transition-colors relative group h-[70%]">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark border border-white/20 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">Q1: 2.1M</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-text-muted px-2">
                  <span>Q1</span><span>Q2</span><span>Q3</span><span className="text-primary font-bold">Q4</span><span>Q1 (Proj)</span>
                </div>
              </div>
            </div>
          )}


          {/* Hulu Card */}
          {showPlatform("Hulu") && (
            <div className="bg-surface-dark border border-border-dark rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-[#1CE783] flex items-center justify-center text-black font-bold text-xs tracking-tighter">hulu</div>
                  <h2 className="text-lg font-bold">Hulu Engagement</h2>
                </div>
                <div className="flex items-center gap-1 text-red-400 text-sm font-mono">
                  <span className="material-symbols-outlined text-base">trending_down</span>
                  -1.2%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 flex-1 z-10">
                <div className="bg-background-dark p-4 rounded-lg border border-border-dark flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-text-muted">Ad-Supported</p>
                    <span className="material-symbols-outlined text-primary text-lg">ads_click</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">42%</p>
                    <p className="text-[10px] text-text-muted mt-1">Share of total views</p>
                  </div>
                </div>
                <div className="bg-background-dark p-4 rounded-lg border border-border-dark flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <p className="text-xs text-text-muted">Live TV</p>
                    <span className="material-symbols-outlined text-text-muted text-lg">live_tv</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">18%</p>
                    <p className="text-[10px] text-text-muted mt-1">Share of total views</p>
                  </div>
                </div>
                <div className="col-span-2 bg-background-dark p-4 rounded-lg border border-border-dark flex items-center justify-between">
                  <div>
                    <p className="text-xs text-text-muted mb-1">Top Genre (This Week)</p>
                    <p className="text-lg font-bold text-white">Adult Animation</p>
                  </div>
                  <div className="h-10 w-24 bg-surface-dark rounded overflow-hidden relative">
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <path d="M0,40 L10,35 L20,38 L30,20 L40,25 L50,10 L60,15 L70,5 L80,20 L96,15" fill="none" stroke="#e60a15" strokeWidth="2"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* User Analysis Section */}
          {activeTab === "User Analysis" && (
            <div className="col-span-1 lg:col-span-2 flex flex-col gap-12">
              <UserAnalytics />
              <div className="pt-12 border-t border-white/5">
                <TrendingMovies isDashboard={true} />
              </div>
            </div>
          )}

        </div>

        <style jsx>{`
          .chart-line-glow { filter: drop-shadow(0 0 4px rgba(230, 10, 21, 0.5)); }
          .bar-glow { box-shadow: 0 0 8px rgba(230, 10, 21, 0.3); }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </Layout>
  );
}
