# CINE NEST - AI-Powered OTT Platform & Analytics

[![Netlify Status](https://api.netlify.com/api/v1/badges/0f1e542c-8209-4c97-b692-55452b40986a/deploy-status)](https://app.netlify.com/projects/cinenestai/deploys)

CINE NEST is a sophisticated, full-stack OTT (Over-The-Top) streaming application designed with a focus on **AI-driven personalization** and **Deep Data Analytics**. This document provides an exhaustive breakdown of the logic, architecture, and technical decisions implemented across the entire codebase.

---

## 🏛️ Architecture Overview

The project follows a modern decoupled architecture:
1.  **Frontend (Next.js)**: A React-based framework providing Server-Side Rendering (SSR) and static generation for high performance.
2.  **Backend (FastAPI)**: A high-performance Python framework for building APIs, chosen for its speed and native support for asynchronous tasks.
3.  **Database (MongoDB)**: A NoSQL database used for flexibility in storing user profiles, chat history, and movie metadata.
4.  **AI Engine (Google Gemini / Groq)**: Integrated for natural language processing, search intent extraction, and curated recommendations.

---

## 🧠 Backend Logic & Implementation

### 🔌 API Routes Breakdown
Each route is modularized in the `backend/routes/` directory for maintainability:

-   **`ai.py`**: The "Brain" of the platform.
    -   **Logic**: Uses **Google Generative AI (Gemini 2.0)** for extracting search intent. If you type "Find me space movies from 2024 on Netflix", the AI parses this into a JSON filter object.
    -   **White-labeling**: We implement a search/replace logic to rename AI mentions (e.g., "Gemini" becomes "Brain", "Groq" becomes "Neural Engine") to provide a proprietary brand feel.
-   **`analytics.py`**: Handles heavy data processing.
    -   **Logic**: Uses `pandas` to analyze a `.csv` dataset. It performs operations like `groupby` and `explode` (for multi-genre movies) to generate real-time distribution charts.
-   **`auth.py`**: Manages security.
    -   **Logic**: Uses `bcrypt` for password hashing and `jose` (JWT) for secure session tokens. This ensures that only authenticated users can access personalized lists or admin panels.
-   **`admin.py`**: Provides data for the management view, handling CRUD (Create, Read, Update, Delete) operations for movie content.

### 🚥 HTTP Status Codes Explained
We use standard status codes to ensure the frontend can react correctly:
-   **`200 OK`**: Everything is working perfectly.
-   **`401 Unauthorized`**: Occurs when a JWT token is missing or expired. The frontend redirects to login.
-   **`422 Unprocessable Entity`**: A FastAPI specialty. It means the frontend sent data (JSON) that doesn't match the backend's expected schema (e.g., missing an email field).
-   **`500 Internal Server Error`**: Usually indicates a database connection failure or an unhandled exception in the logic (e.g., API key limit reached).

### 🛠️ Important Imports Logic
-   **`FastAPI` / `APIRouter`**: Used to build the RESTful interface.
-   **`pydantic`**: Used for data validation. It ensures that every request has the correct data types before the logic even runs.
-   **`load_dotenv`**: Essential for security. It loads secret keys (API keys, DB URIs) from a `.env` file instead of hardcoding them in the script.

---

## 🎨 Frontend Logic & Visualization

### 📊 Recharts: Designing the "Digital Meters"
The Admin Dashboard uses **Recharts** to transform raw data into visual insights.

-   **Pie Charts**: Used for **Industry Distribution**. We use a `Cell` mapping logic to assign unique colors to different segments (e.g., Hollywood, Bollywood).
-   **Bar Graphs**:
    -   *Vertical*: Used for **Collection by Industry**. We use a `ResponsiveContainer` to ensure the graph looks perfect on both laptops and mobile screens.
    -   *Horizontal*: Used for **Top 10 Movies by Collection**. This layout is chosen because it allows long movie titles to be readable on the Y-Axis.
-   **Line Charts**: Used for **Yearly Release Trends**. This visualization helps observers understand if the content library is growing or shrinking over time.

### ⚡ Performance Optimization
-   **`useMemo` Hook**: In `movies-analytics.js`, we wrap KPI calculations (Total Collection, Average Rating) in `useMemo`. This prevents the browser from re-calculating thousands of data points every time the user clicks a button, keeping the UI "butter smooth."
-   **Filtering Logic**: We implement a multi-layered filter array. As you select "Netflix" or "2025", the code dynamically filters the global `moviesData` array and updates the charts instantly.

---

## 💾 Data Flow & Scripts

### 📜 Windows & Python Scripts
-   **`generate_syn_data.py`**: A powerful script that creates 1000+ synthetic user records. It uses randomized logic to simulate realistic watch history, ensuring the dashboard isn't empty during demos.
-   **`seed_analytics.py`**: This script connects to MongoDB and "seeds" (populates) the database with the generated data. It's the bridge between raw JSON files and a live running application.

### 🔗 Platform Integration
The "Platform" logic (Netflix, Hulu, Prime Video) is baked into the filtering system. Every movie in the database has boolean flags (1 or 0) for these platforms, allowing the `analytics.py` route to quickly count distribution using high-speed bitwise-style filtering in `pandas`.

---

## 🚀 Deployment (Netlify & CI/CD)
The project is configured with a `netlify.toml` file that handles the "Single Page Application" (SPA) redirect logic. When you refresh a page like `/ai` or `/dashboard`, Netlify knows to serve the `index.html` file and let Next.js handle the internal routing.

---

© 2025 CINE NEST Team. Created for excellence in OTT experiences.
