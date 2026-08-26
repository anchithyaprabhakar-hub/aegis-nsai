from backend.explainability.explainer import generate_explanation


def main():

    print()
    print("=" * 70)
    print("AEGIS-NSAI EXPLAINABILITY TEST")
    print("=" * 70)

    prediction = "DDoS"
    confidence = 0.98

    explanation = generate_explanation(
        prediction,
        confidence
    )

    print()
    print("Prediction  :", prediction)
    print("Confidence  :", f"{confidence * 100:.2f}%")
    print("Explanation :", explanation["message"])

    print()
    print("Returned object:")
    print(explanation)

    print()
    print("=" * 70)
    print("EXPLAINABILITY TEST PASSED")
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()