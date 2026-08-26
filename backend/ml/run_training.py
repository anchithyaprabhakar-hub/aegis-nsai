from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight

from .preprocess import load_dataset, clean_dataset
from .feature_engineering import (
    prepare_training_dataset,
    fit_training_scaler,
)
from .train import IntrusionDetector


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATASET_DIR = (
    BASE_DIR.parent.parent
    / "datasets"
    / "cic-ids2017"
    / "MachineLearningCVE"
)

MODEL_PATH = BASE_DIR / "intrusion_detector.pth"
SCALER_PATH = BASE_DIR / "scaler.joblib"
ENCODER_PATH = BASE_DIR / "label_encoder.joblib"
FEATURE_NAMES_PATH = BASE_DIR / "feature_names.joblib"


# ============================================================
# TRAINING CONFIGURATION
# ============================================================

RANDOM_STATE = 42

TEST_SIZE = 0.15
VALIDATION_SIZE = 0.15

EPOCHS = 20
BATCH_SIZE = 2048

LEARNING_RATE = 0.001

EARLY_STOPPING_PATIENCE = 8


# ============================================================
# TRAINING FUNCTION
# ============================================================

def train_model():

    print("=" * 70)
    print("AEGIS-NSAI MODEL TRAINING")
    print("=" * 70)

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    print(
        "\n[1/9] Loading CIC-IDS2017 dataset..."
    )

    print(
        f"\nDataset directory:\n{DATASET_DIR}"
    )

    df = load_dataset()

    print(
        f"Dataset shape: {df.shape}"
    )

    # --------------------------------------------------------
    # 2. Clean dataset
    # --------------------------------------------------------

    print(
        "\n[2/9] Cleaning dataset..."
    )

    rows_before = len(df)

    df = clean_dataset(df)

    rows_removed = (
        rows_before - len(df)
    )

    print(
        f"Removed {rows_removed:,} invalid rows"
    )

    print(
        f"Cleaned dataset shape: {df.shape}"
    )

    # --------------------------------------------------------
    # 3. Prepare features
    # --------------------------------------------------------

    print(
        "\n[3/9] Preparing features..."
    )

    (
        X,
        y,
        encoder,
        feature_names
    ) = prepare_training_dataset(df)

    input_size = X.shape[1]

    num_classes = len(
        encoder.classes_
    )

    print(
        f"Input features : {input_size}"
    )

    print(
        f"Attack classes : {num_classes}"
    )

    print(
        "\nDetected attack classes:"
    )

    for class_id, class_name in enumerate(
        encoder.classes_
    ):

        print(
            f"  {class_id}: {class_name}"
        )

    print(
        "\nClass distribution:"
    )

    unique_classes, class_counts = np.unique(
        y,
        return_counts=True
    )

    for class_id, count in zip(
        unique_classes,
        class_counts
    ):

        class_name = encoder.inverse_transform(
            [class_id]
        )[0]

        percentage = (
            count / len(y)
        ) * 100

        print(
            f"  {class_name:<25} "
            f"{count:>8} "
            f"({percentage:>6.2f}%)"
        )

    # --------------------------------------------------------
    # 4. Train / validation / test split
    # --------------------------------------------------------

    print(
        "\n[4/9] Creating train/validation/test split..."
    )

    # First separate the final test set.
    X_temp, X_test, y_temp, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y
    )

    # Split the remaining 85% into:
    #   70% train
    #   15% validation
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

    print(
        f"Training samples   : {len(X_train):,}"
    )

    print(
        f"Validation samples : {len(X_val):,}"
    )

    print(
        f"Test samples       : {len(X_test):,}"
    )

    # --------------------------------------------------------
    # 5. Fit scaler ONLY on training data
    # --------------------------------------------------------

    print(
        "\n[5/9] Fitting scaler on training data only..."
    )

    (
        X_train,
        X_val,
        X_test,
        scaler
    ) = fit_training_scaler(
        X_train,
        X_val,
        X_test
    )

    print(
        "Scaler fitted using training data only."
    )

    # --------------------------------------------------------
    # 6. Convert to tensors
    # --------------------------------------------------------

    print(
        "\n[6/9] Converting data to PyTorch tensors..."
    )

    X_train_tensor = torch.tensor(
        X_train,
        dtype=torch.float32
    )

    y_train_tensor = torch.tensor(
        y_train,
        dtype=torch.long
    )

    X_val_tensor = torch.tensor(
        X_val,
        dtype=torch.float32
    )

    y_val_tensor = torch.tensor(
        y_val,
        dtype=torch.long
    )

    X_test_tensor = torch.tensor(
        X_test,
        dtype=torch.float32
    )

    y_test_tensor = torch.tensor(
        y_test,
        dtype=torch.long
    )

    # --------------------------------------------------------
    # 7. Create model + controlled weighted loss
    # --------------------------------------------------------

    print(
        "\n[7/9] Creating neural network..."
    )

    model = IntrusionDetector(
        input_size,
        num_classes
    )

    # Calculate standard balanced class weights.
    balanced_weights = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(y_train),
        y=y_train
    )

    # --------------------------------------------------------
    # CONTROLLED CLASS WEIGHTING
    #
    # The standard "balanced" strategy can produce extremely
    # large weights for classes with very few samples.
    #
    # Applying sqrt() softens those extreme values while
    # preserving additional importance for minority classes.
    # --------------------------------------------------------

    class_weights = np.sqrt(
        balanced_weights
    )

    class_weights_tensor = torch.tensor(
        class_weights,
        dtype=torch.float32
    )

    print(
        "\nBalanced class weights:"
    )

    for class_id, weight in enumerate(
        balanced_weights
    ):

        class_name = encoder.inverse_transform(
            [class_id]
        )[0]

        print(
            f"  {class_name:<25} "
            f"{weight:.4f}"
        )

    print(
        "\nControlled sqrt class weights:"
    )

    for class_id, weight in enumerate(
        class_weights
    ):

        class_name = encoder.inverse_transform(
            [class_id]
        )[0]

        print(
            f"  {class_name:<25} "
            f"{weight:.4f}"
        )

    criterion = nn.CrossEntropyLoss(
        weight=class_weights_tensor
    )

    optimizer = optim.Adam(
        model.parameters(),
        lr=LEARNING_RATE
    )

    train_dataset = torch.utils.data.TensorDataset(
        X_train_tensor,
        y_train_tensor
    )

    train_loader = torch.utils.data.DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True
    )

    # --------------------------------------------------------
    # 8. Train model
    # --------------------------------------------------------

    print(
        "\n[8/9] Training model..."
    )

    best_val_loss = float("inf")

    best_model_state = None

    patience_counter = 0

    for epoch in range(
        EPOCHS
    ):

        # ----------------------------------------------------
        # Training
        # ----------------------------------------------------

        model.train()

        running_loss = 0.0

        correct = 0

        total = 0

        for batch_X, batch_y in train_loader:

            optimizer.zero_grad()

            outputs = model(
                batch_X
            )

            loss = criterion(
                outputs,
                batch_y
            )

            loss.backward()

            optimizer.step()

            running_loss += (
                loss.item()
                * batch_X.size(0)
            )

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            correct += (
                predictions == batch_y
            ).sum().item()

            total += batch_y.size(0)

        train_loss = (
            running_loss / total
        )

        train_accuracy = (
            correct / total
        ) * 100

        # ----------------------------------------------------
        # Validation
        # ----------------------------------------------------

        model.eval()

        val_loss_total = 0.0

        val_correct = 0

        val_total = 0

        with torch.no_grad():

            val_outputs = model(
                X_val_tensor
            )

            val_loss = criterion(
                val_outputs,
                y_val_tensor
            )

            val_predictions = torch.argmax(
                val_outputs,
                dim=1
            )

            val_loss_total = (
                val_loss.item()
            )

            val_correct = (
                val_predictions
                == y_val_tensor
            ).sum().item()

            val_total = (
                y_val_tensor.size(0)
            )

        val_loss_value = (
            val_loss_total
        )

        val_accuracy = (
            val_correct / val_total
        ) * 100

        print(
            f"Epoch {epoch + 1:02d}/{EPOCHS} | "
            f"Train Loss: {train_loss:.4f} | "
            f"Train Acc: {train_accuracy:.2f}% | "
            f"Val Loss: {val_loss_value:.4f} | "
            f"Val Acc: {val_accuracy:.2f}%"
        )

        # ----------------------------------------------------
        # Save best validation model
        # ----------------------------------------------------

        if val_loss_value < best_val_loss:

            best_val_loss = val_loss_value

            best_model_state = {
                key: value.clone()
                for key, value in model.state_dict().items()
            }

            patience_counter = 0

            print(
                "   -> Best model saved."
            )

        else:

            patience_counter += 1

        # ----------------------------------------------------
        # Early stopping
        # ----------------------------------------------------

        if (
            patience_counter
            >= EARLY_STOPPING_PATIENCE
        ):

            print(
                "\nEarly stopping triggered."
            )

            break

    # --------------------------------------------------------
    # Restore best validation model
    # --------------------------------------------------------

    if best_model_state is not None:

        model.load_state_dict(
            best_model_state
        )

    # --------------------------------------------------------
    # 9. Save preprocessing artifacts
    # --------------------------------------------------------

    print(
        "\n[9/9] Saving preprocessing artifacts..."
    )

    torch.save(
        model.state_dict(),
        MODEL_PATH
    )

    import joblib

    joblib.dump(
        scaler,
        SCALER_PATH
    )

    joblib.dump(
        encoder,
        ENCODER_PATH
    )

    joblib.dump(
        feature_names,
        FEATURE_NAMES_PATH
    )

    print(
        "\nSaved:"
    )

    print(
        f"Model         : {MODEL_PATH}"
    )

    print(
        f"Scaler        : {SCALER_PATH}"
    )

    print(
        f"Label encoder : {ENCODER_PATH}"
    )

    print(
        f"Features      : {FEATURE_NAMES_PATH}"
    )

    print(
        "\n" + "=" * 70
    )

    print(
        "TRAINING COMPLETE"
    )

    print(
        "=" * 70
    )

    print(
        "\nTest set was held out completely from "
        "model training and validation."
    )

    print(
        "Use the dedicated test evaluator for "
        "final performance measurement."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    train_model()