"""
AEGIS-NSAI Symbolic Rule Engine

This module provides deterministic security rules that operate
alongside the neural-network prediction.

The symbolic layer does NOT replace the ML model.

Instead:

    Network Features
           |
           +------> Neural Network
           |              |
           |              v
           |        ML Prediction
           |
           +------> Symbolic Rules
                          |
                          v
                   Rule Prediction
                          |
                          v
                    Fusion Layer
                          |
                          v
                  Final Prediction
"""


# ============================================================
# ATTACK EXPLANATIONS
# ============================================================

ATTACK_EXPLANATIONS = {

    "Normal":
        "Network traffic appears normal with no strong "
        "symbolic indicators of malicious activity.",

    "BENIGN":
        "Normal network traffic detected.",

    "DDoS":
        "Traffic characteristics indicate a possible "
        "Distributed Denial of Service attack.",

    "DoS GoldenEye":
        "Traffic pattern is consistent with a GoldenEye "
        "Denial of Service attack.",

    "DoS Hulk":
        "High-volume HTTP traffic characteristics indicate "
        "a possible Hulk Denial of Service attack.",

    "DoS Slowhttptest":
        "Slow HTTP request behaviour indicates a possible "
        "SlowHTTPTest Denial of Service attack.",

    "DoS slowloris":
        "Slow connection behaviour is consistent with a "
        "possible Slowloris Denial of Service attack.",

    "PortScan":
        "Network behaviour indicates scanning activity "
        "across multiple destination ports.",

    "Bot":
        "Traffic characteristics indicate possible "
        "botnet-controlled communication.",

    "FTP-Patator":
        "Repeated FTP authentication behaviour indicates "
        "a possible brute-force attack.",

    "SSH-Patator":
        "Repeated SSH authentication attempts indicate "
        "a possible brute-force attack.",

    "Heartbleed":
        "Traffic characteristics indicate a possible "
        "Heartbleed exploitation attempt.",

    "Infiltration":
        "Traffic behaviour indicates a possible attempt "
        "to infiltrate or compromise the network.",

    "Web Attack":
        "Suspicious web application traffic was detected.",

    "Web Attack � Brute Force":
        "Repeated web authentication attempts indicate "
        "possible brute-force behaviour.",

    "Web Attack � Sql Injection":
        "Traffic characteristics indicate a possible "
        "SQL injection attack.",

    "Web Attack � XSS":
        "Traffic characteristics indicate a possible "
        "cross-site scripting attack.",
}


# ============================================================
# FEATURE HELPERS
# ============================================================

def get_feature(features, name, default=0.0):
    """
    Safely retrieve a feature value.

    Supports dictionaries and pandas-like rows.
    """

    if features is None:
        return default

    # Dictionary

    if isinstance(features, dict):
        value = features.get(
            name,
            default
        )

    # Pandas Series / DataFrame row

    else:

        try:
            value = features[name]

        except (
            KeyError,
            IndexError,
            TypeError
        ):
            return default

    try:

        if value is None:
            return default

        return float(value)

    except (
        ValueError,
        TypeError
    ):

        return default


# ============================================================
# SYMBOLIC RULES
# ============================================================

def rule_port_scan(features):
    """
    Detect possible port-scanning behaviour.

    Indicators:
    - Large number of destination ports
    - Very short flows
    - Low packet count
    """

    destination_port = get_feature(
        features,
        "Destination Port"
    )

    flow_duration = get_feature(
        features,
        "Flow Duration"
    )

    total_fwd_packets = get_feature(
        features,
        "Total Fwd Packets"
    )

    total_bwd_packets = get_feature(
        features,
        "Total Backward Packets"
    )

    # CIC-IDS flow-level data does not directly expose
    # the number of distinct scanned ports for one row.
    #
    # Therefore this rule uses short-flow characteristics
    # as supporting evidence rather than claiming certainty.

    if (
        destination_port > 0
        and flow_duration < 100000
        and total_fwd_packets <= 4
        and total_bwd_packets <= 4
    ):
        return True

    return False


def rule_ddos(features):
    """
    Detect high-volume traffic characteristics.

    Indicators:
    - Very high packet count
    - Very high packet rate
    """

    total_fwd_packets = get_feature(
        features,
        "Total Fwd Packets"
    )

    total_bwd_packets = get_feature(
        features,
        "Total Backward Packets"
    )

    flow_packets_per_second = get_feature(
        features,
        "Flow Packets/s"
    )

    total_packets = (
        total_fwd_packets
        + total_bwd_packets
    )

    if (
        total_packets > 1000
        or flow_packets_per_second > 10000
    ):
        return True

    return False


def rule_dos(features):
    """
    Detect high-volume DoS characteristics.
    """

    total_fwd_packets = get_feature(
        features,
        "Total Fwd Packets"
    )

    total_bwd_packets = get_feature(
        features,
        "Total Backward Packets"
    )

    flow_bytes_per_second = get_feature(
        features,
        "Flow Bytes/s"
    )

    total_packets = (
        total_fwd_packets
        + total_bwd_packets
    )

    if (
        total_packets > 500
        or flow_bytes_per_second > 1_000_000
    ):
        return True

    return False


def rule_bruteforce(features):
    """
    Detect repeated authentication-like traffic.

    This is a supporting symbolic rule and should not be
    interpreted as proof of brute-force activity.
    """

    destination_port = get_feature(
        features,
        "Destination Port"
    )

    total_fwd_packets = get_feature(
        features,
        "Total Fwd Packets"
    )

    total_bwd_packets = get_feature(
        features,
        "Total Backward Packets"
    )

    # Common SSH / FTP ports

    authentication_port = (
        destination_port in {
            21,
            22
        }
    )

    if (
        authentication_port
        and total_fwd_packets > 5
        and total_bwd_packets > 0
    ):
        return True

    return False


