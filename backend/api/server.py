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
    version="1.0.0",
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
        "version": "1.0.0",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "AEGIS-NSAI API",
        "model_loaded": True,
        "architecture": "Neuro-Symbolic AI",
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/model-info")
def model_info():

    from backend.api.predict import get_model_info

    return get_model_info()


# ============================================================
# CSV VALIDATION
# ============================================================

def validate_uploaded_csv(
    file: UploadFile,
    dataframe: pd.DataFrame,
):
    """
    Validate the uploaded file and dataframe before
    passing the data into the AEGIS-NSAI prediction pipeline.
    """

    # --------------------------------------------------------
    # Filename validation
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was uploaded.",
        )


    filename = file.filename.strip()


    if not filename:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no valid filename.",
        )


    # --------------------------------------------------------
    # File type validation
    # --------------------------------------------------------

    if not filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )


    # --------------------------------------------------------
    # Empty dataframe validation
    # --------------------------------------------------------

    if dataframe.empty:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV is empty.",
        )


    # --------------------------------------------------------
    # Column validation
    # --------------------------------------------------------

    if len(dataframe.columns) == 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV does not contain any columns.",
        )


    # --------------------------------------------------------
    # Blank-row validation
    # --------------------------------------------------------

    non_empty_rows = (
        dataframe
        .dropna(
            how="all"
        )
        .shape[0]
    )


    if non_empty_rows == 0:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV contains no usable data rows.",
        )


    # --------------------------------------------------------
    # Column name validation
    # --------------------------------------------------------

    cleaned_columns = [
        str(column).strip()
        for column in dataframe.columns
    ]


    if any(
        not column
        for column in cleaned_columns
    ):

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV contains an empty column name.",
        )


    # --------------------------------------------------------
    # Duplicate column validation
    # --------------------------------------------------------

    if len(
        set(
            column.lower()
            for column in cleaned_columns
        )
    ) != len(cleaned_columns):

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV contains duplicate column names.",
        )


    # --------------------------------------------------------
    # Normalize column names
    # --------------------------------------------------------

    dataframe.columns = cleaned_columns


    return dataframe


# ============================================================
# PREDICTION
# ============================================================

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
):

    # --------------------------------------------------------
    # Basic filename validation
    # --------------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was uploaded.",
        )


    filename = file.filename.strip()


    if not filename:

        raise HTTPException(
            status_code=400,
            detail="Uploaded file has no valid filename.",
        )


    # --------------------------------------------------------
    # File type validation
    # --------------------------------------------------------

    if not filename.lower().endswith(".csv"):

        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported.",
        )


    # --------------------------------------------------------
    # Read CSV
    # --------------------------------------------------------

    try:

        df = pd.read_csv(
            file.file
        )

    except pd.errors.EmptyDataError:

        raise HTTPException(
            status_code=400,
            detail="Uploaded CSV contains no data.",
        )

    except pd.errors.ParserError as error:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to parse CSV file: {error}",
        )

    except UnicodeDecodeError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Unable to decode CSV file. "
                "Please upload a UTF-8 compatible CSV."
            ),
        )

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=f"Unable to read CSV file: {error}",
        )


    # --------------------------------------------------------
    # Validate dataframe
    # --------------------------------------------------------

    df = validate_uploaded_csv(
        file,
        df,
    )


    # --------------------------------------------------------
    # Run AEGIS-NSAI
    # --------------------------------------------------------

    try:

        result = predict_attack(
            df,
            filename=file.filename.strip(),
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except KeyError as error:

        raise HTTPException(
            status_code=400,
            detail=(
                "Uploaded CSV is missing a required "
                f"feature column: {error}"
            ),
        )

    except Exception as error:

        print(
            "\nAEGIS-NSAI prediction error:"
        )

        print(error)

        raise HTTPException(
            status_code=500,
            detail=(
                "Prediction failed while processing "
                "the uploaded dataset."
            ),
        )