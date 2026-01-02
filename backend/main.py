import uvicorn
from fastapi import FastAPI
from dotenv import load_dotenv
import os

load_dotenv()
from routes.platform import router as PlatformRouter
from routes.analytics import router as AnalyticsRouter
from routes.trending import router as TrendingRouter
from routes.recommend import router as RecommendRouter
from routes.search import router as SearchRouter
from routes.ai import router as AIRouter
from routes.dataset_analysis import router as AnalysisRouter
from routes.admin import router as AdminRouter
from routes.auth import router as AuthRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(title="OTT Platform API")

# Debugging 422 Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation Error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.62:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(PlatformRouter, prefix="/platform")
app.include_router(AnalyticsRouter, prefix="/analytics")
app.include_router(TrendingRouter, prefix="/trending")
app.include_router(RecommendRouter, prefix="/recommend")
app.include_router(SearchRouter, prefix="/search")
app.include_router(AIRouter, prefix="/ai")
app.include_router(AnalysisRouter, prefix="/analysis-v2")
app.include_router(AdminRouter, prefix="/admin")
app.include_router(AuthRouter, prefix="/auth")

@app.get("/")
def home():
    return {"message": "OTT API running successfully!"}

@app.on_event("startup")
async def startup_event():
    print("Backend Server Started - Routes Loaded")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
