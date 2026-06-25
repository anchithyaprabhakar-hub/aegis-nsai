import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler


def prepare_dataset(df):

    df.columns = df.columns.str.strip()

    scaler = StandardScaler()

    # Training Mode (dataset has labels)
    if "Label" in df.columns:

        X = df.drop(columns=["Label"])
        y = df["Label"]

        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)

        X_scaled = scaler.fit_transform(X)

        return X_scaled, y_encoded, encoder

    # Prediction Mode (uploaded CSV has no labels)
    else:

        X_scaled = scaler.fit_transform(df)

        return X_scaled, None, None