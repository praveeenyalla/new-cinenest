
import os
from serpapi import GoogleSearch
from dotenv import load_dotenv

load_dotenv()

class SerpApiService:
    def __init__(self):
        self.api_key = os.getenv("SERPAPI_KEY")

    def search_movie_info(self, movie_title, year=None):
        """
        Search for movie information including IMDb rating and images.
        """
        if not self.api_key:
            print("SerpApi key not found.")
            return None

        query = f"{movie_title} movie"
        if year:
            query += f" {year}"
        
        search_params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google",
            "gl": "us",
            "hl": "en"
        }

        try:
            search = GoogleSearch(search_params)
            results = search.get_dict()
            
            info = {
                "title": movie_title,
                "imdb_rating": None,
                "image": None,
                "description": None,
                "source": "Google/SerpApi"
            }

            # 1. Try to get data from Knowledge Graph
            kg = results.get("knowledge_graph")
            if kg:
                info["title"] = kg.get("title", movie_title)
                info["description"] = kg.get("description")
                
                # Extract image
                if kg.get("header_images"):
                    info["image"] = kg["header_images"][0].get("image")
                elif kg.get("image"):
                    info["image"] = kg.get("image")

                # Extract IMDb rating from KG attributes
                for attr in kg.get("known_attributes", []):
                    if "IMDb" in attr.get("name", ""):
                        val = attr.get("value", "")
                        try:
                            # Usually "8.1/10"
                            info["imdb_rating"] = float(val.split("/")[0])
                        except:
                            pass

            # 2. Fallback to organic results if KG is missing some info
            if not info["imdb_rating"]:
                for result in results.get("organic_results", []):
                    snippet = result.get("snippet", "")
                    if "IMDb" in result.get("title", "") or "imdb.com" in result.get("link", ""):
                        # Extract rating from snippet or rich snippet if available
                        rich = result.get("rich_snippet")
                        if rich and rich.get("top") and rich["top"].get("detected_extensions"):
                            ext = rich["top"]["detected_extensions"]
                            if ext.get("rating"):
                                info["imdb_rating"] = float(ext["rating"])
                                break

            # 3. Simple image search fallback if still no image
            if not info["image"]:
                # We could do a separate image search here if needed, 
                # but organic results sometimes have thumbnails
                for result in results.get("organic_results", []):
                    if result.get("thumbnail"):
                        info["image"] = result.get("thumbnail")
                        break

            print(f"SerpApi retrieved info for {movie_title}: {info}")
            return info

        except Exception as e:
            print(f"Error calling SerpApi: {e}")
            return None

# Singleton instance
serp_api_service = SerpApiService()
