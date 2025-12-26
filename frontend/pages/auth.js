import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(false); // Default to Signup as per UI
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Toggle Mode
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        // Optional: clear form data
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                // --- LOGIN LOGIC ---
                const params = new URLSearchParams();
                // Backend expects 'username' field for OAuth2
                // Use email input as username param
                params.append('username', formData.email);
                params.append('password', formData.password);

                const res = await fetch('http://127.0.0.1:8000/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: params.toString(),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Login failed');

                localStorage.setItem('userToken', data.access_token);
                localStorage.setItem('username', data.username);

                // Admin Redirect Check
                if (data.username === 'admin' || formData.email === 'admin') {
                    router.push('/admin');
                } else {
                    router.push('/');
                }

            } else {
                // --- SIGNUP LOGIC ---
                if (formData.password !== formData.confirm_password) {
                    throw new Error("Passwords do not match");
                }

                const res = await fetch('http://127.0.0.1:8000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.detail || 'Signup failed');

                localStorage.setItem('userToken', data.access_token);
                localStorage.setItem('username', data.username);
                router.push('/');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-[#181111] text-white antialiased selection:bg-[#e60a15] selection:text-white min-h-screen">
            <Head>
                <title>CINE NEST - {isLogin ? 'Sign In' : 'Sign Up'}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <div className="relative min-h-screen w-full flex flex-col overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
                    <div className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDdpQj50Gj5q2aqW7aSjO0HhC5MnUhWZKxj9sAFvCPoAuQqOlCen_1RDw85UKdiaXChXGfFLfHbt0ic5IK804GMuw28d26esVxNtsLP2VoZu5ezrNx2gU1oU_QGgJaOI3nsxVdXJ-MYpyK8HpuDnITkIS09sO-PjyqZHWvTcQSosKbZCe-KlrlJeBJsaiNCGjn5BqoaR785YZjbtP5QyWDVjbYvR99U7d3UNBP6y2hgyaBUcOGr79UJi9751N_nqQ03xvV9QTw3P7Q')" }}></div>
                    <div className="absolute top-0 -left-4 w-96 h-96 bg-[#e60a15]/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-900/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob" style={{ animationDelay: '2000ms' }}></div>
                    <div className="absolute -bottom-32 left-20 w-[30rem] h-[30rem] bg-red-900/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-blob" style={{ animationDelay: '4000ms' }}></div>
                    <div className="absolute bottom-40 right-10 w-64 h-64 bg-[#e60a15]/10 rounded-full mix-blend-screen filter blur-[80px] opacity-30 animate-pulse-slow"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#181111]/95 via-[#181111]/80 to-[#e60a15]/5 backdrop-blur-[1px]"></div>
                </div>

                {/* Header */}
                <header className="relative z-20 flex items-center justify-between px-6 py-5 lg:px-12 w-full max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 text-[#e60a15] animate-pulse-slow">
                            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fillOpacity="0.8" fillRule="evenodd"></path>
                                <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-white text-xl font-bold tracking-tight">CINE NEST</h2>
                    </div>
                    <nav className="hidden md:flex gap-6">
                        <Link href="/" className="text-white/70 hover:text-[#e60a15] transition-colors text-sm font-medium">Home</Link>
                        <Link href="/about" className="text-white/70 hover:text-[#e60a15] transition-colors text-sm font-medium">About</Link>
                    </nav>
                </header>

                {/* Main Content */}
                <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                    <div className="w-full max-w-md space-y-8">
                        <div className="bg-[#271b1c]/60 backdrop-blur-xl border border-[#543b3c] p-8 rounded-2xl shadow-2xl ring-1 ring-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e60a15]/50 to-transparent opacity-50"></div>

                            <div className="text-center mb-8 relative z-10">
                                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                    {isLogin ? 'Welcome Back' : 'Unlock the Future'}
                                </h1>
                                <p className="text-sm text-gray-400">
                                    {isLogin ? 'Sign in to access your dashboard' : 'Join CINE NEST to discover AI-curated entertainment.'}
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">

                                {/* Username Field (Signup Only) */}
                                {!isLogin && (
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-gray-200 mb-2" htmlFor="username">
                                            Username
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">person</span>
                                            </div>
                                            <input
                                                id="username"
                                                name="username"
                                                type="text"
                                                required
                                                className="block w-full rounded-lg border-0 bg-[#271b1c] py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-[#543b3c] placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#e60a15] sm:text-sm sm:leading-6 transition-all duration-200"
                                                placeholder="Choose a username"
                                                value={formData.username}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email / Username Field */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-200 mb-2" htmlFor="email">
                                        {isLogin ? "Email or Username" : "Email address"}
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-gray-500 text-[20px]">mail</span>
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="text"
                                            required
                                            className="block w-full rounded-lg border-0 bg-[#271b1c] py-3 pl-10 pr-3 text-white ring-1 ring-inset ring-[#543b3c] placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#e60a15] sm:text-sm sm:leading-6 transition-all duration-200"
                                            placeholder={isLogin ? "Enter email or username" : "name@example.com"}
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label className="block text-sm font-medium leading-6 text-gray-200 mb-2" htmlFor="password">
                                        Password
                                    </label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="material-symbols-outlined text-gray-500 text-[20px]">lock</span>
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            className="block w-full rounded-lg border-0 bg-[#271b1c] py-3 pl-10 pr-10 text-white ring-1 ring-inset ring-[#543b3c] placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#e60a15] sm:text-sm sm:leading-6 transition-all duration-200"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group">
                                            <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-300 transition-colors text-[20px]">visibility</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password (Signup Only) */}
                                {!isLogin && (
                                    <div>
                                        <label className="block text-sm font-medium leading-6 text-gray-200 mb-2" htmlFor="confirm_password">
                                            Confirm Password
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <span className="material-symbols-outlined text-gray-500 text-[20px]">lock_reset</span>
                                            </div>
                                            <input
                                                id="confirm_password"
                                                name="confirm_password"
                                                type="password"
                                                required
                                                className="block w-full rounded-lg border-0 bg-[#271b1c] py-3 pl-10 pr-10 text-white ring-1 ring-inset ring-[#543b3c] placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[#e60a15] sm:text-sm sm:leading-6 transition-all duration-200"
                                                placeholder="••••••••"
                                                value={formData.confirm_password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!isLogin && (
                                    <div className="flex items-center gap-3">
                                        <input className="h-4 w-4 rounded border-gray-600 bg-[#271b1c] text-[#e60a15] focus:ring-[#e60a15] focus:ring-offset-[#181111]" id="terms" name="terms" type="checkbox" />
                                        <label className="text-xs text-gray-400" htmlFor="terms">
                                            I agree to the <a className="text-[#e60a15] hover:text-red-400 font-semibold" href="#">Terms</a> and <a className="text-[#e60a15] hover:text-red-400 font-semibold" href="#">Privacy Policy</a>.
                                        </label>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex w-full justify-center rounded-lg bg-[#e60a15] px-3 py-3.5 text-sm font-bold leading-6 text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e60a15] transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                </button>
                            </form>

                            <div className="relative mt-8 z-10">
                                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#543b3c]"></div>
                                </div>
                                <div className="relative flex justify-center text-sm font-medium leading-6">
                                    <span className="bg-[#211617] px-4 text-gray-400 rounded-sm">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-4 relative z-10">
                                <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#271b1c] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-[#543b3c] hover:bg-[#342425] transition-colors">
                                    <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
                                        <path d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-4.6667-3.7833-8.45-8.45-8.45-4.6667 0-8.45 3.7833-8.45 8.45 0 4.6667 3.7833 8.45 8.45 8.45Z" fill="#fff" fillOpacity="0.1"></path>
                                        <path d="M20.1004 13.55c-0.125-1.2833-0.4583-2.5-1.025-3.6083l-2.6167 2.6167c0.2333 0.3166 0.425 0.65 0.5833 0.9916h3.0584Z" fill="#FBBC05"></path>
                                        <path d="M11.9999 20.4501c2.1416 0 4.1083-0.8083 5.6166-2.125l-2.6-2.6083c-0.85 0.5833-1.8916 0.9333-3.0166 0.9333-2.3166 0-4.3333-1.5083-5.1166-3.6417l-2.9834 2.3084c1.5584 3.0916 4.775 5.1333 8.1 5.1333Z" fill="#34A853"></path>
                                        <path d="M6.8833 13.0084c-0.1917-0.65-0.3083-1.3334-0.3083-2.0084s0.1166-1.3583 0.3083-2.0083l-2.9833-2.3084c-0.6417 1.2834-1.0083 2.7501-1.0083 4.3167s0.3666 3.0333 1.0083 4.3166l2.9833-2.3082Z" fill="#4285F4"></path>
                                        <path d="M11.9999 7.34168c1.375 0 2.625 0.51667 3.5583 1.35833l2.675-2.675C16.5999 4.41668 14.4333 3.55002 11.9999 3.55002c-3.325 0-6.54163 2.04166-8.09996 5.13332l2.98333 2.30833C7.6666 8.85002 9.68326 7.34168 11.9999 7.34168Z" fill="#EA4335"></path>
                                    </svg>
                                    <span className="text-sm font-semibold leading-6">Google</span>
                                </button>
                                <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[#271b1c] px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-[#543b3c] hover:bg-[#342425] transition-colors">
                                    <svg aria-hidden="true" className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.684.81-1.813 1.586-2.998 1.586-.062 0-.125-.01-.187-.01-.225-1.12.38-2.316 1.054-3.13C13.731 2.15 15.114 1.397 16.365 1.43zm4.176 15.36c-.023.086-.046.17-.07.254-.813 3.235-2.73 6.64-4.896 6.947-1.928 2.366-4.085 2.502-5.462 2.502-1.376 0-3.535-.136-5.46-2.502-2.167-.307-4.084-3.712-4.896-6.946-.024-.085-.047-.17-.07-.255-2.167-8.705 2.188-14.88 2.188-14.88 2.528-2.458 6.06-2.502 6.06-2.502l.142.144c-.23.275-.41.6-.47 1.056-.038.283.076.544.298.68.22.136.5.115.7-.056l.167-.144c.917-.79 2.05-1.22 3.21-1.22 1.16 0 2.293.43 3.21 1.22l.166.144c.2.17.48.192.7.056.222-.136.336-.397.298-.68-.06-.456-.24-.78-.47-1.056l.142-.144s3.532.044 6.06 2.502c0 0 4.355 6.175 2.188 14.88z"></path>
                                    </svg>
                                    <span className="text-sm font-semibold leading-6">Apple</span>
                                </button>
                            </div>

                            <div className="mt-8 text-center text-sm text-gray-500">
                                {isLogin ? (
                                    <p>
                                        New to Cine Nest?{' '}
                                        <button onClick={toggleMode} className="font-semibold leading-6 text-[#e60a15] hover:text-red-400 transition-colors">
                                            Create an Account
                                        </button>
                                    </p>
                                ) : (
                                    <p>
                                        Already a member?{' '}
                                        <button onClick={toggleMode} className="font-semibold leading-6 text-[#e60a15] hover:text-red-400 transition-colors">
                                            Log In
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
         @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
         }
         .animate-blob {
            animation: blob 20s infinite;
         }
         .animate-pulse-slow {
            animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
         }
       `}</style>
        </div>
    );
}
