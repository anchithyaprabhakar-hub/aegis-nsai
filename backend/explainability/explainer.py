"""
AEGIS-NSAI Explainability Layer

Converts the neural-network prediction and symbolic
reasoning result into a clear human-readable explanation.
"""


# ============================================================
# GENERATE EXPLANATION
# ============================================================

def generate_explanation(
    final_prediction,
    ml_prediction,
    ml_confidence,
    rule_prediction,
    symbolic_confidence,
):
    """
    Generate an explanation for the final neuro-symbolic
    prediction.

    Important distinction:

        ml_confidence
            = neural-network confidence

        symbolic_confidence
            = deterministic symbolic evidence strength

    These values are NOT treated as the same quantity.
    """

    # --------------------------------------------------------
    # Normalize values
    # --------------------------------------------------------

    final_prediction = str(
        final_prediction
    ).strip()

    ml_prediction = str(
        ml_prediction
    ).strip()

    rule_prediction = str(
        rule_prediction
    ).strip()

    try:
        ml_percentage = round(
            float(ml_confidence) * 100,
            2,
        )

    except (
        TypeError,
        ValueError,
    ):
        ml_percentage = 0.0


    try:
        symbolic_percentage = round(
            float(symbolic_confidence),
            2,
        )

    except (
        TypeError,
        ValueError,
    ):
        symbolic_percentage = 0.0


    # ========================================================
    # CASE 1: ML AND SYMBOLIC AGREE
    # ========================================================

    if (
        ml_prediction == rule_prediction
        and final_prediction == ml_prediction
    ):

        message = (
            f"Neural network and symbolic reasoning "
            f"both support {final_prediction}. "
            f"The neural network confidence is "
            f"{ml_percentage:.2f}%, while symbolic "
            f"evidence is {symbolic_percentage:.2f}%."
        )


    # ========================================================
    # CASE 2: SYMBOLIC ENGINE OVERRIDES ML
    # ========================================================

    elif (
        final_prediction == rule_prediction
        and rule_prediction != ml_prediction
    ):

        message = (
            f"The neural network classified the traffic "
            f"as {ml_prediction} with {ml_percentage:.2f}% "
            f"confidence, while the symbolic rule engine "
            f"identified {rule_prediction} with "
            f"{symbolic_percentage:.2f}% evidence. "
            f"The symbolic evidence influenced the final "
            f"neuro-symbolic decision to classify the "
            f"traffic as {final_prediction}."
        )


    # ========================================================
    # CASE 3: ML RESULT REMAINS FINAL
    # ========================================================

    elif final_prediction == ml_prediction:

        message = (
            f"The neural network classified the traffic "
            f"as {ml_prediction} with {ml_percentage:.2f}% "
            f"confidence. The symbolic engine did not "
            f"provide sufficient evidence to change the "
            f"final classification."
        )


    # ========================================================
    # CASE 4: FALLBACK
    # ========================================================

    else:

        message = (
            f"AEGIS-NSAI classified the traffic as "
            f"{final_prediction}. The neural network "
            f"predicted {ml_prediction} with "
            f"{ml_percentage:.2f}% confidence, while "
            f"symbolic reasoning predicted "
            f"{rule_prediction} with "
            f"{symbolic_percentage:.2f}% evidence."
        )


    # ========================================================
    # RETURN EXPLANATION
    # ========================================================

    return {

        "prediction":
            final_prediction,

        # This remains the ML confidence because the
        # symbolic evidence is not a probability.
        "confidence":
            ml_percentage,

        "ml_prediction":
            ml_prediction,

        "ml_confidence":
            ml_percentage,

        "rule_prediction":
            rule_prediction,

        "symbolic_confidence":
            symbolic_percentage,

        "message":
            message,
    }