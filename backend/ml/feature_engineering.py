import pandas as pd
import numpy as np

from sklearn.preprocessing import LabelEncoder, StandardScaler


def prepare_training_dataset(df):
    """
    Prepare raw CIC-IDS2017 data for training.

    Returns:
        X              : unscaled numeric feature matrix
        y_encoded      : encoded labels
        encoder        : fitted LabelEncoder
        feature_names  : exact feature order
    """

    df = df.copy()

    # Clean column names
    df.columns = df.columns.astype(str).str.strip()

    # Remove invalid numeric values
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    df.dropna(inplace=True)

    if "Label" not in df.columns:
        raise ValueError(
            "Training dataset must contain a 'Label' column."
        )

    # Separate features and labels
    X = df.drop(columns=["Label"])

    y = (
        df["Label"]
        .astype(str)
        .str.strip()
    )

    # Keep numeric features only
    X = X.select_dtypes(
        include=[np.number]
    )

    if X.empty:
        raise ValueError(
            "No numeric features found in the dataset."
        )

    # Preserve exact feature order
    feature_names = X.columns.tolist()

    # Encode labels
    encoder = LabelEncoder()

    y_encoded = encoder.fit_transform(y)

    # IMPORTANT:
    # Scaling is intentionally NOT performed here.
    #
    # The scaler must be fitted only on the training split
    # to prevent validation/test data leakage.

    return (
        X.to_numpy(dtype=np.float32),
        y_encoded,
        encoder,
        feature_names
    )


def prepare_prediction_dataset(
    df,
    scaler,
    feature_names
):
    """
    Prepare uploaded network traffic using the SAME
    scaler and feature structure used during training.
    """

    df = df.copy()

    # Clean column names
    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
    )

    # Remove label if supplied
    if "Label" in df.columns:
        df = df.drop(
            columns=["Label"]
        )

    # Replace invalid values
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    # Convert to numeric
    for column in df.columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Check required features
    missing_features = [
        feature
        for feature in feature_names
        if feature not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Uploaded CSV is missing required features: "
            + ", ".join(missing_features[:10])
        )

    # Preserve exact training feature order
    X = df[
        feature_names
    ].copy()

    # Remove invalid rows
    X.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    X.dropna(
        inplace=True
    )

    if X.empty:
        raise ValueError(
            "No valid numeric rows available for prediction."
        )

    # IMPORTANT:
    # Never fit the scaler during prediction.
    X_scaled = scaler.transform(X)

    return X_scaled


def fit_training_scaler(
    X_train,
    X_val,
    X_test
):
    """
    Fit StandardScaler ONLY on training data.

    Validation and test data are transformed using
    statistics learned exclusively from X_train.
    """

    scaler = StandardScaler()

    X_train_scaled = scaler.fit_transform(
        X_train
    )

    X_val_scaled = scaler.transform(
        X_val
    )

    X_test_scaled = scaler.transform(
        X_test
    )

    return (
        X_train_scaled,
        X_val_scaled,
        X_test_scaled,
        scaler
    )


# Backwards-compatible function
def prepare_dataset(df):
    """
    Legacy compatibility wrapper.

    New training code should use:
        prepare_training_dataset()
        fit_training_scaler()
    """

    result = prepare_training_dataset(df)

    X, y, encoder, feature_names = result

    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    return (
        X_scaled,
        y,
        encoder
    )
