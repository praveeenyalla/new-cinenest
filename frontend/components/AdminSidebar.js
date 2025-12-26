import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminSidebar() {
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/admin' },
    { name: 'Rating', icon: '⭐', path: '/admin/rating' },
    { name: 'Comments', icon: '💬', path: '/admin/comments' },
    { name: 'Users', icon: '👥', path: '/admin/users' },
    { name: 'Movie List', icon: '🎬', path: '/admin/content' },
    { name: 'User Analysis', icon: '📈', path: '/admin/analytics' },
    { name: 'Authentication', icon: '🔒', path: '/admin/authentication', hasSub: true },
  ];

  const handleLogout = () => {
    // Clear ALL credentials to ensure a clean state
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');

    // Redirect to login page
    router.push('/auth');
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-box">
          <span className="logo-icon">S</span>
        </div>
        <span className="logo-text">CINE NEST</span>
      </div>

      <nav className="nav-menu">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.path}>
            <div className={`nav-item ${router.pathname === item.path ? 'active' : ''}`}>
              <span className="item-icon">{item.icon}</span>
              <span className="item-name">{item.name}</span>
              {item.hasSub && <span className="arrow">›</span>}
            </div>
          </Link>
        ))}
      </nav>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">
          <span className="item-icon">🚪</span>
          <span className="item-name">Log Out</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #1a1a1a;
          position: fixed;
          left: 0;
          top: 0;
          overflow-y: auto;
          z-index: 1000;
        }

        .logo-container {
          padding: 1.2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 10px;
          background: #000;
        }

        .logo-box {
          background: #e50914;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .logo-icon {
          color: #fff;
          font-weight: 900;
          font-size: 1.2rem;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.3rem;
          letter-spacing: 1px;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .nav-menu {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          flex: 1; /* Pushes content down for footer */
        }

        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          transition: 0.3s;
          color: #9ca3af;
          border-left: 4px solid transparent;
          text-decoration: none;
          border-bottom: none;
        }

        .nav-item:hover {
          background: rgba(229, 9, 20, 0.05);
          color: #fff;
        }

        .nav-item.active {
          background: #e50914;
          color: #fff;
          border-left-color: #e50914;
        }

        .nav-item.active .item-icon, .nav-item.active .arrow {
          color: #fff;
        }

        .item-icon {
          margin-right: 15px;
          font-size: 1.2rem;
        }

        .item-name {
          flex: 1;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .arrow {
          font-size: 1.2rem;
          opacity: 0.5;
        }
        
        .logout-container {
            padding: 1rem 1.5rem;
            border-top: 1px solid #1a1a1a;
            margin-top: auto;
        }
        
        .logout-btn {
            display: flex;
            align-items: center;
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255,255,255,0.1);
            color: #d1d5db;
            padding: 0.8rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
        }
        
        .logout-btn:hover {
            background: rgba(229, 9, 20, 0.1);
            border-color: #e50914;
            color: #fff;
        }

        /* Webkit scrollbar */
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
      `}</style>
    </aside>
  );
}
