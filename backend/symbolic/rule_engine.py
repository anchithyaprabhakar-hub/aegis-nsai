def explain_prediction(prediction):

    rules = {

        "BENIGN":
            "Normal network traffic detected.",

        "DoS":
            "Large volume of packets indicates Denial of Service attack.",

        "DDoS":
            "Traffic pattern matches Distributed Denial of Service attack.",

        "PortScan":
            "Multiple ports scanned within short interval.",

        "Bot":
            "Botnet-like communication behaviour detected.",

        "Web Attack":
            "Suspicious web request patterns observed.",

        "Infiltration":
            "Unauthorized access attempt detected."
    }

    return rules.get(
        prediction,
        "No symbolic explanation available."
    )