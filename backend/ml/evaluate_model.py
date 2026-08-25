from pathlib import Path
from collections import Counter

import joblib
import numpy as np
import pandas as pd
import torch

from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    classification_report,
    confusion_matrix,
)

from backend.ml.train import IntrusionDetector


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

ML_DIR = PROJECT_ROOT / "backend" / "ml"

MODEL_PATH = ML_DIR / "intrusion_detector.pth"
SCALER_PATH = ML_DIR / "scaler.joblib"
ENCODER_PATH = ML_DIR / "label_encoder.joblib"
FEATURES_PATH = ML_DIR / "feature_names.joblib"

DATASET_DIR = (
    PROJECT_ROOT
    / "datasets"
    / "cic-ids2017"
    / "MachineLearningCVE"
)


# ============================================================
# CONFIGURATION
# ============================================================

BATCH_SIZE = 8192

CSV_FILES = sorted(
    DATASET_DIR.glob("*.csv")
)


# ============================================================
# LOAD PREPROCESSING ARTIFACTS
# ============================================================

print()
print("=" * 70)
print("AEGIS-NSAI MODEL EVALUATION")
print("=" * 70)

print("\nLoading model artifacts...")

scaler = joblib.load(SCALER_PATH)
label_encoder = joblib.load(ENCODER_PATH)
feature_names = joblib.load(FEATURES_PATH)

feature_names = [
    str(feature).strip()
    for feature in feature_names
]

class_names = [
    str(name).strip()
    for name in label_encoder.classes_
]

INPUT_SIZE = len(feature_names)
NUM_CLASSES = len(class_names)


print(f"Features : {INPUT_SIZE}")
print(f"Classes  : {NUM_CLASSES}")

print("\nClasses:")

for index, class_name in enumerate(class_names):
    print(f"  {index}: {class_name}")


# ============================================================
# CREATE MODEL
# ============================================================

print("\nLoading trained model...")

model = IntrusionDetector(
    input_size=INPUT_SIZE,
    num_classes=NUM_CLASSES,
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=True,
)

if isinstance(checkpoint, dict):

    if "model_state_dict" in checkpoint:
        state_dict = checkpoint["model_state_dict"]

    elif "state_dict" in checkpoint:
        state_dict = checkpoint["state_dict"]

    else:
        state_dict = checkpoint

else:

    state_dict = checkpoint


model.load_state_dict(state_dict)
model.eval()

print("Model loaded successfully.")


# ============================================================
# DATA VALIDATION
# ============================================================

if not CSV_FILES:

    raise FileNotFoundError(
        f"No CSV files found in:\n{DATASET_DIR}"
    )


print()
print("=" * 70)
print("DATASET FILES")
print("=" * 70)

print(f"\nFound {len(CSV_FILES)} CSV files:")

for csv_file in CSV_FILES:
    print(f"  - {csv_file.name}")


# ============================================================
# GLOBAL STORAGE
# ============================================================

all_true = []
all_predictions = []
all_confidences = []

total_rows = 0
total_valid_rows = 0


# ============================================================
# EVALUATE ONE FILE
# ============================================================

