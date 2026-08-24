from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch

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


DATASET_PATH = (
    PROJECT_ROOT
    / "datasets"
    / "cic-ids2017"
    / "MachineLearningCVE"
    / "Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"
)


# ============================================================
# LOAD ARTIFACTS
# ============================================================

scaler = joblib.load(SCALER_PATH)
label_encoder = joblib.load(ENCODER_PATH)
feature_names = joblib.load(FEATURES_PATH)


feature_names = [
    str(feature).strip()
    for feature in feature_names
]


INPUT_SIZE = len(feature_names)
NUM_CLASSES = len(label_encoder.classes_)


# ============================================================
# CREATE MODEL
# ============================================================

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


# ============================================================
# LOAD DATA
# ============================================================

print()
print("=" * 70)
print("AEGIS-NSAI MODEL EVALUATION")
print("=" * 70)

print(f"\nDataset:")
print(DATASET_PATH)

df = pd.read_csv(DATASET_PATH)


print(f"\nTotal dataset rows: {len(df):,}")


# ============================================================
# LABEL COLUMN
# ============================================================

label_column = None

for column in df.columns:

    if str(column).strip().lower() == "label":
        label_column = column
        break


if label_column is None:

    raise ValueError(
        "Could not find the Label column."
    )


# ============================================================
# CLEAN LABELS
# ============================================================

labels = (
    df[label_column]
    .astype(str)
    .str.strip()
)


# ============================================================
# PREPARE FEATURES
# ============================================================

feature_df = df.copy()


feature_df.columns = (
    feature_df.columns
    .astype(str)
    .str.strip()
)


if label_column in feature_df.columns:
    feature_df = feature_df.drop(
        columns=[label_column]
    )


# Check missing features

missing_features = [
    feature
    for feature in feature_names
    if feature not in feature_df.columns
]


if missing_features:

    raise ValueError(
        "Dataset is missing required features:\n"
        f"{missing_features}"
    )


feature_df = feature_df[
    feature_names
].copy()


# ============================================================
# NUMERIC CONVERSION
# ============================================================

for column in feature_names:

    feature_df[column] = pd.to_numeric(
        feature_df[column],
        errors="coerce",
    )


# ============================================================
# REMOVE INVALID ROWS
# ============================================================

feature_df.replace(
    [np.inf, -np.inf],
    np.nan,
    inplace=True,
)


valid_mask = ~feature_df.isnull().any(axis=1)


feature_df = feature_df[
    valid_mask
].reset_index(drop=True)


labels = labels[
    valid_mask
].reset_index(drop=True)


print(
    f"Valid rows used: {len(feature_df):,}"
)


# ============================================================
# SCALE
# ============================================================

X = scaler.transform(
    feature_df
)


X_tensor = torch.tensor(
    X,
    dtype=torch.float32,
)


# ============================================================
# ENCODE TRUE LABELS
# ============================================================

y_true = label_encoder.transform(
    labels
)


# ============================================================
# MODEL PREDICTION
# ============================================================

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


predictions = predictions.numpy()
confidence = confidence.numpy()


# ============================================================
# OVERALL ACCURACY
# ============================================================

accuracy = (
    predictions == y_true
).mean() * 100


print()
print("=" * 70)
print("OVERALL RESULTS")
print("=" * 70)

print(
    f"\nAccuracy: {accuracy:.2f}%"
)


# ============================================================
# CLASS RESULTS
# ============================================================

print()
print("=" * 70)
print("CLASS PERFORMANCE")
print("=" * 70)


class_names = [
    str(name).strip()
    for name in label_encoder.classes_
]


for index, class_name in enumerate(class_names):

    mask = y_true == index

    total = int(mask.sum())

    if total == 0:
        continue

    correct = int(
        (predictions[mask] == index).sum()
    )

    class_accuracy = (
        correct / total
    ) * 100

    print(
        f"{class_name:<30}"
        f"{correct:>6}/{total:<6}"
        f"{class_accuracy:>8.2f}%"
    )


# ============================================================
# CONFUSION PAIRS
# ============================================================

print()
print("=" * 70)
print("MAJOR MISCLASSIFICATIONS")
print("=" * 70)


misclassified = predictions != y_true


if not misclassified.any():

    print("\nNo misclassifications found.")

else:

    pairs = {}

    for actual, predicted in zip(
        y_true[misclassified],
        predictions[misclassified],
    ):

        key = (
            int(actual),
            int(predicted)
        )

        pairs[key] = (
            pairs.get(key, 0) + 1
        )


    sorted_pairs = sorted(
        pairs.items(),
        key=lambda item: item[1],
        reverse=True,
    )


    for (
        (actual, predicted),
        count
    ) in sorted_pairs[:15]:

        print(
            f"{class_names[actual]}"
            f" -> "
            f"{class_names[predicted]}"
            f" : {count}"
        )


# ============================================================
# CONFIDENCE
# ============================================================

average_confidence = (
    confidence.mean()
    * 100
)


print()
print("=" * 70)
print("CONFIDENCE")
print("=" * 70)

print(
    f"\nAverage prediction confidence: "
    f"{average_confidence:.2f}%"
)


print()
print("=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)
print()