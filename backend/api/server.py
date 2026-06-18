from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.predict import predict_attack

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "project": "AEGIS-NSAI",
        "status": "running"
    }

@app.get("/predict")
def predict():
    return predict_attack()