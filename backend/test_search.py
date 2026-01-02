import sys
import os

# Add the current directory to sys.path to import ml
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ml.recommender import search_movies_with_ai

def test_search():
    print("--- Test 1: Search by Year 2025 ---")
    results = search_movies_with_ai("best movies of 2025")
    for r in results[:3]:
        print(f"{r['title']} ({r['year']}) - IMDb: {r['imdb']} - Platforms: {r['platforms']}")

    print("\n--- Test 2: Search by Platform Netflix 2026 ---")
    results = search_movies_with_ai("movies on netflix 2026")
    for r in results[:3]:
        print(f"{r['title']} ({r['year']}) - IMDb: {r['imdb']} - Platforms: {r['platforms']}")

    print("\n--- Test 3: Search by Keyword 'Tollywood' ---")
    results = search_movies_with_ai("Tollywood")
    for r in results[:3]:
        print(f"{r['title']} ({r['year']}) - IMDb: {r['imdb']} - Directors: {r['directors']}")

if __name__ == "__main__":
    test_search()
