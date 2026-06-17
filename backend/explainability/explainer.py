def generate_explanation(prediction, confidence):

    return {
        "prediction": prediction,
        "confidence": round(confidence * 100, 2),
        "message": f"Model predicts {prediction} with {round(confidence * 100, 2)}% confidence."
    }