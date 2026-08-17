from pathlib import Path

import joblib
import torch
import torch.nn as nn
import torch.optim as optim

from preprocess import load_dataset, clean_dataset
from feature_engineering import prepare_training_dataset
from train import IntrusionDetector


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "intrusion_detector.pth"
SCALER_PATH = BASE_DIR / "scaler.joblib"
ENCODER_PATH = BASE_DIR / "label_encoder.joblib"
FEATURES_PATH = BASE_DIR / "feature_names.joblib"


# ============================================================
# TRAINING CONFIGURATION
# ============================================================

EPOCHS = 10
LEARNING_RATE = 0.001


# ============================================================
# MAIN TRAINING FUNCTION
# ============================================================

def train_model():

    print("=" * 60)
    print("AEGIS-NSAI MODEL TRAINING")
    print("=" * 60)

    # --------------------------------------------------------
    # 1. Load dataset
    # --------------------------------------------------------

    print("\n[1/7] Loading CIC-IDS2017 dataset...")

    df = load_dataset()

    print(
        f"Dataset shape: {df.shape}"
    )

    # --------------------------------------------------------
    # 2. Clean dataset
    # --------------------------------------------------------

    print("\n[2/7] Cleaning dataset...")

    df = clean_dataset(df)

    print(
        f"Cleaned dataset shape: {df.shape}"
    )

    # --------------------------------------------------------
    # 3. Feature engineering
    # --------------------------------------------------------

    print("\n[3/7] Preparing features...")

    (
        X,
        y,
        encoder,
        scaler,
        feature_names
    ) = prepare_training_dataset(df)

    input_size = X.shape[1]
    num_classes = len(encoder.classes_)

    print(
        f"Input features : {input_size}"
    )

    print(
        f"Attack classes : {num_classes}"
    )

    print("\nDetected attack classes:")

    for index, class_name in enumerate(
        encoder.classes_
    ):
        print(
            f"  {index}: {class_name}"
        )

    # --------------------------------------------------------
    # 4. Convert to PyTorch tensors
    # --------------------------------------------------------

    print("\n[4/7] Converting data to PyTorch tensors...")

    X_tensor = torch.tensor(
        X,
        dtype=torch.float32
    )

    y_tensor = torch.tensor(
        y,
        dtype=torch.long
    )

    # --------------------------------------------------------
    # 5. Create model
    # --------------------------------------------------------

    print("\n[5/7] Creating neural network...")

    model = IntrusionDetector(
        input_size,
        num_classes
    )

    criterion = nn.CrossEntropyLoss()

    optimizer = optim.Adam(
        model.parameters(),
        lr=LEARNING_RATE
    )

    # --------------------------------------------------------
    # 6. Training
    # --------------------------------------------------------

    print("\n[6/7] Training model...")
    print()

    model.train()

    for epoch in range(EPOCHS):

        optimizer.zero_grad()

        outputs = model(
            X_tensor
        )

        loss = criterion(
            outputs,
            y_tensor
        )

        loss.backward()

        optimizer.step()

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        accuracy = (
            predictions == y_tensor
        ).float().mean().item() * 100

        print(
            f"Epoch {epoch + 1:02d}/{EPOCHS} "
            f"| Loss: {loss.item():.4f} "
            f"| Accuracy: {accuracy:.2f}%"
        )

    # --------------------------------------------------------
    # 7. Save model and preprocessing artifacts
    # --------------------------------------------------------

    print("\n[7/7] Saving model artifacts...")

    torch.save(
        model.state_dict(),
        MODEL_PATH
    )

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
        FEATURES_PATH
    )

    print("\nSaved:")

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
        f"Features      : {FEATURES_PATH}"
    )

    print("\n" + "=" * 60)
    print("TRAINING COMPLETE")
    print("=" * 60)


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    train_model()