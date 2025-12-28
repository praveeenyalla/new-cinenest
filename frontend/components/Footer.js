import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="w-full bg-black border-t border-white/10 pt-16 pb-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-4xl text-primary">smart_display</span>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                CINE<span className="text-primary">NEST</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Experience the future of entertainment with AI-curated content, personalized analytics, and a seamless streaming experience.
                        </p>
                        <div className="flex gap-4">
                            {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                                <a key={social} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all text-gray-400">
                                    <i className={`fa-brands fa-${social}`}></i>
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/movies" className="hover:text-primary transition-colors">Movies</Link></li>
                            <li><Link href="/series" className="hover:text-primary transition-colors">Series</Link></li>
                            <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                        <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest releases.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white w-full focus:outline-none focus:border-primary transition-colors"
                            />
                            <button className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-sm">send</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} CINE NEST. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
