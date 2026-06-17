import sys
import os

sys.path.append(os.path.abspath("backend"))

import torch

from ml.train import IntrusionDetector
from explainability.explainer import generate_explanation


def predict_attack():

    input_size = 78
    num_classes = 15

    model = IntrusionDetector(input_size, num_classes)

    model.load_state_dict(
        torch.load("backend/ml/intrusion_detector.pth")
    )

    model.eval()

    sample = torch.randn(1, 78)

    with torch.no_grad():

        output = model(sample)

        probabilities = torch.softmax(output, dim=1)

        confidence, prediction = torch.max(
            probabilities,
            dim=1
        )

    result = generate_explanation(
        f"Class {prediction.item()}",
        confidence.item()
    )

    return result


if __name__ == "__main__":
    print(predict_attack())