
import os
import sys
from dotenv import load_dotenv

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.ml.serpapi_service import serp_api_service

def test_serp():
    print("Testing SerpApi Service...")
    
    # Test with a popular movie
    movie = "Inception"
    year = 2010
    
    results = serp_api_service.search_movie_info(movie, year)
    
    if results:
        print(f"Success! Found data for {movie}:")
        print(f"Rating: {results.get('imdb_rating')}")
        print(f"Image: {results.get('image')}")
        print(f"Source: {results.get('source')}")
    else:
        print("Failed to retrieve data.")

if __name__ == "__main__":
    test_serp()
