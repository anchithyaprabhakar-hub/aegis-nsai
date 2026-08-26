from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    precision_recall_fscore_support,
)
from sklearn.model_selection import train_test_split

from .preprocess import load_dataset, clean_dataset
from .feature_engineering import prepare_training_dataset, fit_training_scaler
from .train import IntrusionDetector


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "intrusion_detector.pth"
SCALER_PATH = BASE_DIR / "scaler.joblib"
ENCODER_PATH = BASE_DIR / "label_encoder.joblib"
FEATURES_PATH = BASE_DIR / "feature_names.joblib"


# ============================================================
# SPLIT CONFIGURATION
# ============================================================

TEST_SIZE = 0.15
VALIDATION_SIZE = 0.15
RANDOM_STATE = 42


# ============================================================
# MAIN
# ============================================================

def evaluate_test_set():

    print("=" * 70)
    print("AEGIS-NSAI INDEPENDENT TEST EVALUATION")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Load model artifacts
    # --------------------------------------------------------

    print("\n[1/7] Loading model artifacts...")

    scaler = joblib.load(SCALER_PATH)
    encoder = joblib.load(ENCODER_PATH)
    feature_names = joblib.load(FEATURES_PATH)

    num_classes = len(encoder.classes_)
    input_size = len(feature_names)

    print(f"Features : {input_size}")
    print(f"Classes  : {num_classes}")

    print("\nClasses:")

    for index, class_name in enumerate(encoder.classes_):
        print(f"  {index}: {class_name}")

    # --------------------------------------------------------
    # 2. Load and clean dataset
    # --------------------------------------------------------

    print("\n[2/7] Loading CIC-IDS2017 dataset...")

    df = load_dataset()

    print(f"Raw dataset rows: {len(df):,}")

    df = clean_dataset(df)

    print(f"Cleaned dataset rows: {len(df):,}")

    # --------------------------------------------------------
    # 3. Prepare features
    # --------------------------------------------------------

    print("\n[3/7] Preparing features...")

    X, y, dataset_encoder, dataset_feature_names = (
        prepare_training_dataset(df)
    )

    # --------------------------------------------------------
    # Verify artifacts match dataset
    # --------------------------------------------------------

    if list(dataset_feature_names) != list(feature_names):

        raise ValueError(
            "Feature mismatch between the trained model artifacts "
            "and the current dataset."
        )

    if list(dataset_encoder.classes_) != list(encoder.classes_):

        raise ValueError(
            "Label encoder mismatch between the trained model "
            "and the current dataset."
        )

    print(f"Features prepared: {X.shape[1]}")
    print(f"Samples available: {X.shape[0]:,}")

    # --------------------------------------------------------
    # 4. Reproduce EXACT train/validation/test split
    # --------------------------------------------------------

    print(
        "\n[4/7] Reproducing train/validation/test split..."
    )

    X_temp, X_test, y_temp, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y
    )

    validation_fraction = (
        VALIDATION_SIZE
        / (1.0 - TEST_SIZE)
    )

    X_train, X_val, y_train, y_val = train_test_split(
        X_temp,
        y_temp,
        test_size=validation_fraction,
        random_state=RANDOM_STATE,
        stratify=y_temp
    )

    print(f"Training samples   : {len(X_train):,}")
    print(f"Validation samples : {len(X_val):,}")
    print(f"Test samples       : {len(X_test):,}")

    # --------------------------------------------------------
    # 5. Scale using TRAINING data only
    # --------------------------------------------------------

    print(
        "\n[5/7] Applying training-only scaler..."
    )

    (
        X_train_scaled,
        X_val_scaled,
        X_test_scaled,
        _,
    ) = fit_training_scaler(
        X_train,
        X_val,
        X_test
    )

    # --------------------------------------------------------
    # IMPORTANT:
    #
    # We deliberately fit a fresh scaler on the reproduced
    # training split to verify the evaluation methodology.
    #
    # The saved scaler is also checked below.
    # --------------------------------------------------------

    saved_test_scaled = scaler.transform(X_test)

    if not np.allclose(
        X_test_scaled,
        saved_test_scaled,
        rtol=1e-5,
        atol=1e-6
    ):

        raise ValueError(
            "Saved scaler does not match the scaler produced "
            "from the training split."
        )

    print("Scaler verification: PASSED")

    # Use the saved scaler for final model evaluation.
    X_test_scaled = saved_test_scaled

    # --------------------------------------------------------
    # 6. Load model and predict
    # --------------------------------------------------------

    print("\n[6/7] Loading trained model...")

    model = IntrusionDetector(
        input_size,
        num_classes
    )

    model.load_state_dict(
        torch.load(
            MODEL_PATH,
            map_location="cpu"
        )
    )

    model.eval()

    X_test_tensor = torch.tensor(
        X_test_scaled,
        dtype=torch.float32
    )

    print("Model loaded successfully.")

    print("\nRunning predictions...")

    with torch.no_grad():

        outputs = model(
            X_test_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        predictions = torch.argmax(
            probabilities,
            dim=1
        ).numpy()

        confidences = torch.max(
            probabilities,
            dim=1
        ).values.numpy()

    # --------------------------------------------------------
    # 7. Metrics
    # --------------------------------------------------------

    print("\n[7/7] Calculating independent test metrics...")

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    macro_precision, macro_recall, macro_f1, _ = (
        precision_recall_fscore_support(
            y_test,
            predictions,
            average="macro",
            zero_division=0
        )
    )

    weighted_precision, weighted_recall, weighted_f1, _ = (
        precision_recall_fscore_support(
            y_test,
            predictions,
            average="weighted",
            zero_division=0
        )
    )

    # --------------------------------------------------------
    # Overall results
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("INDEPENDENT TEST RESULTS")
    print("=" * 70)

    print(
        f"\nTest samples       : {len(y_test):,}"
    )

    print(
        f"Accuracy            : {accuracy * 100:.2f}%"
    )

    print(
        f"Macro Precision     : {macro_precision * 100:.2f}%"
    )

    print(
        f"Macro Recall        : {macro_recall * 100:.2f}%"
    )

    print(
        f"Macro F1            : {macro_f1 * 100:.2f}%"
    )

    print(
        f"Weighted Precision  : {weighted_precision * 100:.2f}%"
    )

    print(
        f"Weighted Recall     : {weighted_recall * 100:.2f}%"
    )

    print(
        f"Weighted F1         : {weighted_f1 * 100:.2f}%"
    )

    # --------------------------------------------------------
    # Per-class performance
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("PER-CLASS PERFORMANCE")
    print("=" * 70)

    report = classification_report(
        y_test,
        predictions,
        labels=np.arange(num_classes),
        target_names=encoder.classes_,
        zero_division=0,
        digits=4
    )

    print("\n" + report)

    # --------------------------------------------------------
    # Confusion matrix
    # --------------------------------------------------------

    print("=" * 70)
    print("CONFUSION MATRIX")
    print("=" * 70)

    matrix = confusion_matrix(
        y_test,
        predictions,
        labels=np.arange(num_classes)
    )

    matrix_df = pd.DataFrame(
        matrix,
        index=encoder.classes_,
        columns=encoder.classes_
    )

    print("\nActual \\ Predicted")
    print(matrix_df.to_string())

    # --------------------------------------------------------
    # Confidence analysis
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("CONFIDENCE ANALYSIS")
    print("=" * 70)

    average_confidence = np.mean(
        confidences
    )

    below_70 = np.mean(
        confidences < 0.70
    ) * 100

    above_90 = np.mean(
        confidences >= 0.90
    ) * 100

    print(
        f"\nAverage confidence : "
        f"{average_confidence * 100:.2f}%"
    )

    print(
        f"Confidence < 70%  : "
        f"{below_70:.2f}% of predictions"
    )

    print(
        f"Confidence >= 90% : "
        f"{above_90:.2f}% of predictions"
    )

    # --------------------------------------------------------
    # Major misclassifications
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("MAJOR MISCLASSIFICATIONS")
    print("=" * 70)

    errors = []

    for actual_id in range(num_classes):

        for predicted_id in range(num_classes):

            if actual_id == predicted_id:
                continue

            count = matrix[
                actual_id,
                predicted_id
            ]

            if count > 0:

                errors.append(
                    (
                        count,
                        encoder.classes_[actual_id],
                        encoder.classes_[predicted_id]
                    )
                )

    errors.sort(
        reverse=True
    )

    for count, actual, predicted in errors[:25]:

        print(
            f"{actual} -> {predicted} : {count:,}"
        )

    # --------------------------------------------------------
    # Final statement
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("EVALUATION COMPLETE")
    print("=" * 70)

    print(
        "\nThis evaluation uses the held-out 15% test split."
    )

    print(
        "The test set was not used during model training "
        "or validation."
    )

    print(
        "\nThis result can be reported as the model's "
        "independent test performance."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    evaluate_test_set()