import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { API_URL } from '../config/api';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [curatedData, setCuratedData] = useState({ trending_now: [], top_rated: [], netflix_new: [] });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('username') || localStorage.getItem('userEmail');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUser || 'User');
    }

    const fetchCurated = async () => {
      try {
        const res = await fetch(`${API_URL}/ai/curated`);
        if (res.ok) {
          const data = await res.json();
          setCuratedData(data);
        }
      } catch (err) {
        console.error("Failed to fetch curated content", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCurated();
  }, []);

  // reliable backdrops for demo
  const backdrops = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuACge5918lWCM_VF6J-qN0KboiWAxJIHifwa6uIbtMrZ6Cr5RmumxGZv-n4vqgprkR0G6u4uMLF8K-mann5ShPykDb28PS89oOWYzmtq19hpJMoT02zUrF7zMj-SH5lQ7N5Yfo_JbLCac7GV1Ok8nUDu01YVV9IvQfyGdA-i_ytM0h-P4mtIhW18T6yZ6bkY3S_EeL9gsBGL43yx01rvg_rlaBzT6uiuJP9XcPryzbr1jGR3P8yqrmC4npIat0P0UMFe3GSuK6gqLM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDsbZDKu32l_pJhTn73wQVeKS7Aum8vLPKPDfgtiNSB7E8S76j81tcBsN-RaDPKZyw37NX4YdCi_LODqAU19T7lsI3qxd6eJG4PZWndWTwbm5ZdOvkjuPuNWT6QSfx6Boa7JLnsOjYVpsKK1wPUC5NMlHDAM2wrnDQbznTQg-drHmoqBw_FJel8LSaxVRi6qoJ7upG1_rOu3YT0ryx10f9RBbcwlyjJMYYiNckfyocf8OC4faMkYKngfSk3YSJei1ILN9jWKJtzd4M",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCOElLHQWIHQJjnA7rban0-GvwSltC78yCRqFQ1u-aatyhYF40-fl-4Kd68giZraF38-XTYc_FzCJOwFS8MITmgbbLIZtHc7oRj92LUmq9jQkaiWUtifpsx7gNAvKgbijTAGpxkwpxwR1uERvFPeyHnI4W0rRcJoOuFP4ZDfWayImj6oxU79UTt5RkyyrG9Wsd7uDwcOeB9-mPpAxcbqVjbcWDX9zLSSs_cXMEjngirJ-amVTH2VjUolQEihMBmymsJqo9YlYVvl9Q",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD2-UKyS86fskUIhJel8zR1CKOcDb_gmECIOVdhxjgY_oHx1NiViyHobXMv1xmujRsAVYFkjXKfoUK5n6xxQ6mzhNU3dqRZTYSKB-P_LHRLzPR8tI4THUL5zikufmY3lijlrnGy5O6AYTBELd-USp7-1safy6s_AxHATrgRi_kkgtiqlbq-J-8_ReV7k8MHdnMRnN62CyvLGe5vuWPy6LDu_On3gsv61x928tr_I-GydjBI2X1qrV6DKptaK_rPZ-HpQLKf19YIb_U",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCqglCDd2tKlQA4-cC9713Qp2zbNvfMoOicEz5x1_vMihDBluAVSQ7skNk12kqMSf7l5t-Ys9n3fid9BIOO84TfW2XRKjJr1b8qAhD_pZE7tXkM6iI86ns3A2noItZuw09W1ojduyXurLu-RHlbzMVyrJOPUCM1Lsq4hwtfMurCUikd43Xz2LR9t_-5Mexdj9q-jsoH7YFqQ6Ka37T3LBJXptAgTm6-c_9kPxDVckcajKpgJTov1ILNfPzawIzh9wpRlsDM91_9kII",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAcKdHtjWP6lVycv9m75zrseoWdh1teUjZrz6SPE2Focxt3XSa5KZkek0Smv0Y6TBNz2s8U0LvMnI6PCpxv9zRTfXMC6i7MqpK9Q77bI4XBDe0mtPbWWYAXPoI3xrBxbj94KArzDhttIEXdPY9kkyIukV7hbUYsKUTMBz-HbO8xRdmXn51C6oubeIcFfAMsJ8m3lFI-A4ouqkZaN0mD1MzAA-bSS1urOeHsq1-D6WCnQd3plAb4j-RkXH1g7t-KYvE0QCIOr_9yZzI",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB8K36rCQfLGj828ZEJfTcoiYpIuX1bhxPWnzgJltPmiyGRmdcc2AVGv88tRF8HXNR82-76bkKMYLFaer4EVnvrrtVW1p4-voAH8t_mmdL7UZmFU4VtqagTeJwPQdPlkloHq3H2kN6kgmrCRpYRNZKpOE-fbxXDFN1BDEf_7mfYGA4RFHIFpDkfyMBkKYPfgFwYWvp7awx5g0c0Fashh1c-H8vAYenr2J1UDnRZ5tvVnMrsTDaSQILWQD3A95KJLE9y0IFI6SnKlWM",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBpS99wTSGUaa0MZLOoU_nVWNHi3TZLYaUwf1Hp-9GA983psQUupf3ZJ9dZzklwtlWH1BMNoAmex962KbnRxtGZsECyAlj_uRP5kU_0UWjjdC55WVQOc_yy_x_PrY2tBZ3JM4Nme6354rb8eYjAoGMJ0hmqRASXy54edKhus-BE_VvEnxHstA6lbnokiYknozDoiWqO5mG2zvO3RQWfjyqcgzz2OAF_vSdnCmYEf5KmKHRKF6nL4foKszTQj-CF84C2Jimm43YDKz8"
  ];

  const getRandomBackdrop = (index) => backdrops[index % backdrops.length];

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


      <div className="bg-background-dark text-white font-display overflow-x-hidden selection:bg-primary selection:text-white min-h-screen">
        <header className="fixed top-0 left-0 w-full z-50 glass-nav transition-all duration-300">
          <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="size-8 text-primary">
                  <span className="material-symbols-outlined text-4xl">movie_filter</span>
                </div>
                <h1 className="text-xl font-bold tracking-widest uppercase">CINE NEST</h1>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-medium text-white hover:text-primary transition-colors">Home</Link>
              <Link href="/ai" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">AI Curated</Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Trending</Link>
              <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contact</Link>
            </nav>
            <div className="flex items-center gap-6">
              <button className="text-white hover:text-primary transition-colors">
                <span className="material-symbols-outlined">search</span>
              </button>
              <div className="flex items-center gap-3">
                {!isLoggedIn ? (
                  <Link href="/auth">
                    <button className="hidden sm:block bg-primary/10 border border-primary/50 hover:bg-primary hover:border-primary text-primary hover:text-white px-5 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300">
                      Sign In
                    </button>
                  </Link>
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
                      <div className="absolute right-0 top-full mt-2 w-48 bg-surface-dark border border-white/10 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-4 py-2 border-b border-white/5 mb-1">
                          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Account</p>
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
              </div>
            </div>
          </div>
        </header>

        <section className="relative min-h-screen w-full flex flex-col justify-center items-center pt-20">
          <div className="absolute inset-0 w-full h-full z-0">
            <div className="absolute inset-0 bg-hero-gradient z-10"></div>
            <div className="w-full h-full bg-cover bg-center bg-no-repeat opacity-60" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDODrLIgF8gKT2EKjF7KPVcAGHEttbndBfavENw9VnzisKE9yaUt4lg1Y6AiAOcYUTIhte25bG1uc6zEwrGrstI1sC3ajjkXGMoQZMyNzgKXkvtodLi51RmXj3u87CShcHjv-jsF6c2Iw0NqKxIvidQCRWXjEJOF7b3YaKL62ITYHfNIAnX3HSWgnW-jvxdRdWdv27hjg2M1jQ5zsfIWXJhy_rLAQyej5KX6eIoH85HZt9s60iw5NzaqF9YYyQjm3IZLEz_z4w8rDk')" }}></div>
          </div>
          <div className="relative z-20 container mx-auto px-6 max-w-5xl text-center flex flex-col items-center gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
              <span className="material-symbols-outlined text-primary text-sm">auto_awesome</span>
              <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">AI Version 2.0 Live</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tighter">
              CINEMA INTELLIGENCE.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">CURATED FOR YOU.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
              The first AI-powered engine that analyzes scripts, cinematography, and emotional beats to understand your taste better than you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
              <Link href="/ai">
                <button className="h-14 px-8 rounded-lg bg-primary text-white font-bold text-lg tracking-wide hover:bg-red-700 transition-colors shadow-[0_0_20px_rgba(230,10,21,0.3)] hover:shadow-[0_0_30px_rgba(230,10,21,0.6)] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">bolt</span>
                  Activate Brain Engine
                </button>
              </Link>
              <Link href="/auth">
                <button className="h-14 px-8 rounded-lg bg-white/5 text-white border border-white/10 font-bold text-lg tracking-wide hover:bg-white/10 transition-colors backdrop-blur-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo
                </button>
              </Link>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-gray-500">
            <span className="material-symbols-outlined text-3xl">keyboard_arrow_down</span>
          </div>
        </section>

        <section className="w-full bg-background-dark py-12 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <h3 className="text-xl font-bold text-gray-400">Sync Your Services</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/recommend?platform=Netflix">
                  <div className="group flex h-12 items-center gap-3 rounded-full bg-surface-dark border border-white/10 px-6 cursor-pointer hover:border-[#E50914] hover:shadow-[0_0_15px_rgba(229,9,20,0.2)] transition-all">
                    <img alt="Netflix Logo" className="h-6 w-6 object-contain filter grayscale group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4U4rtIqHI0oOCly42HdWFuV5g_KsUR8C_0K2ICA62zBByRkpPXfa8HpBkrlr5mFgla5Jetfu1RJEwvR7jNoKdMaAGPhzRAxmZ9qLj0B1BX5rVOhDz0Mp45kRhymE29zenH6_3Wn-SBW7WydMYAyIT-83a4-Je32mfUfBzE_EzYB78h6MUiQcS0RrjhROm_RdSX2bOcJvf2v-v-eoPbTKXkVWJJeMVbyqhxU-MEEqRH8PB0z79tBLJc24Sqd7IPKb3DqTEjFOLmrI" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Netflix</span>
                  </div>
                </Link>
                <Link href="/recommend?platform=Hulu">
                  <div className="group flex h-12 items-center gap-3 rounded-full bg-surface-dark border border-white/10 px-6 cursor-pointer hover:border-[#1CE783] hover:shadow-[0_0_15px_rgba(28,231,131,0.2)] transition-all">
                    <div className="h-6 w-6 bg-[#1CE783] rounded-sm flex items-center justify-center text-black font-black text-xs filter grayscale group-hover:grayscale-0 transition-all">H</div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Hulu</span>
                  </div>
                </Link>
                <Link href="/recommend?platform=Disney+">
                  <div className="group flex h-12 items-center gap-3 rounded-full bg-surface-dark border border-white/10 px-6 cursor-pointer hover:border-[#113CCF] hover:shadow-[0_0_15px_rgba(17,60,207,0.2)] transition-all">
                    <div className="h-6 w-6 bg-[#113CCF] rounded-full flex items-center justify-center text-white font-serif text-xs filter grayscale group-hover:grayscale-0 transition-all">D+</div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Disney+</span>
                  </div>
                </Link>
                <Link href="/recommend?platform=Prime Video">
                  <div className="group flex h-12 items-center gap-3 rounded-full bg-surface-dark border border-white/10 px-6 cursor-pointer hover:border-[#00A8E1] hover:shadow-[0_0_15px_rgba(0,168,225,0.2)] transition-all">
                    <span className="material-symbols-outlined text-[#00A8E1] filter grayscale group-hover:grayscale-0 transition-all">shopping_cart</span>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Prime</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-background-dark relative overflow-hidden">
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] orb-glow pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h2 className="text-primary font-bold tracking-widest uppercase text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    AI Command Center
                  </h2>
                  <h3 className="text-4xl md:text-5xl font-bold leading-tight">
                    Conversational Intelligence.<br />
                    <span className="text-white border-b-4 border-primary pb-1">Ask anything.</span>
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                    Interact directly with the Brain Engine. Ask for recommendations based on abstract concepts, specific directors, or even your current emotional state.
                  </p>
                </div>
                <div className="grid gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="p-3 rounded-lg bg-black text-primary">
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Deep Context Analysis</h4>
                      <p className="text-sm text-gray-500">Scans beyond genre—analyzing pacing, color palettes, and dialogue density.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="p-3 rounded-lg bg-black text-primary">
                      <span className="material-symbols-outlined">monitor_heart</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Biometric Mood Matching</h4>
                      <p className="text-sm text-gray-500">Connect your smartwatch to find content based on your heart rate variability.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-colors">
                    <div className="p-3 rounded-lg bg-black text-primary">
                      <span className="material-symbols-outlined">hub</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-1">Cross-Platform Aggregation</h4>
                      <p className="text-sm text-gray-500">One interface for everything. No more app hopping.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative h-[600px] rounded-2xl bg-surface-dark border border-white/10 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <div className="relative z-10 size-64 rounded-full bg-black border border-primary/30 shadow-[0_0_50px_rgba(230,10,21,0.4)] flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full animate-ping bg-primary/20"></div>
                  <div className="size-48 rounded-full bg-gradient-to-br from-gray-900 to-black border border-white/10 flex flex-col items-center justify-center text-center p-4">
                    <span className="material-symbols-outlined text-4xl text-primary mb-2 animate-pulse">grain</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Processing</span>
                    <span className="text-xl font-bold text-white mt-1">98% Match</span>
                  </div>
                </div>
                <div className="absolute top-10 left-10 p-3 bg-black/80 backdrop-blur rounded border border-primary/20 text-xs text-primary font-mono">
                  &gt; GENRE_FLUIDITY: 0.87
                </div>
                <div className="absolute bottom-20 right-10 p-3 bg-black/80 backdrop-blur rounded border border-primary/20 text-xs text-primary font-mono">
                  &gt; PACE_VELOCITY: HIGH
                </div>
                <div className="absolute top-1/2 left-4 p-3 bg-black/80 backdrop-blur rounded border border-primary/20 text-xs text-white font-mono">
                  &gt; ACTOR_WEIGHT: MAX
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic AI Curated: Trending Now */}
        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-6">
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
                {(curatedData.trending_now || []).slice(0, 5).map((item, index) => (
                  <div key={index} className="group relative aspect-[2/3] bg-surface-dark rounded-lg overflow-hidden cursor-pointer transition-transform hover:-translate-y-2 duration-300 border border-white/5 hover:border-primary/50">
                    <div className="absolute top-2 right-2 z-20 bg-primary/90 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">{item.imdb} ★</div>
                    <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${getRandomBackdrop(index)}')` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      <h4 className="text-white font-bold text-lg truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{item.year}</span> • <span>{(item.genres || []).slice(0, 1) || 'Movie'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Dynamic AI Curated: Top Rated Classics */}
        <section className="py-12 bg-surface-dark">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold mb-2 text-gray-200">Hall of Fame</h2>
                <p className="text-gray-500 text-sm">Top Rated Content from All Platforms</p>
              </div>
            </div>
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {(curatedData.top_rated || []).slice(0, 6).map((item, index) => (
                  <div key={index} className="group relative aspect-[2/3] bg-black rounded-lg overflow-hidden cursor-pointer transition-transform hover:-translate-y-2 duration-300 border border-white/5 hover:border-primary/30">
                    <div className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url('${getRandomBackdrop(index + 5)}')` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                        <span>{item.year}</span> • <span>{item.imdb} ★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="bg-surface-dark border-t border-white/5 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-primary">movie_filter</span>
                <span className="font-bold tracking-widest text-lg">CINE NEST</span>
              </div>
              <div className="flex flex-wrap gap-8 justify-center">
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Help Center</Link>
              </div>
              <div className="text-sm text-gray-500">
                © 2024 CINE NEST. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
