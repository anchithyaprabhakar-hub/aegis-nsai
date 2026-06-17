import sys
import os

sys.path.append(os.path.abspath("backend/ml"))
sys.path.append(os.path.abspath("backend/explainability"))
sys.path.append(os.path.abspath("backend/knowledge_graph"))

import torch

from train import IntrusionDetector
from explainer import generate_explanation
from graph_builder import get_attack_context

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

        attack_name = f"Class {prediction.item()}"

    result = generate_explanation(
        attack_name,
        confidence.item()
    )

    result["knowledge_graph"] = get_attack_context(
        attack_name
    )

    print(result)

    return result


if __name__ == "__main__":
    print(predict_attack())