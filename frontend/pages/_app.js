import Head from 'next/head';
import Script from 'next/script';
import Footer from '../components/Footer';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />

      <style jsx global>{`
        :root {
          --accent: #e60a15;
          --bg: #050505;
          --text: #ffffff;
        }
        body {
          margin: 0;
          padding: 0;
          background-color: var(--bg);
          color: var(--text);
          font-family: 'Space Grotesk', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        /* Global Scrollbar Styling */
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #e60a15; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .glass-nav {
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .text-glow { text-shadow: 0 0 20px rgba(230, 10, 21, 0.5); }
        .orb-glow {
            background: radial-gradient(circle, rgba(230,10,21,1) 0%, rgba(230,10,21,0) 70%);
            filter: blur(40px);
            opacity: 0.6;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #111;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}

export default MyApp;
