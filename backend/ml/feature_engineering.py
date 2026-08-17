import pandas as pd
import numpy as np

from sklearn.preprocessing import LabelEncoder, StandardScaler


def prepare_training_dataset(df):
    """
    Prepare the CIC-IDS2017 dataset for model training.

    Returns:
        X_scaled       : scaled feature matrix
        y_encoded      : encoded labels
        encoder        : fitted LabelEncoder
        scaler         : fitted StandardScaler
        feature_names  : list of training feature names
    """

    df = df.copy()

    # Clean column names
    df.columns = df.columns.str.strip()

    # Remove infinite values
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # Remove rows containing NaN
    df.dropna(inplace=True)

    if "Label" not in df.columns:
        raise ValueError(
            "Training dataset must contain a 'Label' column."
        )

    # Separate features and labels
    X = df.drop(columns=["Label"])
    y = df["Label"].astype(str).str.strip()

    # Keep only numeric features
    X = X.select_dtypes(include=[np.number])

    if X.empty:
        raise ValueError(
            "No numeric features found in the dataset."
        )

    # Save exact feature order
    feature_names = X.columns.tolist()

    # Encode attack labels
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Fit scaler ONLY on training data
    scaler = StandardScaler()

    X_scaled = scaler.fit_transform(X)

    return (
        X_scaled,
        y_encoded,
        encoder,
        scaler,
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
    df.columns = df.columns.str.strip()

    # If uploaded CSV contains labels, remove them
    if "Label" in df.columns:
        df = df.drop(columns=["Label"])

    # Replace infinite values
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    # Convert columns to numeric where possible
    for column in df.columns:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # Keep only the features used during training
    missing_features = [
        column
        for column in feature_names
        if column not in df.columns
    ]

    if missing_features:
        raise ValueError(
            "Uploaded CSV is missing required features: "
            + ", ".join(missing_features[:10])
        )

    # Ignore extra columns and preserve training order
    X = df[feature_names]

    # Remove invalid rows
    X.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    X.dropna(inplace=True)

    if X.empty:
        raise ValueError(
            "No valid numeric rows available for prediction."
        )

    # IMPORTANT:
    # Do NOT fit the scaler again.
    X_scaled = scaler.transform(X)

    return X_scaled


# Backwards-compatible function
def prepare_dataset(df):
    """
    Compatibility wrapper.

    This function is retained so existing imports do not
    immediately break. New training and prediction code
    should use the dedicated functions above.
    """

    df = df.copy()
    df.columns = df.columns.str.strip()

    if "Label" in df.columns:

        X = df.drop(columns=["Label"])
        y = df["Label"]

        X = X.select_dtypes(include=[np.number])

        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        return X_scaled, y_encoded, encoder

    else:

        X = df.select_dtypes(
            include=[np.number]
        )

        scaler = StandardScaler()

        X_scaled = scaler.fit_transform(X)

        return X_scaled, None, None