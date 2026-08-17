import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch


# ============================================================
# PATH CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_DIR = PROJECT_ROOT / "backend" / "ml"

MODEL_PATH = ML_DIR / "intrusion_detector.pth"
SCALER_PATH = ML_DIR / "scaler.joblib"
ENCODER_PATH = ML_DIR / "label_encoder.joblib"
FEATURES_PATH = ML_DIR / "feature_names.joblib"


# ============================================================
# IMPORT MODEL
# ============================================================

sys.path.append(str(ML_DIR))

from train import IntrusionDetector


# ============================================================
# LOAD TRAINING ARTIFACTS
# ============================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model not found:\n{MODEL_PATH}"
    )

if not SCALER_PATH.exists():
    raise FileNotFoundError(
        f"Scaler not found:\n{SCALER_PATH}"
    )

if not ENCODER_PATH.exists():
    raise FileNotFoundError(
        f"Label encoder not found:\n{ENCODER_PATH}"
    )

if not FEATURES_PATH.exists():
    raise FileNotFoundError(
        f"Feature names not found:\n{FEATURES_PATH}"
    )


# Load preprocessing artifacts

scaler = joblib.load(
    SCALER_PATH
)

label_encoder = joblib.load(
    ENCODER_PATH
)

feature_names = joblib.load(
    FEATURES_PATH
)


# ============================================================
# MODEL CONFIGURATION
# ============================================================

input_size = len(feature_names)

num_classes = len(
    label_encoder.classes_
)


# ============================================================
# CREATE MODEL
# ============================================================

model = IntrusionDetector(
    input_size=input_size,
    num_classes=num_classes
)


# ============================================================
# LOAD TRAINED WEIGHTS
# ============================================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=torch.device("cpu"),
    weights_only=True
)


# Support both state_dict and checkpoint formats

if isinstance(checkpoint, dict):

    if "model_state_dict" in checkpoint:

        model.load_state_dict(
            checkpoint["model_state_dict"]
        )

    else:

        model.load_state_dict(
            checkpoint

        )

else:

    model.load_state_dict(
        checkpoint
    )


model.eval()


# ============================================================
# CLASS NAMES
# ============================================================

CLASS_NAMES = {
    index: str(name)
    for index, name
    in enumerate(label_encoder.classes_)
}


# ============================================================
# NORMALIZE ATTACK NAME
# ============================================================

def normalize_attack_name(name):

    if name is None:
        return "Unknown"

    name = str(name).strip()

    if name == "BENIGN":
        return "Normal"

    return name


# ============================================================
# PREPARE INPUT
# ============================================================

def prepare_input(sample):
    """
    Convert incoming prediction data into the exact
    78-feature format used during model training.

    Supported input:

    1. Dictionary
    2. Pandas DataFrame
    3. List / tuple / numpy array
    """

    # --------------------------------------------------------
    # Dictionary
    # --------------------------------------------------------

    if isinstance(sample, dict):

        df = pd.DataFrame(
            [sample]
        )

    # --------------------------------------------------------
    # DataFrame
    # --------------------------------------------------------

    elif isinstance(sample, pd.DataFrame):

        df = sample.copy()

    # --------------------------------------------------------
    # Array / List
    # --------------------------------------------------------

    else:

        array = np.asarray(
            sample,
            dtype=np.float64
        )

        if array.ndim == 1:

            array = array.reshape(
                1,
                -1
            )

        df = pd.DataFrame(
            array
        )


    # --------------------------------------------------------
    # Named feature input
    # --------------------------------------------------------

    if len(df.columns) > 0:

        # If all trained feature names exist,
        # preserve the exact training order.

        if all(
            feature in df.columns
            for feature in feature_names
        ):

            df = df[
                feature_names
            ]

        # Otherwise, if dataframe has the expected
        # number of columns, use positional ordering.

        elif df.shape[1] == input_size:

            df = df.iloc[
                :,
                :input_size
            ]

            df.columns = feature_names

        else:

            missing = [
                feature
                for feature in feature_names
                if feature not in df.columns
            ]

            raise ValueError(
                "Input does not contain the required "
                f"{input_size} features.\n"
                f"Missing features: {missing[:10]}"
            )


    # --------------------------------------------------------
    # Convert everything to numeric
    # --------------------------------------------------------

    for column in feature_names:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )


    # --------------------------------------------------------
    # Handle invalid values
    # --------------------------------------------------------

    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    if df[feature_names].isnull().any().any():

        raise ValueError(
            "Input contains missing or non-numeric "
            "feature values."
        )


    # --------------------------------------------------------
    # Convert to numpy
    # --------------------------------------------------------

    values = df[
        feature_names
    ].values.astype(
        np.float64
    )


    # --------------------------------------------------------
    # Apply SAME scaler used during training
    # --------------------------------------------------------

    scaled = scaler.transform(
        values
    )


    # --------------------------------------------------------
    # Convert to PyTorch tensor
    # --------------------------------------------------------

    tensor = torch.tensor(
        scaled,
        dtype=torch.float32
    )

    return tensor, df


# ============================================================
# ML PREDICTION
# ============================================================

def predict_ml(sample):

    tensor, raw_df = prepare_input(
        sample
    )

    with torch.no_grad():

        outputs = model(
            tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence_values, predictions = (
            torch.max(
                probabilities,
                dim=1
            )
        )


    results = []

    for index in range(
        len(predictions)
    ):

        class_index = int(
            predictions[index].item()
        )

        confidence = float(
            confidence_values[index].item()
        ) * 100


        attack_name = CLASS_NAMES.get(
            class_index,
            "Unknown"
        )


        results.append(
            {
                "prediction": normalize_attack_name(
                    attack_name
                ),
                "confidence": round(
                    confidence,
                    2
                ),
                "class_index": class_index
            }
        )


    return results


# ============================================================
# PUBLIC PREDICTION FUNCTION
# ============================================================

def predict_attack(sample):

    """
    Main prediction function used by FastAPI.

    Returns a single prediction for a single network flow.
    """

    results = predict_ml(
        sample
    )

    result = results[0]

    return {
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "class_index": result["class_index"]
    }


# ============================================================
# BATCH PREDICTION
# ============================================================

def predict_batch(samples):

    """
    Predict multiple network flows.
    """

    results = predict_ml(
        samples
    )

    return results


# ============================================================
# MODEL INFORMATION
# ============================================================

def get_model_info():

    return {
        "model": "AEGIS-NSAI Intrusion Detector",
        "architecture": "Feedforward Neural Network",
        "input_features": input_size,
        "num_classes": num_classes,
        "classes": [
            normalize_attack_name(
                name
            )
            for name
            in label_encoder.classes_
        ],
    }


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AEGIS-NSAI MODEL TEST")
    print("=" * 60)

    print(
        f"\nModel path:\n{MODEL_PATH}"
    )

    print(
        f"\nInput features: {input_size}"
    )

    print(
        f"Number of classes: {num_classes}"
    )

    print("\nClasses:")

    for index, name in CLASS_NAMES.items():

        print(
            f"  {index}: {normalize_attack_name(name)}"
        )

    print(
        "\nModel loaded successfully."
    )