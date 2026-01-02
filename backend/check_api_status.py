import requests
import sys

def check_backend():
    url = "http://127.0.0.1:8000/ai/curated"
    print(f"Testing connectivity to: {url}")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Success! Backend is reachable.")
            print("Response preview:", response.text[:200])
        else:
            print("Backend is reachable but returned an error.")
            print("Response:", response.text)
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend. Is it running?")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_backend()
