import pandas as pd
from sklearn.preprocessing import LabelEncoder, StandardScaler

def prepare_dataset(df):
    df.columns = df.columns.str.strip()

    label_column = "Label"

    X = df.drop(columns=[label_column])
    y = df[label_column]

    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y_encoded, encoder