def evaluate_file(csv_path):

    global total_rows
    global total_valid_rows

    print()
    print("-" * 70)
    print(f"Evaluating: {csv_path.name}")
    print("-" * 70)

    df = pd.read_csv(csv_path)

    total_rows += len(df)

    print(f"Rows loaded: {len(df):,}")

    # --------------------------------------------------------
    # Find label column
    # --------------------------------------------------------

    label_column = None

    for column in df.columns:

        if str(column).strip().lower() == "label":
            label_column = column
            break

    if label_column is None:

        raise ValueError(
            f"No Label column found in {csv_path.name}"
        )

    # --------------------------------------------------------
    # Clean labels
    # --------------------------------------------------------

    labels = (
        df[label_column]
        .astype(str)
        .str.strip()
    )

    # --------------------------------------------------------
    # Prepare feature dataframe
    # --------------------------------------------------------

    feature_df = df.copy()

    feature_df.columns = (
        feature_df.columns
        .astype(str)
        .str.strip()
    )

    # Find cleaned label column again
    cleaned_label_column = None

    for column in feature_df.columns:

        if str(column).strip().lower() == "label":
            cleaned_label_column = column
            break

    if cleaned_label_column is not None:

        feature_df = feature_df.drop(
            columns=[cleaned_label_column]
        )

    # --------------------------------------------------------
    # Check required features
    # --------------------------------------------------------

    missing_features = [
        feature
        for feature in feature_names
        if feature not in feature_df.columns
    ]

    if missing_features:

        raise ValueError(
            f"{csv_path.name} is missing required features:\n"
            f"{missing_features}"
        )

    # --------------------------------------------------------
    # Preserve exact training feature order
    # --------------------------------------------------------

    feature_df = feature_df[
        feature_names
    ].copy()

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    for column in feature_names:

        feature_df[column] = pd.to_numeric(
            feature_df[column],
            errors="coerce",
        )

    # --------------------------------------------------------
    # Remove invalid values
    # --------------------------------------------------------

    feature_df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True,
    )

    valid_mask = (
        ~feature_df.isnull().any(axis=1)
    )

    feature_df = feature_df[
        valid_mask
    ].reset_index(drop=True)

    labels = labels[
        valid_mask
    ].reset_index(drop=True)

    print(
        f"Valid rows: {len(feature_df):,}"
    )

    total_valid_rows += len(feature_df)

    if feature_df.empty:

        print("No valid rows. Skipping.")

        return

    # --------------------------------------------------------
    # Encode labels
    # --------------------------------------------------------

    try:

        y_true = label_encoder.transform(
            labels
        )

    except ValueError as error:

        print(
            "\nERROR: Dataset contains labels "
            "not present in the trained label encoder."
        )

        print(error)

        unknown_labels = sorted(
            set(labels)
            - set(label_encoder.classes_)
        )

        print("\nUnknown labels:")

        for label in unknown_labels:
            print(f"  {repr(label)}")

        raise

    # --------------------------------------------------------
    # Process in batches
    # --------------------------------------------------------

    file_predictions = []
    file_confidences = []

    X_values = feature_df

    for start in range(
        0,
        len(X_values),
        BATCH_SIZE,
    ):

        end = min(
            start + BATCH_SIZE,
            len(X_values),
        )

        batch = X_values.iloc[
            start:end
        ]

        # IMPORTANT:
        # Use the scaler fitted during training.
        X_scaled = scaler.transform(
            batch
        )

        X_tensor = torch.tensor(
            X_scaled,
            dtype=torch.float32,
        )

        with torch.no_grad():

            output = model(
                X_tensor
            )

            probabilities = torch.softmax(
                output,
                dim=1,
            )

            confidence, predictions = torch.max(
                probabilities,
                dim=1,
            )

        file_predictions.extend(
            predictions.numpy()
        )

        file_confidences.extend(
            confidence.numpy()
        )

    file_predictions = np.asarray(
        file_predictions
    )

    file_confidences = np.asarray(
        file_confidences
    )

    # --------------------------------------------------------
    # Store global results
    # --------------------------------------------------------

    all_true.extend(
        y_true
    )

    all_predictions.extend(
        file_predictions
    )

    all_confidences.extend(
        file_confidences
    )

    # --------------------------------------------------------
    # File-level accuracy
    # --------------------------------------------------------

    file_accuracy = accuracy_score(
        y_true,
        file_predictions,
    ) * 100

    print(
        f"File accuracy: {file_accuracy:.2f}%"
    )

    print(
        f"Average confidence: "
        f"{file_confidences.mean() * 100:.2f}%"
    )


# ============================================================
# RUN EVALUATION
# ============================================================

print()
print("=" * 70)
print("RUNNING FULL DATASET EVALUATION")
print("=" * 70)

for csv_file in CSV_FILES:

    evaluate_file(
        csv_file
    )


# ============================================================
# CONVERT RESULTS
# ============================================================

y_true = np.asarray(
    all_true,
    dtype=np.int64,
)

