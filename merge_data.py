import json
import os
import shutil

# Paths
ROOT_DATA_PATH = "final_df_cleaned.json"
FRONTEND_DATA_PATH = "frontend/public/data/final_df_cleaned.json"
NEW_DATA_PATH = "new_data.json"

def main():
    # 1. Load existing data
    existing_data = []
    if os.path.exists(ROOT_DATA_PATH):
        try:
            with open(ROOT_DATA_PATH, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            print(f"Loaded {len(existing_data)} existing records.")
        except Exception as e:
            print(f"Error loading existing data: {e}")
            return

    # 2. Load new data
    new_records = []
    if os.path.exists(NEW_DATA_PATH):
        try:
            with open(NEW_DATA_PATH, 'r', encoding='utf-8') as f:
                new_records = json.load(f)
            print(f"Loaded {len(new_records)} new records.")
        except Exception as e:
            print(f"Error loading new data: {e}")
            return
    else:
        print("new_data.json not found.")
        return

    # 3. Transform new records to schema
    transformed_records = []
    for item in new_records:
        transformed = {
            "Title": item.get("title"),
            "Year": item.get("year"),
            "Age": None,
            "IMDb": item.get("imdb_rating"),
            "Rotten Tomatoes": None,
            "Netflix": 1 if item.get("platform") == "Netflix" else 0,
            "Hulu": 1 if item.get("platform") == "Hulu" else 0,
            "Prime Video": 1 if item.get("platform") == "Prime Video" else 0,
            "Disney+": 1 if item.get("platform") == "Disney+" else 0,
            "Type": str(item.get("type", "")).lower(),  # normalized to lowercase
            "Directors": None,
            "Genres": None,
            "Country": None,
            "Language": None,
            "Runtime": None
        }
        transformed_records.append(transformed)

    # 4. Append
    combined_data = existing_data + transformed_records
    print(f"Total records after merge: {len(combined_data)}")

    # 5. Write back to root
    with open(ROOT_DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(combined_data, f, indent=4)
    print(f"Updated {ROOT_DATA_PATH}")

    # 6. Copy to frontend
    try:
        os.makedirs(os.path.dirname(FRONTEND_DATA_PATH), exist_ok=True)
        shutil.copy(ROOT_DATA_PATH, FRONTEND_DATA_PATH)
        print(f"Copied to {FRONTEND_DATA_PATH}")
    except Exception as e:
        print(f"Error copying to frontend: {e}")

if __name__ == "__main__":
    main()
