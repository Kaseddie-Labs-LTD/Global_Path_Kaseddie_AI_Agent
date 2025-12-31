from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from jobspy import scrape_jobs

app = FastAPI(title="Global-Path-kaseddie Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],  # allow Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/search")
def search(q: str, location: str = "Dubai, UAE", limit: int = 15):
    try:
        jobs = scrape_jobs(
            site_name=["indeed", "bayt", "naukri", "google"],
            search_term=q,
            location=location,
            results_wanted=limit,
            hours_old=168,
        )
        # Convert to list of dicts
        result = jobs.to_dict('records')
        return {"jobs": result, "count": len(result)}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)