import pandas as pd
import numpy as np
from pathlib import Path

# Dataset path
DATASET_PATH = Path("datasets/cic-ids2017/MachineLearningCVE")


def load_dataset():
    csv_files = list(DATASET_PATH.glob("*.csv"))

    dataframes = []

    for file in csv_files:
        print(f"Loading: {file.name}")

        try:
            df = pd.read_csv(file)
            dataframes.append(df)

        except Exception as e:
            print(f"Failed loading {file.name}: {e}")

    combined_df = pd.concat(dataframes, ignore_index=True)

    return combined_df


def clean_dataset(df):
    # Remove spaces from column names
    df.columns = df.columns.str.strip()

    # Replace infinite values
    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    # Drop NaN rows
    df.dropna(inplace=True)

    return df


if __name__ == "__main__":
    print("Loading CIC-IDS2017 dataset...")

    df = load_dataset()

    print("\nDataset Loaded Successfully")
    print(f"Dataset Shape: {df.shape}")

    df = clean_dataset(df)

    print("\nDataset Cleaned Successfully")
    print(f"Cleaned Shape: {df.shape}")

    print("\nColumns:")
    print(df.columns.tolist())

    print("\nSample Data:")
    print(df.head())