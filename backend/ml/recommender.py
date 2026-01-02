import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler, normalize
import database
import google.generativeai as genai
import os
import json
import re
from .serpapi_service import serp_api_service

class Recommender:
    def __init__(self):
        self.df = None
        self.df = None
        self.combined_features = None
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
            UPCOMING_DATA_PATH = os.path.join(BASE_DIR, "movies_2025_2026_500.json")
            
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

            # 2.5 Load Upcoming Data (2025-2026)
            df_upcoming = pd.DataFrame()
            if os.path.exists(UPCOMING_DATA_PATH):
                with open(UPCOMING_DATA_PATH, 'r', encoding='utf-8') as f:
                    data_upcoming = json.load(f)
                
                normalized_upcoming = []
                for item in data_upcoming:
                    entry = {
                        "Title": item.get("title"),
                        "Year": item.get("release_year"),
                        "Type": "movie",
                        "IMDb": item.get("imdb_rating") if item.get("imdb_rating") else 0,
                        "Genres": item.get("category", "Drama"),
                        "Directors": item.get("director", "Unknown"),
                        "Country": "Unknown",
                        "Language": "Multiple",
                        "Runtime": 0,
                        "Netflix": 1 if item.get("platform") == "Netflix" else 0,
                        "Hulu": 1 if item.get("platform") == "Hulu" else 0,
                        "Prime Video": 1 if item.get("platform") == "Prime Video" else 0,
                        "Disney+": 1 if item.get("platform") == "Disney+" else 0,
                        "Rotten Tomatoes": None
                    }
                    normalized_upcoming.append(entry)
                df_upcoming = pd.DataFrame(normalized_upcoming)
                print(f"Loaded {len(df_upcoming)} upcoming items from movies_2025_2026_500.json")

            # 3. Merge Datasets
            self.df = pd.concat([df_main, df_new, df_upcoming], ignore_index=True)
            
            if self.df.empty:
                print("Warning: Combined dataset is empty.")
                return

            # Preprocessing fields into vectors
            # 1. Genre similarity (40%) - Multi-hot encoding
            self.df['Genres'] = self.df['Genres'].fillna('')
            print("Processing Genres...")
            genre_matrix = self.df['Genres'].str.get_dummies(sep=',')
            print("Genres processed.")
            genre_matrix_norm = normalize(genre_matrix)
            
            # 2. IMDb similarity (30%) - Scaling scores
            print("Processing IMDb...")
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
            
            self.combined_features = np.hstack([v_genre, v_imdb, v_platform, v_year]).astype(np.float32)
            print("Successfully loaded recommendation engine with {len(self.df)} total items.")
            print("Feature matrix shape:", self.combined_features.shape)
            
        except Exception as e:
            print(f"Error initializing recommender: {str(e)}")
            self.df = pd.DataFrame()

    def get_recommendations(self, title: str, limit: int = 10):
        """Return top N recommended movies based on similarity score"""
        if self.df is None or self.df.empty or self.combined_features is None:
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
        
        # Compute similarity on the fly for memory efficiency
        # Reshape target vector to (1, n_features)
        target_vector = self.combined_features[idx].reshape(1, -1)
        
        # Calculate cosine similarity between target and all items
        # Returns (1, n_items) matrix
        sim_scores_row = cosine_similarity(target_vector, self.combined_features)[0]
        
        # Enumerate to keep index
        sim_scores = list(enumerate(sim_scores_row))
        
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

        try:
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
        except Exception as e:
            print(f"Error filtering curated content: {e}")
            return {}

        def format_list(df_subset):
            results = []
            if df_subset is None or df_subset.empty:
                return results

            for _, row in df_subset.iterrows():
                try:
                    available_platforms = [p for p in ['Netflix', 'Hulu', 'Prime Video', 'Disney+'] if row.get(p) == 1]
                    results.append({
                        "title": row.get('Title'),
                        "year": int(row.get('Year', 0)),
                        "imdb": float(row.get('IMDb', 0)),
                        "platforms": available_platforms,
                        "genres": str(row.get('Genres', '')).split(','),
                        "directors": str(row.get('Directors', ''))
                    })
                except Exception as row_err:
                     print(f"Skipping malformed row in curated: {row_err}")
                     continue
            return results

        return {
            "trending_now": format_list(trending),
            "top_rated": format_list(top_rated),
            "netflix_new": format_list(netflix)
        }

    def search_by_ai_intent(self, intent: dict):
        """Filter dataset based on extracted AI intent"""
        if self.df is None or self.df.empty:
            return []

        filtered_df = self.df.copy()

        # 1. Year Filter
        if intent.get("year"):
            year = intent["year"]
            if isinstance(year, int):
                filtered_df = filtered_df[filtered_df['Year'] == year]
            elif isinstance(year, list) and len(year) == 2:
                filtered_df = filtered_df[(filtered_df['Year'] >= year[0]) & (filtered_df['Year'] <= year[1])]

        # 2. Platform Filter
        if intent.get("platform"):
            platform = intent["platform"].title()
            if platform in ['Netflix', 'Hulu', 'Prime Video', 'Disney+']:
                filtered_df = filtered_df[filtered_df[platform] == 1]

        # 3. Genre Filter
        if intent.get("genre"):
            genre = intent["genre"].lower()
            filtered_df = filtered_df[filtered_df['Genres'].str.lower().str.contains(genre, na=False)]

        # 4. Keyword Search (Title/Director)
        if intent.get("keyword"):
            kw = intent["keyword"].lower()
            filtered_df = filtered_df[
                filtered_df['Title'].str.lower().str.contains(kw, na=False) |
                filtered_df['Directors'].str.lower().str.contains(kw, na=False)
            ]

        # 5. Rating Threshold
        if intent.get("min_rating"):
            filtered_df = filtered_df[filtered_df['IMDb'] >= intent["min_rating"]]

        # Sorting
        sort_by = intent.get("sort_by", "rating")
        if sort_by == "rating":
            filtered_df = filtered_df.sort_values(by='IMDb', ascending=False)
        elif sort_by == "year":
            filtered_df = filtered_df.sort_values(by='Year', ascending=False)

        # Limit
        limit = intent.get("limit", 10)
        results = filtered_df.head(limit)

        # Parallelize SerpApi enrichment for top 5 results to reduce latency
        from concurrent.futures import ThreadPoolExecutor
        
        def fetch_enrichment(row):
            title = row.get('Title')
            year = int(row.get('Year', 0))
            try:
                serp_info = serp_api_service.search_movie_info(title, year)
            except:
                serp_info = None
            
            available_platforms = [p for p in ['Netflix', 'Hulu', 'Prime Video', 'Disney+'] if row.get(p) == 1]
            return {
                "title": serp_info["title"] if serp_info else title,
                "year": year,
                "imdb": serp_info["imdb_rating"] if (serp_info and serp_info["imdb_rating"]) else float(row.get('IMDb', 0)),
                "platforms": available_platforms,
                "genres": str(row.get('Genres', '')).split(','),
                "directors": str(row.get('Directors', '')),
                "image": serp_info["image"] if serp_info else None,
                "description": serp_info["description"] if serp_info else None,
                "is_realtime": True if serp_info else False
            }

        top_5_rows = [row for _, row in results.head(5).iterrows()]
        other_rows = [row for _, row in results.tail(len(results) - 5).iterrows()] if len(results) > 5 else []

        formatted_results = []
        
        # Execute parallel fetching
        with ThreadPoolExecutor(max_workers=5) as executor:
            enriched_data = list(executor.map(fetch_enrichment, top_5_rows))
            formatted_results.extend(enriched_data)

        # Process other results
        for row in other_rows:
            available_platforms = [p for p in ['Netflix', 'Hulu', 'Prime Video', 'Disney+'] if row.get(p) == 1]
            formatted_results.append({
                "title": row.get('Title'),
                "year": int(row.get('Year', 0)),
                "imdb": float(row.get('IMDb', 0)),
                "platforms": available_platforms,
                "genres": str(row.get('Genres', '')).split(','),
                "directors": str(row.get('Directors', '')),
                "image": None,
                "is_realtime": False
            })

        return formatted_results

    def extract_intent_with_ai(self, query: str):
        """Uses simple logic to Parse query into structured intent (AI logic can be injected from route)"""
        intent = {
            "year": None,
            "platform": None,
            "genre": None,
            "keyword": None,
            "sort_by": "rating",
            "limit": 10
        }

        # 1. Try to extract year (4 digits)
        year_match = re.search(r'\b(19|20)\d{2}\b', query)
        if year_match:
            intent["year"] = int(year_match.group(0))

        # 2. Try to extract platform
        platforms = ["netflix", "hulu", "prime video", "disney"]
        for p in platforms:
            if p in query.lower():
                intent["platform"] = p if p != "prime video" else "Prime Video"
                if p == "disney": intent["platform"] = "Disney+"
                break
        
        # 3. Handle "best" or "top" keyword (sorting)
        if any(w in query.lower() for w in ["best", "top", "high rated", "popular"]):
            intent["sort_by"] = "rating"
            intent["min_rating"] = 7.0
        
        # 4. Handle "recent" or "new" (sorting)
        if any(w in query.lower() for w in ["recent", "new", "upcoming"]):
            intent["sort_by"] = "year"

        # 5. Remaining words as keywords if no year found
        if not intent["year"]:
            # Basic cleanup: remove common stop words for better search
            intent["keyword"] = query

        return intent

# Initialize once into memory (Singleton pattern as requested)
engine = Recommender()

def get_recommendations(title: str, limit: int = 10):
    return engine.get_recommendations(title, limit)

def get_ai_curated():
    return engine.get_curated_content()

def search_movies_with_ai(query: str, intent: dict = None):
    if not intent:
        intent = engine.extract_intent_with_ai(query)
    return engine.search_by_ai_intent(intent)
