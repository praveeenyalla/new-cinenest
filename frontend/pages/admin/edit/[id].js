import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import AdminTopBar from '../../components/AdminTopBar';
import FormInput from '../../components/FormInput';
import { API_URL } from '../../config/api';

export default function EditContent() {
    const router = useRouter();
    const { id } = router.query;

    const [formData, setFormData] = useState({
        title: '',
        platform: 'Netflix',
        imdb: '',
        year: '',
        genres: '',
        type: 'movie',
        views: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            router.push('/auth');
            return;
        }

        if (!id) return;

        const fetchItem = async () => {
            try {
                const response = await fetch(`${API_URL}/admin/content`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                const item = data.find(i => i._id === id);

                if (item) {
                    setFormData(item);
                } else {
                    setError('Content not found');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const token = localStorage.getItem('adminToken');
        try {
            const response = await fetch(`${API_URL}/admin/content/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    imdb: parseFloat(formData.imdb),
                    year: parseInt(formData.year),
                    views: parseInt(formData.views)
                })
            });

            if (!response.ok) throw new Error('Failed to update content');

            router.push('/admin/content');
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading">
            <div className="spinner"></div>
            <span>Loading details...</span>
            <style jsx>{`
          .loading { height: 100vh; background: #000; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; }
          .spinner { width: 40px; height: 40px; border: 4px solid #333; border-top-color: #e50914; border-radius: 50%; animation: spin 1s infinite linear; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        </div>
    );

    return (
        <div className="admin-page">
            <Head>
                <title>Edit {formData.title} | CINE NEST Admin</title>
            </Head>

            <AdminSidebar />

            <div className="main-wrapper">
                <AdminTopBar />

                <main className="dashboard-body">
                    <header className="page-header">
                        <button onClick={() => router.back()} className="back-btn">← Back</button>
                        <h1>Edit Content: {formData.title}</h1>
                    </header>

                    {error && <div className="error-bar">{error}</div>}

                    <div className="form-container">
                        <form onSubmit={handleSubmit} className="admin-form">
                            <div className="form-grid">
                                <FormInput label="Title" name="title" value={formData.title} onChange={handleChange} required />

                                <div className="form-group">
                                    <label>Platform</label>
                                    <select name="platform" value={formData.platform} onChange={handleChange} className="select-field">
                                        <option value="Netflix">Netflix</option>
                                        <option value="Hulu">Hulu</option>
                                        <option value="Prime Video">Prime Video</option>
                                        <option value="Disney+">Disney+</option>
                                    </select>
                                </div>

                                <FormInput label="IMDb Rating" name="imdb" type="number" step="0.1" value={formData.imdb} onChange={handleChange} required />
                                <FormInput label="Release Year" name="year" type="number" value={formData.year} onChange={handleChange} required />
                                <FormInput label="Genres" name="genres" value={formData.genres} onChange={handleChange} required />

                                <div className="form-group">
                                    <label>Type</label>
                                    <select name="type" value={formData.type} onChange={handleChange} className="select-field">
                                        <option value="movie">Movie</option>
                                        <option value="show">Show</option>
                                    </select>
                                </div>

                                <FormInput label="Views" name="views" type="number" value={formData.views} onChange={handleChange} />
                            </div>

                            <button type="submit" className="submit-btn" disabled={saving}>
                                {saving ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            <style jsx>{`
                .admin-page { background: #000; color: white; min-height: 100vh; }
                .main-wrapper { margin-left: 260px; padding-top: 70px; }
                .dashboard-body { padding: 2rem; }
                .page-header { margin-bottom: 2rem; display: flex; align-items: center; gap: 20px; }
                .back-btn { background: #111; border: 1px solid #333; color: #fff; cursor: pointer; padding: 5px 15px; border-radius: 6px; font-size: 0.9rem; }
                h1 { font-size: 2rem; margin: 0; font-weight: 800; }
                
                .form-container {
                    background: #111;
                    padding: 2.5rem;
                    border-radius: 12px;
                    border: 1px solid #1a1a1a;
                    max-width: 900px;
                }

                .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
                .form-group { margin-bottom: 5px; display: flex; flex-direction: column; gap: 8px; }
                label { font-weight: 600; color: #666; font-size: 0.85rem; }
                
                .select-field { 
                    background: #000; border: 1px solid #333; padding: 12px; 
                    border-radius: 8px; color: white; font-size: 1rem; outline: none;
                }
                .select-field:focus { border-color: #e50914; }

                .submit-btn { 
                    width: 100%; margin-top: 30px; background: #e50914; color: white; 
                    border: none; padding: 15px; border-radius: 12px; font-weight: 800; 
                    cursor: pointer; transition: 0.3s;
                }
                .submit-btn:hover { background: #b20710; }
                .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .error-bar { background: #ef444420; color: #ef4444; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
                @media (max-width: 800px) { .form-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
}

