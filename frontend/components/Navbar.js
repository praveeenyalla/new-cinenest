import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('username') || localStorage.getItem('userEmail');
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedUser ? storedUser.split('@')[0] : 'User');
    }
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    window.location.href = '/';
  };

  // Check if we are in admin section to avoid showing user nav
  const isAdminPage = router.pathname.startsWith('/admin');
  if (isAdminPage) return null;

  return (
    <header className="fixed top-0 left-0 w-full z-50 glass-nav transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined text-4xl">movie_filter</span>
            </div>
            <h1 className="text-2xl font-black tracking-widest uppercase text-white drop-shadow-lg">CINE NEST</h1>
          </div>
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-white hover:text-primary transition-colors">Home</Link>
            <Link href="/ai" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">AI Curated</Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Analytics</Link>
            <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">About</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Contact</Link>
            {/* <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">My List</Link> */}
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
                <div className="flex items-center gap-3">
                  <span className="hidden sm:block text-sm font-bold text-gray-300">Hi, {username}</span>
                  <div
                    className="size-10 rounded-full bg-surface-highlight border border-white/10 overflow-hidden bg-center bg-cover cursor-pointer hover:border-primary transition-all"
                    style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIJhsYNmNCTBCo3NNv9a8bn6tKxMP2V029SbUT-D01fwxh4LWyPsmZuVPw-nYI-D3W9ALBVHDOGq4-vX9Dl57aww4GGx7juhMm84yxeAyO9S34o9mEmcKCGPZ5QRKaXkA27y4lmda-uT4xoNSlMDXAthcM6WiS8zH2tXKmaQtwz8EMsz4gAKjdoffDXRuxeXa6mYtaMqmuMAssQDkQJbh-AMSJ6zlb6F3tb37GTMtDxFPMVHBKbJr6uzPgnVv14t3wM8qnUxAwHP8')" }}
                    onClick={handleLogout}
                    title="Click to Logout"
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
