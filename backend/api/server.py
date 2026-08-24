from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from backend.api.predict import predict_attack


# ============================================================
# AEGIS-NSAI FASTAPI SERVER
# ============================================================

app = FastAPI(
    title="AEGIS-NSAI",
    description="Neuro-Symbolic AI Intrusion Detection System",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "http://localhost:5175",
        "http://127.0.0.1:5175",

        "http://localhost:5176",
        "http://127.0.0.1:5176",

        "http://localhost:5177",
        "http://127.0.0.1:5177",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def home():

    return {
        "project": "AEGIS-NSAI",
        "status": "running",
        "architecture": "Neuro-Symbolic AI",
        "version": "1.0.0"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "AEGIS-NSAI API"
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    from backend.api.predict import get_model_info

    return get_model_info()


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was uploaded."
        )


    if not file.filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported."
        )


    # --------------------------------------------------------
    # Read CSV
    # --------------------------------------------------------

    try:

        df = pd.read_csv(
            file.file
        )

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV file: {error}"
        )


    # --------------------------------------------------------
    # Validate dataset
    # --------------------------------------------------------

    if df.empty:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV is empty."
        )


    # --------------------------------------------------------
    # Run AEGIS-NSAI
    # --------------------------------------------------------

    try:

        result = predict_attack(
            df
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        print(
            "\nAEGIS-NSAI prediction error:"
        )

        print(error)

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {error}"
        )