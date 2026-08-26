"""
AEGIS-NSAI Prediction Pipeline

Neuro-Symbolic AI Intrusion Detection System

Pipeline:

    CSV
      ↓
    Data Validation / Cleaning
      ↓
    Feature Alignment
      ↓
    Scaler
      ↓
    Neural Network
      ↓
    Symbolic Rule Engine
      ↓
    Neuro-Symbolic Fusion
      ↓
    Explanation
      ↓
    Knowledge Graph
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch


# ============================================================
# PROJECT PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_DIR = PROJECT_ROOT / "backend" / "ml"

MODEL_PATH = ML_DIR / "intrusion_detector.pth"
SCALER_PATH = ML_DIR / "scaler.joblib"
ENCODER_PATH = ML_DIR / "label_encoder.joblib"
FEATURES_PATH = ML_DIR / "feature_names.joblib"


# ============================================================
# IMPORT TRAINED MODEL
# ============================================================

from backend.ml.train import IntrusionDetector


# ============================================================
# IMPORT AEGIS-NSAI MODULES
# ============================================================

from backend.explainability.explainer import (
    generate_explanation,
)

from backend.knowledge_graph.graph_builder import (
    get_attack_context,
)

from backend.symbolic.fusion import (
    fuse_predictions,
)

from backend.symbolic.rule_engine import (
    detect_attack_rules,
    get_rule_details,
    symbolic_confidence,
    explain_prediction,
)


# ============================================================
# VERIFY REQUIRED MODEL ARTIFACTS
# ============================================================

REQUIRED_FILES = {
    "Model": MODEL_PATH,
    "Scaler": SCALER_PATH,
    "Label encoder": ENCODER_PATH,
    "Feature names": FEATURES_PATH,
}


for artifact_name, artifact_path in REQUIRED_FILES.items():

    if not artifact_path.exists():

        raise FileNotFoundError(
            f"{artifact_name} file not found:\n"
            f"{artifact_path}"
        )


# ============================================================
# LOAD TRAINING ARTIFACTS
# ============================================================

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
# VALIDATE FEATURE ARTIFACT
# ============================================================

if feature_names is None:

    raise ValueError(
        "feature_names.joblib returned None."
    )


feature_names = [
    str(feature).strip()
    for feature in feature_names
]


if len(feature_names) == 0:

    raise ValueError(
        "No feature names were found."
    )


if len(set(feature_names)) != len(feature_names):

    raise ValueError(
        "feature_names.joblib contains duplicate "
        "feature names."
    )


# ============================================================
# MODEL CONFIGURATION
# ============================================================

INPUT_SIZE = len(
    feature_names
)

NUM_CLASSES = len(
    label_encoder.classes_
)


# ============================================================
# VALIDATE SCALER
# ============================================================

if hasattr(scaler, "n_features_in_"):

    scaler_features = int(
        scaler.n_features_in_
    )

    if scaler_features != INPUT_SIZE:

        raise ValueError(
            "Scaler/model feature mismatch.\n"
            f"Feature names: {INPUT_SIZE}\n"
            f"Scaler expects: {scaler_features}"
        )


# ============================================================
# VALIDATE SCALER FEATURE NAMES
# ============================================================

if hasattr(scaler, "feature_names_in_"):

    scaler_feature_names = [
        str(feature).strip()
        for feature in scaler.feature_names_in_
    ]

    if scaler_feature_names != feature_names:

        raise ValueError(
            "Scaler feature names do not exactly match "
            "feature_names.joblib.\n\n"
            "This can cause incorrect feature scaling."
        )


# ============================================================
# CREATE MODEL
# ============================================================

model = IntrusionDetector(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES,
)


# ============================================================
# LOAD TRAINED MODEL
# ============================================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)


# ============================================================
# SUPPORT COMMON CHECKPOINT FORMATS
# ============================================================

if isinstance(checkpoint, dict):

    if "model_state_dict" in checkpoint:

        state_dict = checkpoint[
            "model_state_dict"
        ]

    elif "state_dict" in checkpoint:

        state_dict = checkpoint[
            "state_dict"
        ]

    else:

        state_dict = checkpoint

else:

    state_dict = checkpoint


# ============================================================
# LOAD MODEL WEIGHTS
# ============================================================

model.load_state_dict(
    state_dict
)


# ============================================================
# EVALUATION MODE
# ============================================================

model.eval()


# ============================================================
# CLASS MAPPING
# ============================================================

CLASS_NAMES = {
    index: str(name).strip()
    for index, name
    in enumerate(
        label_encoder.classes_
    )
}


# ============================================================
# ATTACK NAME NORMALIZATION
# ============================================================

def normalize_attack_name(name):
    """
    Convert dataset/model attack labels into the
    canonical names used by AEGIS-NSAI.
    """

    if name is None:

        return "Unknown"

    name = str(name).strip()

    if not name:

        return "Unknown"

    # --------------------------------------------------------
    # BENIGN
    # --------------------------------------------------------

    if name.upper() == "BENIGN":

        return "Normal"

    # --------------------------------------------------------
    # Common encoding/mojibake variants
    # --------------------------------------------------------

    replacements = {

        "Web Attack � Brute Force":
            "Web Attack - Brute Force",

        "Web Attack � Sql Injection":
            "Web Attack - Sql Injection",

        "Web Attack � XSS":
            "Web Attack - XSS",

        "Web Attack – Brute Force":
            "Web Attack - Brute Force",

        "Web Attack – Sql Injection":
            "Web Attack - Sql Injection",

        "Web Attack – XSS":
            "Web Attack - XSS",

        "Web Attack — Brute Force":
            "Web Attack - Brute Force",

        "Web Attack — Sql Injection":
            "Web Attack - Sql Injection",

        "Web Attack — XSS":
            "Web Attack - XSS",
    }

    return replacements.get(
        name,
        name
    )


# ============================================================
# NORMALIZED CLASS NAMES
# ============================================================

NORMALIZED_CLASS_NAMES = {

    index:
        normalize_attack_name(name)

    for index, name
    in CLASS_NAMES.items()
}


# ============================================================
# DATAFRAME PREPARATION
# ============================================================

def prepare_dataframe(df):
    """
    Validate and prepare an uploaded network-flow dataframe.

    The dataframe is transformed into exactly the same
    feature structure used during model training.
    """

    # --------------------------------------------------------
    # Validate input
    # --------------------------------------------------------

    if df is None:

        raise ValueError(
            "No dataset was provided."
        )


    # --------------------------------------------------------
    # Validate dataframe type
    # --------------------------------------------------------

    if not isinstance(
        df,
        pd.DataFrame
    ):

        raise TypeError(
            "Input must be a pandas DataFrame."
        )


    # --------------------------------------------------------
    # Validate dataframe is not empty
    # --------------------------------------------------------

    if df.empty:

        raise ValueError(
            "Uploaded CSV is empty."
        )


    # --------------------------------------------------------
    # Work on a copy
    # --------------------------------------------------------

    df = df.copy()


    # ========================================================
    # CLEAN COLUMN NAMES
    # ========================================================

    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
    )


    # ========================================================
    # REMOVE COMMON LABEL COLUMNS
    # ========================================================

    label_columns = []

    for column in df.columns:

        normalized_column = (
            str(column)
            .strip()
            .lower()
        )

        if normalized_column in {
            "label",
            "target",
            "class",
        }:

            label_columns.append(
                column
            )


    if label_columns:

        df = df.drop(
            columns=label_columns
        )


    # ========================================================
    # CHECK REQUIRED FEATURES
    # ========================================================

    missing_features = [

        feature

        for feature
        in feature_names

        if feature not in df.columns
    ]


    if missing_features:

        preview = (
            missing_features[:15]
        )

        raise ValueError(
            "Uploaded CSV is missing required "
            "model features.\n\n"
            f"Expected features: {INPUT_SIZE}\n"
            f"Missing features: {len(missing_features)}\n\n"
            f"Examples:\n{preview}"
        )


    # ========================================================
    # KEEP ONLY TRAINING FEATURES
    # ========================================================

    df = df[
        feature_names
    ].copy()


    # ========================================================
    # CONVERT FEATURES TO NUMERIC
    # ========================================================

    for column in feature_names:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )


    # ========================================================
    # REPLACE INFINITY VALUES
    # ========================================================

    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True,
    )


    # ========================================================
    # DETECT INVALID ROWS
    # ========================================================

    invalid_rows = int(
        df.isnull()
        .any(axis=1)
        .sum()
    )


    # ========================================================
    # REMOVE INVALID ROWS
    # ========================================================

    if invalid_rows > 0:

        print(
            f"[AEGIS-NSAI] Removing "
            f"{invalid_rows:,} invalid row(s)."
        )

        df = (
            df
            .dropna()
            .reset_index(drop=True)
        )


    # ========================================================
    # ENSURE VALID ROWS REMAIN
    # ========================================================

    if df.empty:

        raise ValueError(
            "No valid network-flow rows remain "
            "after data cleaning."
        )


    # ========================================================
    # FINAL NUMERIC VALIDATION
    # ========================================================

    values = df.to_numpy(
        dtype=np.float64
    )


    if not np.isfinite(
        values
    ).all():

        raise ValueError(
            "Uploaded CSV contains non-finite "
            "numeric values after cleaning."
        )


    # ========================================================
    # FINAL FEATURE COUNT VALIDATION
    # ========================================================

    if df.shape[1] != INPUT_SIZE:

        raise ValueError(
            "Feature count mismatch after preprocessing.\n"
            f"Expected: {INPUT_SIZE}\n"
            f"Received: {df.shape[1]}"
        )


    return df


# ============================================================
# MACHINE LEARNING PREDICTION
# ============================================================

def run_ml_prediction(df):
    """
    Run the neural-network component of AEGIS-NSAI.
    """

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    clean_df = prepare_dataframe(
        df
    )


    # --------------------------------------------------------
    # Apply exact training scaler
    # --------------------------------------------------------

    X_scaled = scaler.transform(
        clean_df
    )


    # --------------------------------------------------------
    # Validate scaler output
    # --------------------------------------------------------

    if not np.isfinite(
        X_scaled
    ).all():

        raise ValueError(
            "Scaler produced non-finite values."
        )


    # --------------------------------------------------------
    # Convert to PyTorch tensor
    # --------------------------------------------------------

    X_tensor = torch.tensor(
        X_scaled,
        dtype=torch.float32,
    )


    # ========================================================
    # NEURAL NETWORK INFERENCE
    # ========================================================

    with torch.no_grad():

        output = model(
            X_tensor
        )

        probabilities = torch.softmax(
            output,
            dim=1,
        )

        confidence_values, predictions = (
            torch.max(
                probabilities,
                dim=1,
            )
        )


    # ========================================================
    # FIRST FLOW
    # ========================================================

    class_index = int(
        predictions[0].item()
    )


    confidence = float(
        confidence_values[0].item()
    )


    attack_name = normalize_attack_name(
        NORMALIZED_CLASS_NAMES.get(
            class_index,
            "Unknown",
        )
    )


    # ========================================================
    # RETURN ML RESULT
    # ========================================================

    return {

        "prediction":
            attack_name,

        "confidence":
            confidence,

        "class_index":
            class_index,

        "probabilities":
            probabilities[0].tolist(),

        "clean_df":
            clean_df,

        "rows_processed":
            int(
                len(clean_df)
            ),
    }


# ============================================================
# COMPLETE AEGIS-NSAI PIPELINE
# ============================================================

def predict_attack(df):
    """
    Execute the complete Neuro-Symbolic AI pipeline.

    Neural prediction
          +
    Symbolic reasoning
          ↓
    Neuro-symbolic fusion
          ↓
    Explanation
          ↓
    Knowledge graph
    """

    # ========================================================
    # 1. NEURAL NETWORK
    # ========================================================

    ml_result = run_ml_prediction(
        df
    )


    ml_prediction = ml_result[
        "prediction"
    ]


    ml_confidence = ml_result[
        "confidence"
    ]


    clean_df = ml_result[
        "clean_df"
    ]


    # ========================================================
    # 2. SYMBOLIC REASONING
    # ========================================================

    # Current architecture performs symbolic reasoning
    # using the first uploaded network-flow record.

    first_row = (
        clean_df
        .iloc[0]
        .to_dict()
    )


    # --------------------------------------------------------
    # Rule engine prediction
    # --------------------------------------------------------

    rule_prediction = detect_attack_rules(
        first_row
    )


    rule_prediction = normalize_attack_name(
        rule_prediction
    )


    # --------------------------------------------------------
    # Rule details
    # --------------------------------------------------------

    rule_details = get_rule_details(
        first_row
    )


    # --------------------------------------------------------
    # Symbolic confidence/evidence
    # --------------------------------------------------------

    rule_confidence = symbolic_confidence(
        first_row
    )


    # ========================================================
    # 3. NEURO-SYMBOLIC FUSION
    # ========================================================

    final_prediction = fuse_predictions(
        ml_prediction,
        rule_prediction,
    )


    final_prediction = normalize_attack_name(
        final_prediction
    )


    # ========================================================
    # 4. EXPLANATION
    # ========================================================

    explanation = generate_explanation(
    final_prediction=final_prediction,
    ml_prediction=ml_prediction,
    ml_confidence=ml_confidence,
    rule_prediction=rule_prediction,
    symbolic_confidence=rule_confidence,
)


    symbolic_explanation = explain_prediction(
        rule_prediction
    )


    # ========================================================
    # 5. KNOWLEDGE GRAPH
    # ========================================================

    knowledge_graph = get_attack_context(
        final_prediction
    )


    # ========================================================
    # 6. FINAL RESPONSE
    # ========================================================

    result = {

        # ----------------------------------------------------
        # Final prediction
        # ----------------------------------------------------

        "prediction":
            final_prediction,


        # ----------------------------------------------------
        # Final confidence
        #
        # IMPORTANT:
        # This currently represents ML confidence.
        # Symbolic evidence is exposed separately.
        # ----------------------------------------------------

        "confidence":
            explanation.get(
                "confidence",
                round(
                    ml_confidence * 100,
                    2,
                ),
            ),


        # ----------------------------------------------------
        # Neural-network result
        # ----------------------------------------------------

        "ml_prediction":
            ml_prediction,


        "ml_confidence":
            round(
                ml_confidence * 100,
                2,
            ),


        "ml_class_index":
            ml_result[
                "class_index"
            ],


        # ----------------------------------------------------
        # Symbolic result
        # ----------------------------------------------------

        "rule_prediction":
            rule_prediction,


        "symbolic_confidence":
            rule_confidence,


        "rule_details":
            rule_details,


        # ----------------------------------------------------
        # Explanations
        # ----------------------------------------------------

        "message":
            explanation.get(
                "message",
                "Prediction generated successfully.",
            ),


        "symbolic_explanation":
            symbolic_explanation,


        # ----------------------------------------------------
        # Knowledge graph
        # ----------------------------------------------------

        "knowledge_graph":
            knowledge_graph,


        # ----------------------------------------------------
        # System information
        # ----------------------------------------------------

        "model":
            "AEGIS-NSAI",


        "architecture":
            "Neuro-Symbolic AI",


        "input_features":
            INPUT_SIZE,


        "num_classes":
            NUM_CLASSES,


        "rows_processed":
            ml_result[
                "rows_processed"
            ],
    }


    # ========================================================
    # TERMINAL OUTPUT
    # ========================================================

    print()

    print(
        "=" * 70
    )

    print(
        "AEGIS-NSAI NEURO-SYMBOLIC PREDICTION"
    )

    print(
        "=" * 70
    )


    print(
        f"Rows Processed      : "
        f"{ml_result['rows_processed']}"
    )


    print(
        f"ML Prediction       : "
        f"{ml_prediction}"
    )


    print(
        f"ML Confidence       : "
        f"{ml_confidence * 100:.2f}%"
    )


    print(
        f"Symbolic Prediction : "
        f"{rule_prediction}"
    )


    try:

        symbolic_percentage = float(
            rule_confidence
        )

        print(
            f"Symbolic Evidence   : "
            f"{symbolic_percentage:.2f}%"
        )

    except (
        TypeError,
        ValueError,
    ):

        print(
            f"Symbolic Evidence   : "
            f"{rule_confidence}"
        )


    print(
        f"Final Prediction    : "
        f"{final_prediction}"
    )


    print(
        f"Knowledge Graph     : "
        f"{knowledge_graph}"
    )


    print(
        "=" * 70
    )

    print()


    return result


# ============================================================
# MODEL INFORMATION
# ============================================================

def get_model_info():
    """
    Return information about the loaded AEGIS-NSAI model.
    """

    return {

        "model":
            "AEGIS-NSAI Intrusion Detector",

        "architecture":
            "Neuro-Symbolic AI",

        "input_features":
            INPUT_SIZE,

        "num_classes":
            NUM_CLASSES,

        "classes": [

            normalize_attack_name(
                name
            )

            for name
            in label_encoder.classes_

        ],
    }


# ============================================================
# LOCAL MODEL TEST
# ============================================================

if __name__ == "__main__":

    print()

    print(
        "=" * 70
    )

    print(
        "AEGIS-NSAI MODEL TEST"
    )

    print(
        "=" * 70
    )


    print(
        f"\nProject root:\n"
        f"{PROJECT_ROOT}"
    )


    print(
        f"\nModel path:\n"
        f"{MODEL_PATH}"
    )


    print(
        f"\nScaler path:\n"
        f"{SCALER_PATH}"
    )


    print(
        f"\nLabel encoder path:\n"
        f"{ENCODER_PATH}"
    )


    print(
        f"\nFeature names path:\n"
        f"{FEATURES_PATH}"
    )


    print(
        f"\nInput features: "
        f"{INPUT_SIZE}"
    )


    print(
        f"Number of classes: "
        f"{NUM_CLASSES}"
    )


    print(
        "\nClasses:"
    )


    for index, name in CLASS_NAMES.items():

        print(
            f"  {index}: "
            f"{normalize_attack_name(name)}"
        )


    print(
        "\nModel loaded successfully."
    )


    print(
        "AEGIS-NSAI is ready."
    )


    print(
        "=" * 70
    )

    print()