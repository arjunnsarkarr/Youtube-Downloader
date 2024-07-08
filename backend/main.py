from fastapi import FastAPI
from api.download import router as DownloadRouter


app = FastAPI()

app.include_router(DownloadRouter, prefix="")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", reload=True)
