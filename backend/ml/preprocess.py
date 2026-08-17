import pandas as pd
import numpy as np
from pathlib import Path


# ============================================================
# PROJECT PATHS
# ============================================================

# backend/ml/preprocess.py
# parents[0] = ml
# parents[1] = backend
# parents[2] = project root

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    PROJECT_ROOT
    / "datasets"
    / "cic-ids2017"
    / "MachineLearningCVE"
)


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Dataset directory not found:\n{DATASET_PATH}"
        )

    csv_files = sorted(
        DATASET_PATH.glob("*.csv")
    )

    if not csv_files:

        raise FileNotFoundError(
            f"No CSV files found in:\n{DATASET_PATH}"
        )

    dataframes = []

    print(
        f"\nDataset directory:\n{DATASET_PATH}"
    )

    print(
        f"CSV files found: {len(csv_files)}\n"
    )

    for file in csv_files:

        print(
            f"Loading: {file.name}"
        )

        try:

            df = pd.read_csv(
                file,
                low_memory=False
            )

            dataframes.append(df)

            print(
                f"  Loaded {len(df):,} rows"
            )

        except Exception as e:

            print(
                f"  Failed loading {file.name}: {e}"
            )

    if not dataframes:

        raise RuntimeError(
            "No dataset files could be loaded."
        )

    combined_df = pd.concat(
        dataframes,
        ignore_index=True
    )

    return combined_df


# ============================================================
# CLEAN DATASET
# ============================================================

def clean_dataset(df):

    df = df.copy()

    # Remove whitespace from column names
    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
    )

    # Replace infinite values
    df.replace(
        [np.inf, -np.inf],
        np.nan,
        inplace=True
    )

    # Remove rows containing NaN
    before = len(df)

    df.dropna(
        inplace=True
    )

    removed = before - len(df)

    print(
        f"Removed {removed:,} invalid rows"
    )

    return df


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AEGIS-NSAI DATASET LOADER")
    print("=" * 60)

    df = load_dataset()

    print(
        f"\nDataset loaded successfully."
    )

    print(
        f"Shape: {df.shape}"
    )

    df = clean_dataset(df)

    print(
        f"\nCleaned dataset shape: {df.shape}"
    )

    print(
        "\nColumns:"
    )

    for column in df.columns:

        print(
            f"  {column}"
        )

    print(
        "\nSample:"
    )

    print(
        df.head()
    )