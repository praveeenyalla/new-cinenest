import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { API_URL } from '../config/api';

export default function RecommenderPage() {
  const [title, setTitle] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pagination state (client-side for the returned results)
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');
    setRecommendations([]);
    setCurrentPage(1);

    try {
      const response = await fetch(`${API_URL}/recommend?title=${encodeURIComponent(title)}&limit=20`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to fetch recommendations.');
      }
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setRecommendations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pagination Logic
  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = recommendations.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(recommendations.length / resultsPerPage);

  return (
    <Layout>
      <div className="container">
        <Head>
          <title>🎬 Recommended for you | OTT Platform</title>
        </Head>

        <main className="main">
          <header className="header">
            <h1 className="title">Recommended for you</h1>
            <p className="subtitle">Discover movies matching your taste using our ML Engine</p>
          </header>

          <section className="search-section">
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                placeholder="Search a movie to find similar ones..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? 'Analyzing...' : '🔍 Search'}
              </button>
            </form>
          </section>

          {loading && (
            <div className="loader-container">
              <div className="loader"></div>
              <p>Scanning matrix and computing similarity scores...</p>
            </div>
          )}

          {error && (
            <div className="error-card">
              <p>⚠️ {error}</p>
              <button onClick={() => setError('')} className="close-error">Dismiss</button>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="results-wrapper">
              <div className="table-responsive">
                <table className="recommend-table">
                  <thead>
                    <tr>
                      <th>Movie Title</th>
                      <th>Platform</th>
                      <th>IMDb Rating</th>
                      <th>Release Year</th>
                      <th>Similarity Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResults.map((rec, idx) => (
                      <tr key={idx} className="fade-in">
                        <td className="font-bold">{rec.title}</td>
                        <td>
                          <div className="platform-badges">
                            {rec.platform.split(', ').map(p => (
                              <span key={p} className={`badge ${p.replace(/\s+/g, '').toLowerCase()}`}>{p}</span>
                            ))}
                          </div>
                        </td>
                        <td><span className="rating">⭐ {rec.imdb_rating}</span></td>
                        <td>{rec.release_year}</td>
                        <td>
                          <div className="sim-container">
                            <div className="sim-bar">
                              <div className="sim-fill" style={{ width: `${rec.similarity_score}%` }}></div>
                            </div>
                            <span className="sim-val">{rec.similarity_score}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >Previous</button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >Next</button>
                </div>
              )}
            </div>
          )}

          {!loading && recommendations.length === 0 && !error && (
            <div className="empty-state">
              <img src="https://cdni.iconscout.com/illustration/premium/thumb/no-data-found-8867280-7265556.png" alt="Empty" className="empty-img" />
              <p>Start by searching for a movie like "Inception" or "The Matrix"</p>
            </div>
          )}
        </main>

        <style jsx>{`
            .container {
              min-height: 100vh;
              display: flex;
              justify-content: center;
              padding: 40px 20px;
            }

            .main {
              max-width: 1000px;
              width: 100%;
            }

            .header {
              text-align: center;
              margin-bottom: 40px;
            }

            .title {
              font-size: 2.5rem;
              font-weight: 800;
              margin: 0;
              background: linear-gradient(to right, #ffffff, #9ca3af);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .subtitle {
              color: #9ca3af;
              font-size: 1.1rem;
            }

            .search-section {
              background: #15191e;
              padding: 30px;
              border-radius: 20px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
              margin-bottom: 40px;
              border: 1px solid #2d3748;
            }

            .search-bar {
              display: flex;
              gap: 15px;
            }

            .search-input {
              flex: 1;
              background: #000;
              border: 1px solid #2d3748;
              padding: 15px 20px;
              border-radius: 12px;
              color: white;
              font-size: 1rem;
              outline: none;
              transition: border-color 0.3s;
            }

            .search-input:focus {
              border-color: #e50914;
            }

            .search-btn {
              background: #e50914;
              color: white;
              border: none;
              padding: 0 30px;
              border-radius: 12px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s, background 0.2s;
            }

            .search-btn:hover {
              background: #b20710;
              transform: translateY(-2px);
            }

            .search-btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .table-responsive {
              overflow-x: auto;
              background: #15191e;
              border-radius: 20px;
              border: 1px solid #2d3748;
            }

            .recommend-table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
            }

            .recommend-table th {
              padding: 20px;
              background: rgba(255,255,255,0.05);
              color: #9ca3af;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 0.8rem;
              letter-spacing: 1px;
            }

            .recommend-table td {
              padding: 20px;
              border-bottom: 1px solid #2d3748;
            }

            .font-bold { font-weight: bold; font-size: 1.1rem; }

            .platform-badges {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
            }

            .badge {
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: bold;
              text-transform: uppercase;
            }

            .netflix { background: #E50914; color: white; }
            .hulu { background: #1CE783; color: black; }
            .primevideo { background: #00A8E1; color: white; }
            .disney+ { background: #113CCF; color: white; }

            .rating { color: #fbbf24; font-weight: bold; }

            .sim-container {
              display: flex;
              align-items: center;
              gap: 10px;
              min-width: 150px;
            }

            .sim-bar {
              flex: 1;
              height: 8px;
              background: #333;
              border-radius: 4px;
              overflow: hidden;
            }

            .sim-fill {
              height: 100%;
              background: linear-gradient(to right, #30cfd0 0%, #330867 100%);
            }

            .sim-val {
              font-size: 0.9rem;
              font-weight: bold;
              color: #30cfd0;
            }

            .loader-container {
              text-align: center;
              padding: 50px;
            }

            .loader {
              width: 50px;
              height: 50px;
              border: 4px solid #333;
              border-top-color: #e50914;
              border-radius: 50%;
              animation: spin 1s infinite linear;
              margin: 0 auto 20px;
            }

            @keyframes spin { to { transform: rotate(360deg); } }

            .pagination {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 20px;
              margin-top: 30px;
            }

            .pagination button {
              background: #15191e;
              border: 1px solid #2d3748;
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
            }

            .pagination button:disabled { opacity: 0.3; cursor: not-allowed; }

            .error-card {
              background: rgba(229, 9, 20, 0.1);
              border: 1px solid #e50914;
              padding: 20px;
              border-radius: 12px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            .close-error {
              background: none;
              border: none;
              color: #9ca3af;
              cursor: pointer;
              text-decoration: underline;
            }

            .empty-state {
              text-align: center;
              padding: 60px;
              color: #9ca3af;
            }

            .empty-img {
              width: 200px;
              opacity: 0.5;
              margin-bottom: 20px;
            }

            .fade-in {
              animation: fadeIn 0.5s ease-in forwards;
            }

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @media (max-width: 768px) {
              .search-bar { flex-direction: column; }
              .title { font-size: 1.8rem; }
            }
          `}</style>
      </div>
    </Layout>
  );
}
