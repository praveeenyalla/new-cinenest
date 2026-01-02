import pandas as pd
import os
from fastapi import APIRouter, Query
from typing import Optional
import database

router = APIRouter()

# Load the dataset
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "final_df_cleaned.csv")
df = pd.read_csv(CSV_PATH)

@router.get('/platform-distribution')
def get_platform_distribution():
    platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"]
    stats = []
    for platform in platforms:
        count = int(df[df[platform] == 1].shape[0])
        stats.append({"name": platform, "value": count})
    return stats

@router.get('/year-distribution')
def get_year_distribution(platform: Optional[str] = Query(None)):
    filtered_df = df
    if platform and platform in ["Netflix", "Hulu", "Prime Video", "Disney+"]:
        filtered_df = df[df[platform] == 1]
    
    year_stats = filtered_df.groupby('Year').size().reset_index(name='count')
    # Sort by year and take the last 30 years for clarity if too many
    year_stats = year_stats.sort_values('Year').tail(30)
    
    result = []
    for _, row in year_stats.iterrows():
        result.append({"year": int(row['Year']), "count": int(row['count'])})
    return result

@router.get('/genre-popularity')
def get_genre_popularity():
    # Split genres and explode to count correctly
    genre_df = df.copy()
    genre_df['Genres'] = genre_df['Genres'].fillna('Unknown').str.split(',')
    genre_exploded = genre_df.explode('Genres')
    
    # Get top 10 genres by count
    top_genres = genre_exploded['Genres'].value_counts().head(10).index.tolist()
    
    # Calculate avg IMDb for these top genres
    genre_stats = genre_exploded[genre_exploded['Genres'].isin(top_genres)].groupby('Genres').agg({
        'IMDb': 'mean',
        'Title': 'count'
    }).reset_index()
    
    genre_stats.columns = ['genre', 'avg_imdb', 'count']
    genre_stats = genre_stats.sort_values('count', ascending=False)
    
    result = []
    for _, row in genre_stats.iterrows():
        result.append({
            "genre": row['genre'],
            "avg_imdb": round(float(row['avg_imdb']), 2),
            "count": int(row['count'])
        })
    return result

@router.get('/filters')
def get_filter_options():
    years = sorted(df['Year'].unique().tolist(), reverse=True)
    platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"]
    return {
        "years": [int(y) for y in years],
        "platforms": platforms
    }

@router.get('/platform-count') # Keep for backward compatibility if needed, but updated
def platform_count():
    platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"]
    results = []
    for p in platforms:
        count = int(df[df[p] == 1].shape[0])
        results.append({"_id": p, "count": count})
    return {"platform_distribution": results}
