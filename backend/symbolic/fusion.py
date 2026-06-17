def fuse_predictions(
    ml_prediction,
    rule_prediction
):

    if rule_prediction != "Normal":
        return rule_prediction

    return ml_prediction


if __name__ == "__main__":

    print(
        fuse_predictions(
            "DDoS",
            "Normal"
        )
    )

    print(
        fuse_predictions(
            "DDoS",
            "PortScan"
        )
    )