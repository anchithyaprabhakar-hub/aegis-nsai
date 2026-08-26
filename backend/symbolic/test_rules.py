from backend.symbolic.rule_engine import (
    detect_attack_rules,
    explain_prediction,
    get_rule_details,
    symbolic_confidence,
)


def main():

    print()
    print("=" * 70)
    print("AEGIS-NSAI SYMBOLIC RULE ENGINE TEST")
    print("=" * 70)

    # ========================================================
    # TEST CASE 1: DDoS-LIKE TRAFFIC
    # ========================================================

    ddos_features = {

        "Total Fwd Packets": 1500,
        "Total Backward Packets": 800,

        "Flow Packets/s": 15000,
        "Flow Bytes/s": 2_000_000,

        "Packet Length Mean": 500,

        "Flow Duration": 50000,

        "Destination Port": 80,

        "SYN Flag Count": 10,
        "ACK Flag Count": 5,
    }

    print()
    print("-" * 70)
    print("TEST CASE 1: DDoS-LIKE TRAFFIC")
    print("-" * 70)

    prediction = detect_attack_rules(
        ddos_features
    )

    explanation = explain_prediction(
        prediction
    )

    rule_details = get_rule_details(
        ddos_features
    )

    confidence = symbolic_confidence(
        ddos_features
    )

    print(
        f"\nSymbolic Prediction : {prediction}"
    )

    print(
        f"Symbolic Evidence   : "
        f"{confidence:.2f}%"
    )

    print(
        f"Explanation         : "
        f"{explanation}"
    )

    print(
        "\nRule Details:"
    )

    for rule, fired in rule_details.items():

        print(
            f"  {rule:<25} : {fired}"
        )


    # ========================================================
    # BASIC VALIDATION
    # ========================================================

    if prediction != "DDoS":

        raise AssertionError(
            "DDoS symbolic test failed. "
            f"Expected DDoS, got {prediction}."
        )


    if not rule_details["ddos_rule"]:

        raise AssertionError(
            "DDoS rule did not fire."
        )


    if confidence <= 0:

        raise AssertionError(
            "Symbolic confidence should be "
            "greater than zero."
        )


    # ========================================================
    # TEST CASE 2: NORMAL TRAFFIC
    # ========================================================

    normal_features = {

        "Total Fwd Packets": 3,
        "Total Backward Packets": 3,

        "Flow Packets/s": 20,
        "Flow Bytes/s": 2000,

        "Packet Length Mean": 400,

        "Flow Duration": 500000,

        "Destination Port": 443,

        "SYN Flag Count": 0,
        "ACK Flag Count": 3,
    }

    print()
    print("-" * 70)
    print("TEST CASE 2: NORMAL TRAFFIC")
    print("-" * 70)

    normal_prediction = detect_attack_rules(
        normal_features
    )

    normal_explanation = explain_prediction(
        normal_prediction
    )

    normal_confidence = symbolic_confidence(
        normal_features
    )

    print(
        f"\nSymbolic Prediction : "
        f"{normal_prediction}"
    )

    print(
        f"Symbolic Evidence   : "
        f"{normal_confidence:.2f}%"
    )

    print(
        f"Explanation         : "
        f"{normal_explanation}"
    )


    if normal_prediction != "Normal":

        raise AssertionError(
            "Normal traffic test failed. "
            f"Expected Normal, "
            f"got {normal_prediction}."
        )


    # ========================================================
    # FINAL RESULT
    # ========================================================

    print()
    print("=" * 70)
    print("SYMBOLIC RULE TEST PASSED")
    print("=" * 70)
    print()


if __name__ == "__main__":

    main()