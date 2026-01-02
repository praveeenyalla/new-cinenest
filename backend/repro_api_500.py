import sys
import os
import asyncio
import traceback

# Add backend to path
sys.path.append(os.getcwd())

from routes import ai

async def main():
    try:
        print("Calling get_curated_lists...")
        result = await ai.get_curated_lists()
        print("Result keys:", result.keys())
    except Exception as e:
        print("Caught Exception during execution:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