def rule_web_attack(features):
    """
    Detect suspicious web traffic.

    HTTP/HTTPS destination ports combined with unusual
    packet behaviour are treated as supporting evidence.
    """

    destination_port = get_feature(
        features,
        "Destination Port"
    )

    flow_duration = get_feature(
        features,
        "Flow Duration"
    )

    total_fwd_packets = get_feature(
        features,
        "Total Fwd Packets"
    )

    if destination_port in {
        80,
        443,
        8080,
        8000
    }:

        if (
            total_fwd_packets > 20
            and flow_duration > 0
        ):
            return True

    return False


# ============================================================
# MAIN SYMBOLIC DETECTOR
# ============================================================

def detect_attack_rules(features):
    """
    Execute symbolic security rules.

    Returns:
        A symbolic attack classification.

    Priority:

        DDoS
        DoS
        PortScan
        Brute Force
        Web Attack
        Normal

    The symbolic result is later combined with the
    neural-network prediction by the fusion layer.
    """

    if features is None:
        return "Normal"


    # --------------------------------------------------------
    # DDoS
    # --------------------------------------------------------

    if rule_ddos(features):

        return "DDoS"


    # --------------------------------------------------------
    # DoS
    # --------------------------------------------------------

    if rule_dos(features):

        return "DoS"


    # --------------------------------------------------------
    # Port Scan
    # --------------------------------------------------------

    if rule_port_scan(features):

        return "PortScan"


    # --------------------------------------------------------
    # Brute Force
    # --------------------------------------------------------

    if rule_bruteforce(features):

        destination_port = get_feature(
            features,
            "Destination Port"
        )

        if destination_port == 22:

            return "SSH-Patator"

        if destination_port == 21:

            return "FTP-Patator"


    # --------------------------------------------------------
    # Web Attack
    # --------------------------------------------------------

    if rule_web_attack(features):

        return "Web Attack"


    # --------------------------------------------------------
    # Normal
    # --------------------------------------------------------

    return "Normal"


# ============================================================
# EXPLANATION GENERATOR
# ============================================================

def explain_prediction(prediction):
    """
    Return a human-readable explanation for an attack class.
    """

    if prediction is None:

        return (
            "No prediction was generated."
        )

    prediction = str(
        prediction
    ).strip()


    # Exact match

    if prediction in ATTACK_EXPLANATIONS:

        return ATTACK_EXPLANATIONS[
            prediction
        ]


    # Generic Web Attack handling

    if prediction.startswith(
        "Web Attack"
    ):

        return (
            "Suspicious web application traffic "
            "was detected."
        )


    return (
        "The model detected a traffic pattern "
        "associated with this attack class."
    )


# ============================================================
# SYMBOLIC RULE DETAILS
# ============================================================

def get_rule_details(features):
    """
    Return which symbolic rules fired.

    This is useful for the explainability layer and
    dashboard.
    """

    details = {

        "ddos_rule": rule_ddos(
            features
        ),

        "dos_rule": rule_dos(
            features
        ),

        "port_scan_rule": rule_port_scan(
            features
        ),

        "bruteforce_rule": rule_bruteforce(
            features
        ),

        "web_attack_rule": rule_web_attack(
            features
        ),
    }

    return details


# ============================================================
# SYMBOLIC CONFIDENCE
# ============================================================

def symbolic_confidence(features):
    """
    Estimate symbolic evidence strength.

    This is NOT statistical probability.

    It represents the proportion of symbolic rules
    that fired.
    """

    details = get_rule_details(
        features
    )

    fired_rules = sum(
        1
        for value
        in details.values()
        if value
    )

    total_rules = len(
        details
    )

    if total_rules == 0:

        return 0.0

    return round(
        fired_rules
        / total_rules
        * 100,
        2
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AEGIS-NSAI SYMBOLIC RULE ENGINE TEST")
    print("=" * 60)


    # Normal-like sample

    normal_sample = {

        "Destination Port": 443,

        "Flow Duration": 500000,

        "Total Fwd Packets": 5,

        "Total Backward Packets": 5,

        "Flow Packets/s": 20,

        "Flow Bytes/s": 10000,
    }


    # High-volume sample

    ddos_sample = {

        "Destination Port": 80,

        "Flow Duration": 1000,

        "Total Fwd Packets": 5000,

        "Total Backward Packets": 3000,

        "Flow Packets/s": 20000,

        "Flow Bytes/s": 5000000,
    }


    # Port scan-like sample

    port_scan_sample = {

        "Destination Port": 443,

        "Flow Duration": 1000,

        "Total Fwd Packets": 2,

        "Total Backward Packets": 1,

        "Flow Packets/s": 3,

        "Flow Bytes/s": 100,
    }


    samples = {

        "Normal sample":
            normal_sample,

        "DDoS sample":
            ddos_sample,

        "PortScan sample":
            port_scan_sample,
    }


    for name, sample in samples.items():

        prediction = detect_attack_rules(
            sample
        )

        explanation = explain_prediction(
            prediction
        )

        confidence = symbolic_confidence(
            sample
        )

        details = get_rule_details(
            sample
        )

        print(
            f"\n{name}"
        )

        print(
            f"Symbolic prediction : {prediction}"
        )

        print(
            f"Symbolic evidence   : {confidence}%"
        )

        print(
            f"Explanation         : {explanation}"
        )

        print(
            f"Rules               : {details}"
        )