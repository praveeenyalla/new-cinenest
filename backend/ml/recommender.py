import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler, normalize
from database import content_collection

class Recommender:
    def __init__(self):
        self.df = None
        self.similarity_matrix = None
        self.load_data()

    def load_data(self):
        """Load movie dataset from multiple JSON sources and build similarity matrix"""
        try:
            import os
            import json
            
            # Resolve paths
            BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            FINAL_DF_PATH = os.path.join(BASE_DIR, "final_df_cleaned.json")
            NEW_DATA_PATH = os.path.join(BASE_DIR, "new_data.json")
            
            # 1. Load Main Dataset
            if not os.path.exists(FINAL_DF_PATH):
                print(f"Warning: Dataset file not found at {FINAL_DF_PATH}")
                self.df = pd.DataFrame()
                return

            with open(FINAL_DF_PATH, 'r', encoding='utf-8') as f:
                data_main = json.load(f)
            
            df_main = pd.DataFrame(data_main)

            # 2. Load New Data (2021-2025)
            df_new = pd.DataFrame()
            if os.path.exists(NEW_DATA_PATH):
                with open(NEW_DATA_PATH, 'r', encoding='utf-8') as f:
                    data_new = json.load(f)
                
                # Normalize new data structure to match main df
                normalized_new = []
                for item in data_new:
                    entry = {
                        "Title": item.get("title"),
                        "Year": item.get("year"),
                        "Type": item.get("type", "Movie").lower(),
                        "IMDb": item.get("imdb_rating", 0),
                        "Genres": "Drama", # Default genre if missing
                        "Directors": "Unknown",
                        "Country": "Unknown",
                        "Language": "English",
                        "Runtime": 0,
                        "Netflix": 1 if item.get("platform") == "Netflix" else 0,
                        "Hulu": 1 if item.get("platform") == "Hulu" else 0,
                        "Prime Video": 1 if item.get("platform") == "Prime Video" else 0,
                        "Disney+": 1 if item.get("platform") == "Disney+" else 0,
                        "Rotten Tomatoes": None
                    }
                    normalized_new.append(entry)
                
                df_new = pd.DataFrame(normalized_new)
                print(f"Loaded {len(df_new)} new items from new_data.json")

            # 3. Merge Datasets
            self.df = pd.concat([df_main, df_new], ignore_index=True)
            
            if self.df.empty:
                print("Warning: Combined dataset is empty.")
                return

            # Preprocessing fields into vectors
            # 1. Genre similarity (40%) - Multi-hot encoding
            self.df['Genres'] = self.df['Genres'].fillna('')
            genre_matrix = self.df['Genres'].str.get_dummies(sep=',')
            genre_matrix_norm = normalize(genre_matrix)
            
            # 2. IMDb similarity (30%) - Scaling scores
            scaler = MinMaxScaler()
            self.df['IMDb'] = pd.to_numeric(self.df['IMDb'], errors='coerce').fillna(0)
            imdb_scaled = scaler.fit_transform(self.df['IMDb'].values.reshape(-1, 1))
            
            # 3. Platform similarity (20%) - Multi-hot
            platforms = ['Netflix', 'Hulu', 'Prime Video', 'Disney+']
            for p in platforms:
                if p not in self.df.columns:
                    self.df[p] = 0
                self.df[p] = pd.to_numeric(self.df[p], errors='coerce').fillna(0).astype(int)
            
            platform_matrix = self.df[platforms].values
            platform_matrix_norm = normalize(platform_matrix) if platform_matrix.any() else platform_matrix
            
            # 4. Year proximity (10%) - Scaling release year
            self.df['Year'] = pd.to_numeric(self.df['Year'], errors='coerce').fillna(0)
            year_scaled = scaler.fit_transform(self.df['Year'].values.reshape(-1, 1))
            
            # Combine weighted features
            v_genre = genre_matrix_norm * np.sqrt(0.40)
            v_imdb = imdb_scaled * np.sqrt(0.30)
            v_platform = platform_matrix_norm * np.sqrt(0.20)
            v_year = year_scaled * np.sqrt(0.10)
            
            combined_features = np.hstack([v_genre, v_imdb, v_platform, v_year])
            
            # Generate similarity matrix
            self.similarity_matrix = cosine_similarity(combined_features)
            print(f"Successfully loaded recommendation engine with {len(self.df)} total items.")
            
        except Exception as e:
            print(f"Error initializing recommender: {str(e)}")
            self.df = pd.DataFrame()

    def get_recommendations(self, title: str, limit: int = 10):
        """Return top N recommended movies based on similarity score"""
        if self.df is None or self.df.empty or self.similarity_matrix is None:
            return []
        
        # Primary search: Exact match (case-insensitive)
        indices = self.df.index[self.df['Title'].str.lower() == title.lower()].tolist()
        
        # Fallback: Substring match
        if not indices:
            indices = self.df.index[self.df['Title'].str.contains(title, case=False, na=False)].tolist()
        
        if not indices:
            return [] # Title not found
            
        # Use only the first match found
        idx = indices[0]
        
        # Get similarity scores for this movie index
        sim_scores = list(enumerate(self.similarity_matrix[idx]))
        
        # Sort by similarity score descending
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        
        # Filter out the title itself and take top 'limit' results
        recommendations = []
        for i, score in sim_scores:
            if i == idx: continue
            if len(recommendations) >= limit: break
            
            row = self.df.iloc[i]
            # Consolidate platform availability
            available_platforms = [p for p in ['Netflix', 'Hulu', 'Prime Video', 'Disney+'] if row.get(p) == 1]
            
            recommendations.append({
                "title": row.get('Title', 'Unknown'),
                "platform": ", ".join(available_platforms) if available_platforms else "None",
                "imdb_rating": float(row.get('IMDb', 0)),
                "release_year": int(row.get('Year', 0)),
                "similarity_score": round(float(score) * 100, 2)
            })
            
        return recommendations

    def get_curated_content(self):
        """Returns categorized curated content from the dataset"""
        if self.df is None or self.df.empty:
            return {}

        # 1. Trending Now (New Releases 2024-2025 with High Rating)
        trending = self.df[
            (self.df['Year'] >= 2024) & 
            (self.df['IMDb'] >= 7.5)
        ].sort_values(by='IMDb', ascending=False).head(10)

        # 2. All-Time Top Rated (IMDb > 8.5)
        top_rated = self.df[self.df['IMDb'] >= 8.5].sort_values(by='IMDb', ascending=False).head(10)

        # 3. Netflix Exclusives (New & High Rated)
        netflix = self.df[
            (self.df['Netflix'] == 1) & 
            (self.df['Year'] >= 2022) &
            (self.df['IMDb'] >= 7.0)
        ].sort_values(by='Year', ascending=False).head(10)

        def format_list(df_subset):
            results = []
            for _, row in df_subset.iterrows():
                available_platforms = [p for p in ['Netflix', 'Hulu', 'Prime Video', 'Disney+'] if row.get(p) == 1]
                results.append({
                    "title": row.get('Title'),
                    "year": int(row.get('Year', 0)),
                    "imdb": float(row.get('IMDb', 0)),
                    "platforms": available_platforms,
                    "genres": str(row.get('Genres', '')).split(','),
                    "directors": str(row.get('Directors', ''))
                })
            return results

        return {
            "trending_now": format_list(trending),
            "top_rated": format_list(top_rated),
            "netflix_new": format_list(netflix)
        }

# Initialize once into memory (Singleton pattern as requested)
engine = Recommender()

def get_recommendations(title: str, limit: int = 10):
    return engine.get_recommendations(title, limit)

def get_ai_curated():
    return engine.get_curated_content()
