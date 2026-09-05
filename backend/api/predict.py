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
    Dataset-Level ML Aggregation
      ↓
    Dataset-Level Symbolic Reasoning
      ↓
    Neuro-Symbolic Fusion
      ↓
    Explanation
      ↓
    Knowledge Graph
"""


from pathlib import Path

from collections import Counter

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

    Every uploaded network flow is classified.

    Dataset-level aggregation determines the dominant
    neural prediction.
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
    # CONVERT TENSORS TO NUMPY
    # ========================================================

    prediction_indices = (
        predictions
        .cpu()
        .numpy()
    )


    confidence_array = (
        confidence_values
        .cpu()
        .numpy()
    )


    # ========================================================
    # DATASET VALIDATION
    # ========================================================

    total_rows = int(
        len(prediction_indices)
    )


    if total_rows == 0:

        raise ValueError(
            "Neural network produced no predictions."
        )


    # ========================================================
    # COUNT PREDICTIONS FOR EVERY CLASS
    # ========================================================

    class_counts = np.bincount(
        prediction_indices,
        minlength=NUM_CLASSES,
    )


    # ========================================================
    # DATASET-LEVEL CLASS DISTRIBUTION
    # ========================================================

    class_distribution = {}

    for class_index, count in enumerate(
        class_counts
    ):

        class_name = normalize_attack_name(
            NORMALIZED_CLASS_NAMES.get(
                class_index,
                "Unknown",
            )
        )

        percentage = (
            float(count)
            / total_rows
            * 100
        )

        class_distribution[
            class_name
        ] = round(
            percentage,
            2,
        )


    # ========================================================
    # DATASET-LEVEL CLASS COUNTS
    # ========================================================

    class_counts_dict = {}

    for class_index, count in enumerate(
        class_counts
    ):

        class_name = normalize_attack_name(
            NORMALIZED_CLASS_NAMES.get(
                class_index,
                "Unknown",
            )
        )

        class_counts_dict[
            class_name
        ] = int(count)


    # ========================================================
    # DETERMINE DOMINANT ML CLASS
    # ========================================================

    dominant_class_index = int(
        np.argmax(
            class_counts
        )
    )


    dominant_prediction = normalize_attack_name(
        NORMALIZED_CLASS_NAMES.get(
            dominant_class_index,
            "Unknown",
        )
    )


    dominant_count = int(
        class_counts[
            dominant_class_index
        ]
    )


    dominant_percentage = (
        dominant_count
        / total_rows
        * 100
    )


    # ========================================================
    # DOMINANT CLASS CONFIDENCE
    # ========================================================

    dominant_mask = (
        prediction_indices
        == dominant_class_index
    )


    if dominant_mask.any():

        dominant_confidence = float(
            confidence_array[
                dominant_mask
            ].mean()
        )

    else:

        dominant_confidence = 0.0


    # ========================================================
    # FIRST FLOW INFORMATION
    # ========================================================

    first_class_index = int(
        prediction_indices[0]
    )


    first_confidence = float(
        confidence_array[0]
    )


    first_prediction = normalize_attack_name(
        NORMALIZED_CLASS_NAMES.get(
            first_class_index,
            "Unknown",
        )
    )


    # ========================================================
    # RETURN ML RESULT
    # ========================================================

    return {

        "prediction":
            dominant_prediction,

        "confidence":
            dominant_confidence,

        "class_index":
            dominant_class_index,

        "dominant_count":
            dominant_count,

        "dominant_percentage":
            round(
                dominant_percentage,
                2,
            ),

        "class_distribution":
            class_distribution,

        "class_counts":
            class_counts_dict,

        "first_prediction":
            first_prediction,

        "first_confidence":
            first_confidence,

        "first_class_index":
            first_class_index,

        "predictions":
            prediction_indices,

        "confidence_values":
            confidence_array,

        "clean_df":
            clean_df,

        "rows_processed":
            total_rows,
    }


# ============================================================
# DATASET-LEVEL SYMBOLIC REASONING
# ============================================================

def run_symbolic_prediction(clean_df):
    """
    Run the symbolic rule engine over EVERY network flow.

    IMPORTANT:

    The symbolic engine must not classify an uploaded dataset
    using only its first row.

    Every flow is independently evaluated.

    The final symbolic classification is determined from the
    distribution of symbolic predictions across the dataset.

    This prevents one unusual first flow from incorrectly
    representing the entire uploaded dataset.
    """

    if clean_df is None:

        raise ValueError(
            "No dataframe provided to symbolic engine."
        )


    if clean_df.empty:

        return {

            "prediction":
                "Normal",

            "confidence":
                0.0,

            "support":
                0.0,

            "prediction_counts":
                {},

            "prediction_distribution":
                {},

            "rule_counts":
                {},

            "rule_distribution":
                {},

            "first_prediction":
                "Normal",

            "first_confidence":
                0.0,

            "first_rule_details":
                {},

        }


    # ========================================================
    # STORAGE
    # ========================================================

    prediction_counter = Counter()

    rule_counter = Counter()

    first_prediction = "Normal"

    first_confidence = 0.0

    first_rule_details = {}


    # ========================================================
    # EVALUATE EVERY FLOW
    # ========================================================

    total_rows = len(
        clean_df
    )


    for row_index, row in enumerate(
        clean_df.itertuples(
            index=False,
            name=None,
        )
    ):

        features = dict(
            zip(
                feature_names,
                row,
            )
        )


        # ----------------------------------------------------
        # Symbolic prediction
        # ----------------------------------------------------

        prediction = detect_attack_rules(
            features
        )


        prediction = normalize_attack_name(
            prediction
        )


        prediction_counter[
            prediction
        ] += 1


        # ----------------------------------------------------
        # Rule details
        # ----------------------------------------------------

        details = get_rule_details(
            features
        )


        for rule_name, fired in details.items():

            if fired:

                rule_counter[
                    rule_name
                ] += 1


        # ----------------------------------------------------
        # First flow diagnostics
        # ----------------------------------------------------

        if row_index == 0:

            first_prediction = prediction

            first_confidence = symbolic_confidence(
                features
            )

            first_rule_details = details


    # ========================================================
    # REMOVE UNKNOWN RESULTS
    # ========================================================

    if "Unknown" in prediction_counter:

        del prediction_counter[
            "Unknown"
        ]


    # ========================================================
    # ENSURE NORMAL EXISTS
    # ========================================================

    if not prediction_counter:

        prediction_counter[
            "Normal"
        ] = total_rows


    # ========================================================
    # DETERMINE DOMINANT SYMBOLIC CLASS
    # ========================================================

    dominant_symbolic_prediction, dominant_symbolic_count = (
        prediction_counter.most_common(1)[0]
    )


    dominant_symbolic_percentage = (
        dominant_symbolic_count
        / total_rows
        * 100
    )


    # ========================================================
    # SYMBOLIC PREDICTION DISTRIBUTION
    # ========================================================

    prediction_distribution = {}

    prediction_counts = {}

    for prediction, count in prediction_counter.items():

        prediction_counts[
            prediction
        ] = int(count)

        prediction_distribution[
            prediction
        ] = round(
            count
            / total_rows
            * 100,
            2,
        )


    # ========================================================
    # RULE DISTRIBUTION
    # ========================================================

    rule_counts = {}

    rule_distribution = {}

    for rule_name, count in rule_counter.items():

        rule_counts[
            rule_name
        ] = int(count)

        rule_distribution[
            rule_name
        ] = round(
            count
            / total_rows
            * 100,
            2,
        )


    # ========================================================
    # SYMBOLIC EVIDENCE MODEL
    # ========================================================
    #
    # IMPORTANT:
    #
    # symbolic_confidence() is based on individual-flow
    # rule evidence and must NOT be used as the dataset
    # confidence.
    #
    # For a dataset we use symbolic SUPPORT:
    #
    #     supporting flows / total flows
    #
    # This is deliberately different from statistical
    # probability.
    # ========================================================

    symbolic_support = (
        dominant_symbolic_percentage
    )


    # ========================================================
    # REQUIRE MEANINGFUL DATASET SUPPORT
    # ========================================================
    #
    # A tiny number of symbolic matches should not override
    # a dominant neural prediction.
    #
    # The symbolic engine may still report the strongest
    # symbolic pattern, but fusion receives dataset-level
    # support rather than a misleading 100% single-flow
    # confidence.
    # ========================================================

    if (
        dominant_symbolic_prediction
        == "Normal"
    ):

        symbolic_prediction = "Normal"

    else:

        symbolic_prediction = (
            dominant_symbolic_prediction
        )


    # ========================================================
    # RETURN SYMBOLIC RESULT
    # ========================================================

    return {

        "prediction":
            symbolic_prediction,

        "confidence":
            round(
                symbolic_support,
                2,
            ),

        "support":
            round(
                symbolic_support,
                2,
            ),

        "prediction_counts":
            prediction_counts,

        "prediction_distribution":
            prediction_distribution,

        "rule_counts":
            rule_counts,

        "rule_distribution":
            rule_distribution,

        "first_prediction":
            first_prediction,

        "first_confidence":
            round(
                float(first_confidence),
                2,
            ),

        "first_rule_details":
            first_rule_details,

        "rows_evaluated":
            total_rows,
    }


# ============================================================
# COMPLETE AEGIS-NSAI PIPELINE
# ============================================================

def predict_attack(df, filename=None):
    """
    Execute the complete AEGIS-NSAI pipeline.

    Neural prediction
          +
    Dataset-level symbolic reasoning
          ↓
    Neuro-symbolic fusion
          ↓
    Explanation
          ↓
    Knowledge graph

    Both neural and symbolic components now operate at the
    dataset level.

    The first-flow result is retained only for diagnostics.
    It no longer determines the symbolic classification.
    """

    # ========================================================
    # 1. MACHINE LEARNING
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
    # 2. DATASET-LEVEL SYMBOLIC REASONING
    # ========================================================

    symbolic_result = run_symbolic_prediction(
        clean_df
    )


    rule_prediction = symbolic_result[
        "prediction"
    ]


    rule_confidence = symbolic_result[
        "confidence"
    ]


    rule_support = symbolic_result[
        "support"
    ]


    rule_details = {

        "ddos_rule":
            symbolic_result[
                "rule_counts"
            ].get(
                "ddos_rule",
                0,
            ),

        "dos_rule":
            symbolic_result[
                "rule_counts"
            ].get(
                "dos_rule",
                0,
            ),

        "port_scan_rule":
            symbolic_result[
                "rule_counts"
            ].get(
                "port_scan_rule",
                0,
            ),

        "bruteforce_rule":
            symbolic_result[
                "rule_counts"
            ].get(
                "bruteforce_rule",
                0,
            ),

        "web_attack_rule":
            symbolic_result[
                "rule_counts"
            ].get(
                "web_attack_rule",
                0,
            ),
    }


    # ========================================================
    # 3. NEURO-SYMBOLIC FUSION
    # ========================================================

    final_prediction = fuse_predictions(
        ml_prediction,
        rule_prediction,
        ml_confidence,
        rule_confidence,
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


    # ========================================================
    # 5. SYMBOLIC EXPLANATION
    # ========================================================

    symbolic_explanation = explain_prediction(
        rule_prediction
    )


    # ========================================================
    # 6. KNOWLEDGE GRAPH
    # ========================================================

    knowledge_graph = get_attack_context(
        final_prediction
    )


    # ========================================================
    # 7. FINAL RESULT
    # ========================================================

    result = {

        # ----------------------------------------------------
        # Analysis metadata
        # ----------------------------------------------------

        "filename":
            filename or "Uploaded network dataset",

        "analysis_type":
            "Dataset-level network-flow analysis",

        # ----------------------------------------------------
        # Final prediction
        # ----------------------------------------------------

        "prediction":
            final_prediction,


        # ----------------------------------------------------
        # Final confidence
        # ----------------------------------------------------

        "confidence":
            explanation.get(
                "confidence",
                round(
                    ml_confidence * 100,
                    2,
                ),
            ),


        # ====================================================
        # DATASET-LEVEL ML
        # ====================================================

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

        "ml_dominant_count":
            ml_result[
                "dominant_count"
            ],

        "ml_dominant_percentage":
            ml_result[
                "dominant_percentage"
            ],

        "ml_class_distribution":
            ml_result[
                "class_distribution"
            ],

        "ml_class_counts":
            ml_result[
                "class_counts"
            ],


        # ====================================================
        # FIRST FLOW ML DIAGNOSTICS
        # ====================================================

        "first_flow_prediction":
            ml_result[
                "first_prediction"
            ],

        "first_flow_confidence":
            round(
                ml_result[
                    "first_confidence"
                ] * 100,
                2,
            ),


        # ====================================================
        # DATASET-LEVEL SYMBOLIC RESULT
        # ====================================================

        "rule_prediction":
            rule_prediction,

        "symbolic_confidence":
            round(
                rule_confidence,
                2,
            ),

        "symbolic_support":
            round(
                rule_support,
                2,
            ),

        "symbolic_prediction_counts":
            symbolic_result[
                "prediction_counts"
            ],

        "symbolic_prediction_distribution":
            symbolic_result[
                "prediction_distribution"
            ],

        "symbolic_rule_counts":
            symbolic_result[
                "rule_counts"
            ],

        "symbolic_rule_distribution":
            symbolic_result[
                "rule_distribution"
            ],

        "rule_details":
            rule_details,


        # ====================================================
        # FIRST FLOW SYMBOLIC DIAGNOSTICS
        # ====================================================

        "first_flow_symbolic_prediction":
            symbolic_result[
                "first_prediction"
            ],

        "first_flow_symbolic_confidence":
            symbolic_result[
                "first_confidence"
            ],

        "first_flow_rule_details":
            symbolic_result[
                "first_rule_details"
            ],


        # ====================================================
        # EXPLANATIONS
        # ====================================================

        "message":
            explanation.get(
                "message",
                "Prediction generated successfully.",
            ),

        "symbolic_explanation":
            symbolic_explanation,


        # ====================================================
        # KNOWLEDGE GRAPH
        # ====================================================

        "knowledge_graph":
            knowledge_graph,


        # ====================================================
        # SYSTEM INFORMATION
        # ====================================================

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

        "symbolic_rows_evaluated":
            symbolic_result[
                "rows_evaluated"
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
        f"Rows Processed          : "
        f"{ml_result['rows_processed']:,}"
    )


    print(
        f"ML Prediction           : "
        f"{ml_prediction}"
    )


    print(
        f"ML Confidence           : "
        f"{ml_confidence * 100:.2f}%"
    )


    print(
        f"ML Dominant Share       : "
        f"{ml_result['dominant_percentage']:.2f}%"
    )


    print(
        f"First Flow ML           : "
        f"{ml_result['first_prediction']}"
    )


    print(
        f"Symbolic Prediction     : "
        f"{rule_prediction}"
    )


    print(
        f"Symbolic Dataset Support: "
        f"{rule_support:.2f}%"
    )


    print(
        f"Symbolic Rows Evaluated : "
        f"{symbolic_result['rows_evaluated']:,}"
    )


    print(
        f"Final Prediction        : "
        f"{final_prediction}"
    )


    print(
        f"Knowledge Graph         : "
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