y_pred = np.asarray(
    all_predictions,
    dtype=np.int64,
)

confidences = np.asarray(
    all_confidences,
    dtype=np.float32,
)


# ============================================================
# OVERALL RESULTS
# ============================================================

accuracy = accuracy_score(
    y_true,
    y_pred,
) * 100

precision_macro, recall_macro, f1_macro, _ = (
    precision_recall_fscore_support(
        y_true,
        y_pred,
        labels=np.arange(NUM_CLASSES),
        average="macro",
        zero_division=0,
    )
)

precision_weighted, recall_weighted, f1_weighted, _ = (
    precision_recall_fscore_support(
        y_true,
        y_pred,
        labels=np.arange(NUM_CLASSES),
        average="weighted",
        zero_division=0,
    )
)


print()
print("=" * 70)
print("OVERALL RESULTS")
print("=" * 70)

print(
    f"\nTotal dataset rows : {total_rows:,}"
)

print(
    f"Valid rows used    : {total_valid_rows:,}"
)

print(
    f"\nAccuracy            : {accuracy:.2f}%"
)

print(
    f"Macro Precision     : {precision_macro * 100:.2f}%"
)

print(
    f"Macro Recall        : {recall_macro * 100:.2f}%"
)

print(
    f"Macro F1            : {f1_macro * 100:.2f}%"
)

print(
    f"Weighted Precision  : {precision_weighted * 100:.2f}%"
)

print(
    f"Weighted Recall     : {recall_weighted * 100:.2f}%"
)

print(
    f"Weighted F1         : {f1_weighted * 100:.2f}%"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print()
print("=" * 70)
print("PER-CLASS PERFORMANCE")
print("=" * 70)

report = classification_report(
    y_true,
    y_pred,
    labels=np.arange(NUM_CLASSES),
    target_names=class_names,
    digits=4,
    zero_division=0,
)

print()
print(report)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_true,
    y_pred,
    labels=np.arange(NUM_CLASSES),
)


print()
print("=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

header = "Actual \\ Pred".ljust(32)

for class_name in class_names:
    header += f"{class_name[:12]:>13}"

print()
print(header)

for index, class_name in enumerate(class_names):

    row = (
        class_name[:30].ljust(32)
    )

    for predicted_index in range(NUM_CLASSES):

        row += (
            f"{cm[index, predicted_index]:>13,}"
        )

    print(row)


# ============================================================
# MAJOR MISCLASSIFICATIONS
# ============================================================

print()
print("=" * 70)
print("MAJOR MISCLASSIFICATIONS")
print("=" * 70)

misclassified = (
    y_true != y_pred
)

if not misclassified.any():

    print("\nNo misclassifications found.")

else:

    pairs = Counter(
        zip(
            y_true[misclassified],
            y_pred[misclassified],
        )
    )

    for (
        (actual, predicted),
        count
    ) in pairs.most_common(25):

        print(
            f"{class_names[actual]}"
            f" -> "
            f"{class_names[predicted]}"
            f" : {count:,}"
        )


# ============================================================
# CONFIDENCE
# ============================================================

average_confidence = (
    confidences.mean()
    * 100
)

low_confidence = (
    confidences < 0.70
).mean() * 100

high_confidence = (
    confidences >= 0.90
).mean() * 100


print()
print("=" * 70)
print("CONFIDENCE ANALYSIS")
print("=" * 70)

print(
    f"\nAverage confidence : "
    f"{average_confidence:.2f}%"
)

print(
    f"Confidence < 70%  : "
    f"{low_confidence:.2f}% of predictions"
)

print(
    f"Confidence >= 90% : "
    f"{high_confidence:.2f}% of predictions"
)


# ============================================================
# FINAL
# ============================================================

print()
print("=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)
print()

print(
    "NOTE:"
)

print(
    "This is a full-dataset diagnostic evaluation."
)

print(
    "The current model was trained using CIC-IDS2017 data, "
    "so these results must NOT be reported as an "
    "independent unseen-test accuracy."
)

print()