from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os
from routers import products, users

app = FastAPI(title="ATELIER API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Plug the routers into the app
app.include_router(products.router)
app.include_router(users.router)

@app.get("/")
def health_check():
    return {"status": "online", "message": "Welcome to the ATELIER API!"}