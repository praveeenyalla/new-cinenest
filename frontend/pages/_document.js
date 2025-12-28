import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <meta charSet="utf-8" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
                <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
                <script dangerouslySetInnerHTML={{
                    __html: `
                        tailwind.config = {
                            darkMode: "class",
                            theme: {
                                extend: {
                                    colors: {
                                        "primary": "#e60a15",
                                        "primary-dark": "#b30009",
                                        "background-light": "#f8f5f6",
                                        "background-dark": "#181111", 
                                        "surface-dark": "#271b1c",    
                                        "surface-highlight": "#1E1E1E",
                                        "surface-light": "#2a1a1b",
                                        "border-dark": "#392829",     
                                        "text-muted": "#ba9c9d",      
                                    },
                                    fontFamily: {
                                        "display": ["Space Grotesk", "sans-serif"],
                                        "sans": ["Space Grotesk", "sans-serif"],
                                        "body": ["Noto Sans", "sans-serif"],
                                    },
                                    backgroundImage: {
                                        "hero-gradient": "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 60%, #000000 100%)",
                                    },
                                    animation: {
                                        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                                        "glow": "glow 3s ease-in-out infinite alternate",
                                        "spin-slow": "spin 12s linear infinite",
                                    },
                                    keyframes: {
                                        glow: {
                                            "0%": { boxShadow: "0 0 20px -5px #e60a15" },
                                            "100%": { boxShadow: "0 0 40px 5px #e60a15" },
                                        }
                                    }
                                },
                            }
                        }
                    `}} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
