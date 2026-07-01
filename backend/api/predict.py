import torch
import pandas as pd

from ml.preprocess import clean_dataset
from ml.feature_engineering import prepare_dataset
from ml.train import IntrusionDetector

from explainability.explainer import generate_explanation
from knowledge_graph.graph_builder import get_attack_context

from symbolic.fusion import fuse_predictions
from symbolic.rule_engine import detect_attack_rules


class_names = {
    0: "DDoS",
    1: "PortScan",
    2: "BruteForce"
}


def predict_attack(df):

    input_size = 78
    num_classes = 15

    model = IntrusionDetector(
        input_size,
        num_classes
    )

    model.load_state_dict(
        torch.load(
            "ml/intrusion_detector.pth",
            map_location=torch.device("cpu")
        )
    )

    model.eval()

    # Clean uploaded CSV
    df = clean_dataset(df)

    # Prepare features
    X, _, _ = prepare_dataset(df)

    # Use the first row for prediction
    sample = torch.tensor(
        X[0:1],
        dtype=torch.float32
    )

    with torch.no_grad():

        output = model(sample)

        probabilities = torch.softmax(
            output,
            dim=1
        )

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    attack_name = class_names.get(
        prediction.item(),
        "Unknown Attack"
    )

    # Symbolic Rule Engine
    rule_prediction = detect_attack_rules(sample)

    print("ML Prediction:", attack_name)
    print("Rule Prediction:", rule_prediction)

    # Neuro-Symbolic Fusion
    final_prediction = fuse_predictions(
        attack_name,
        rule_prediction
    )

    print("Final Prediction:", final_prediction)

    result = generate_explanation(
        final_prediction,
        confidence.item()
    )

    result["knowledge_graph"] = get_attack_context(
        final_prediction
    )

    print(result)

    return result


if __name__ == "__main__":

    sample_df = pd.read_csv(
        "../datasets/cic-ids2017/MachineLearningCVE/Monday-WorkingHours.pcap_ISCX.csv"
    )

    print(predict_attack(sample_df))