import sys
import os

# Add backend directory to sys.path
sys.path.append(os.getcwd())

try:
    from ml.recommender import engine
    print("Engine loaded successfully")
    curated = engine.get_curated_content()
    print("Curated content retrieved")
    print(curated)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
