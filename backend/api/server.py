from fastapi import FastAPI
from backend.api.predict import predict_attack

app = FastAPI()

@app.get("/")
def home():
    return {
        "project": "AEGIS-NSAI",
        "status": "running"
    }

@app.get("/predict")
def predict():
    return predict_attack()