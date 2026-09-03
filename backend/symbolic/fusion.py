"""
AEGIS-NSAI Neuro-Symbolic Fusion

Combines neural-network predictions with symbolic evidence.

The symbolic engine is treated as supporting deterministic evidence,
not as an unconditional override of the neural model.
"""


# ============================================================
# NEURO-SYMBOLIC FUSION
# ============================================================

def fuse_predictions(
    ml_prediction,
    rule_prediction,
    ml_confidence=None,
    symbolic_confidence=None,
):
    """
    Combine neural and symbolic predictions.

    Rules:

    1. If symbolic reasoning finds no meaningful evidence,
       retain the neural prediction.

    2. If symbolic evidence is strong, it can influence the
       final prediction.

    3. A symbolic prediction does NOT automatically override
       the neural model merely because a rule fired.

    4. When both components agree, retain that prediction.

    Parameters
    ----------
    ml_prediction : str
        Neural-network prediction.

    rule_prediction : str
        Symbolic-rule prediction.

    ml_confidence : float, optional
        Neural confidence expressed as percentage or
        probability.

    symbolic_confidence : float, optional
        Symbolic evidence expressed as percentage.
    """

    # --------------------------------------------------------
    # Normalize inputs
    # --------------------------------------------------------

    if ml_prediction is None:
        ml_prediction = "Unknown"

    if rule_prediction is None:
        rule_prediction = "Normal"

    ml_prediction = str(
        ml_prediction
    ).strip()

    rule_prediction = str(
        rule_prediction
    ).strip()


    # --------------------------------------------------------
    # No symbolic evidence
    # --------------------------------------------------------

    if rule_prediction == "Normal":

        return ml_prediction


    # --------------------------------------------------------
    # Both systems agree
    # --------------------------------------------------------

    if ml_prediction == rule_prediction:

        return ml_prediction


    # --------------------------------------------------------
    # Normalize confidence values
    # --------------------------------------------------------

    try:

        ml_score = float(
            ml_confidence
        )

    except (
        TypeError,
        ValueError,
    ):

        ml_score = 0.0


    try:

        symbolic_score = float(
            symbolic_confidence
        )

    except (
        TypeError,
        ValueError,
    ):

        symbolic_score = 0.0


    # --------------------------------------------------------
    # Convert neural probability to percentage
    # --------------------------------------------------------

    if 0.0 <= ml_score <= 1.0:

        ml_score *= 100.0


    # --------------------------------------------------------
    # Strong symbolic evidence
    #
    # Symbolic evidence must be substantially stronger than
    # the neural confidence before overriding it.
    # --------------------------------------------------------

    if (
        symbolic_score >= 90.0
        and symbolic_score > ml_score
    ):

        return rule_prediction


    # --------------------------------------------------------
    # Otherwise retain neural prediction
    # --------------------------------------------------------

    return ml_prediction


# ============================================================
# LOCAL TEST
# ============================================================

if __name__ == "__main__":

    print(
        "Case 1:",
        fuse_predictions(
            "DDoS",
            "Normal",
            95.0,
            0.0,
        ),
    )

    print(
        "Case 2:",
        fuse_predictions(
            "DDoS",
            "PortScan",
            80.0,
            100.0,
        ),
    )

    print(
        "Case 3:",
        fuse_predictions(
            "Normal",
            "SSH-Patator",
            99.96,
            100.0,
        ),
    )

    print(
        "Case 4:",
        fuse_predictions(
            "PortScan",
            "PortScan",
            90.0,
            100.0,
        ),
    )