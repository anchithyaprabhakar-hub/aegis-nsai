"""
AEGIS-NSAI Symbolic Rule Engine

Neuro-Symbolic AI component responsible for deterministic
network-security reasoning.

The symbolic layer does NOT replace the neural network.

Pipeline:

    Network Features
           |
           +--------------------+
           |                    |
           v                    v
    Neural Network       Symbolic Rules
           |                    |
           v                    v
     ML Prediction       Symbolic Evidence
           |                    |
           +---------+----------+
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

    "DoS":
        "Traffic characteristics indicate a possible "
        "Denial of Service attack.",

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
        "Network behaviour indicates possible scanning "
        "activity.",

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

    "Web Attack - Brute Force":
        "Repeated web authentication attempts indicate "
        "possible brute-force behaviour.",

    "Web Attack � Brute Force":
        "Repeated web authentication attempts indicate "
        "possible brute-force behaviour.",

    "Web Attack - Sql Injection":
        "Traffic characteristics indicate a possible "
        "SQL injection attack.",

    "Web Attack � Sql Injection":
        "Traffic characteristics indicate a possible "
        "SQL injection attack.",

    "Web Attack - XSS":
        "Traffic characteristics indicate a possible "
        "cross-site scripting attack.",

    "Web Attack � XSS":
        "Traffic characteristics indicate a possible "
        "cross-site scripting attack.",
}


# ============================================================
# FEATURE HELPERS
# ============================================================

def get_feature(features, name, default=0.0):
    """
    Safely retrieve a numeric network-flow feature.

    Supports dictionaries and pandas-like rows.
    """

    if features is None:
        return default

    if isinstance(features, dict):

        value = features.get(
            name,
            default
        )

    else:

        try:

            value = features[name]

        except (
            KeyError,
            IndexError,
            TypeError,
        ):

            return default

    try:

        if value is None:
            return default

        return float(value)

    except (
        ValueError,
        TypeError,
    ):

        return default


# ============================================================
# RULE: PORT SCAN
# ============================================================

def rule_port_scan(features):
    """
    Detect possible port-scanning behaviour.

    A single flow cannot prove a port scan because CIC-IDS2017
    flow records do not directly provide the number of distinct
    destination ports scanned by a host.

    Therefore this rule requires several supporting indicators.

    Evidence:

    - Very short flow
    - Very small packet exchange
    - TCP SYN activity
    - No substantial response traffic
    """

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

    syn_flags = get_feature(
        features,
        "SYN Flag Count"
    )

    ack_flags = get_feature(
        features,
        "ACK Flag Count"
    )

    # Strong scanning-like flow characteristics.

    short_flow = (
        flow_duration <= 100000
    )

    small_exchange = (
        total_fwd_packets <= 4
        and total_bwd_packets <= 2
    )

    syn_activity = (
        syn_flags >= 1
    )

    limited_response = (
        total_bwd_packets <= 1
        and ack_flags <= 1
    )

    evidence_count = sum([
        short_flow,
        small_exchange,
        syn_activity,
        limited_response,
    ])

    # Require multiple independent indicators.

    return evidence_count >= 3


# ============================================================
# RULE: DDoS
# ============================================================

def rule_ddos(features):
    """
    Detect strong high-volume DDoS-like characteristics.

    A single high packet-rate or byte-rate measurement is
    insufficient. Multiple traffic-volume indicators are
    required before the symbolic rule fires.
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

    flow_bytes_per_second = get_feature(
        features,
        "Flow Bytes/s"
    )

    packet_length_mean = get_feature(
        features,
        "Packet Length Mean"
    )

    total_packets = (
        total_fwd_packets
        + total_bwd_packets
    )

    high_packet_volume = (
        total_packets > 1000
    )

    very_high_packet_rate = (
        flow_packets_per_second > 10000
    )

    high_byte_rate = (
        flow_bytes_per_second > 1_000_000
    )

    traffic_volume = (
        total_packets > 500
    )

    # Multiple indicators must support the classification.

    evidence_count = sum([
        high_packet_volume,
        very_high_packet_rate,
        high_byte_rate,
        traffic_volume,
    ])

    # Additional consistency check.

    if (
        packet_length_mean <= 0
        and evidence_count < 3
    ):
        return False

    return evidence_count >= 2


# ============================================================
# RULE: GENERAL DoS
# ============================================================

def rule_dos(features):
    """
    Detect high-volume Denial of Service characteristics.

    This rule is intentionally weaker than the DDoS rule but
    still requires multiple supporting indicators.
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

    flow_packets_per_second = get_feature(
        features,
        "Flow Packets/s"
    )

    total_packets = (
        total_fwd_packets
        + total_bwd_packets
    )

    high_packet_volume = (
        total_packets > 500
    )

    high_byte_rate = (
        flow_bytes_per_second > 1_000_000
    )

    high_packet_rate = (
        flow_packets_per_second > 5000
    )

    evidence_count = sum([
        high_packet_volume,
        high_byte_rate,
        high_packet_rate,
    ])

    return evidence_count >= 2


# ============================================================
# RULE: BRUTE FORCE
# ============================================================

def rule_bruteforce(features):
    """
    Detect authentication-oriented traffic.

    This is supporting evidence only.

    Common CIC-IDS2017 authentication ports:

        21 -> FTP
        22 -> SSH

    Multiple packets are required so that an ordinary
    single connection is not immediately classified
    as brute-force behaviour.
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

    flow_duration = get_feature(
        features,
        "Flow Duration"
    )

    authentication_port = (
        destination_port in {
            21,
            22,
        }
    )

    repeated_forward_traffic = (
        total_fwd_packets >= 8
    )

    response_traffic = (
        total_bwd_packets >= 1
    )

    active_flow = (
        flow_duration > 0
    )

    evidence_count = sum([
        authentication_port,
        repeated_forward_traffic,
        response_traffic,
        active_flow,
    ])

    return evidence_count >= 4


# ============================================================
# RULE: WEB ATTACK
# ============================================================

def rule_web_attack(features):
    """
    Detect suspicious web-application traffic.

    This rule identifies supporting evidence only.

    Ports commonly associated with HTTP traffic are checked
    together with sustained forward traffic.
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

    web_port = (
        destination_port in {
            80,
            443,
            8080,
            8000,
        }
    )

    sustained_forward_traffic = (
        total_fwd_packets > 20
    )

    response_traffic = (
        total_bwd_packets > 0
    )

    active_flow = (
        flow_duration > 0
    )

    evidence_count = sum([
        web_port,
        sustained_forward_traffic,
        response_traffic,
        active_flow,
    ])

    return evidence_count >= 4


# ============================================================
# SYMBOLIC EVIDENCE SCORE
# ============================================================

def _rule_scores(features):
    """
    Calculate symbolic evidence scores.

    Scores are NOT probabilities.

    They represent how strongly the observed flow matches
    the deterministic conditions of each symbolic rule.
    """

    scores = {}

    # --------------------------------------------------------
    # DDoS
    # --------------------------------------------------------

    ddos_indicators = [

        (
            get_feature(
                features,
                "Total Fwd Packets"
            )
            +
            get_feature(
                features,
                "Total Backward Packets"
            )
        ) > 1000,

        get_feature(
            features,
            "Flow Packets/s"
        ) > 10000,

        get_feature(
            features,
            "Flow Bytes/s"
        ) > 1_000_000,

    ]

    scores["DDoS"] = (
        sum(ddos_indicators)
        / len(ddos_indicators)
        * 100
    )


    # --------------------------------------------------------
    # DoS
    # --------------------------------------------------------

    dos_indicators = [

        (
            get_feature(
                features,
                "Total Fwd Packets"
            )
            +
            get_feature(
                features,
                "Total Backward Packets"
            )
        ) > 500,

        get_feature(
            features,
            "Flow Bytes/s"
        ) > 1_000_000,

        get_feature(
            features,
            "Flow Packets/s"
        ) > 5000,

    ]

    scores["DoS"] = (
        sum(dos_indicators)
        / len(dos_indicators)
        * 100
    )


    # --------------------------------------------------------
    # PortScan
    # --------------------------------------------------------

    port_scan_indicators = [

        get_feature(
            features,
            "Flow Duration"
        ) <= 100000,

        (
            get_feature(
                features,
                "Total Fwd Packets"
            ) <= 4
            and
            get_feature(
                features,
                "Total Backward Packets"
            ) <= 2
        ),

        get_feature(
            features,
            "SYN Flag Count"
        ) >= 1,

        (
            get_feature(
                features,
                "Total Backward Packets"
            ) <= 1
            and
            get_feature(
                features,
                "ACK Flag Count"
            ) <= 1
        ),
    ]

    scores["PortScan"] = (
        sum(port_scan_indicators)
        / len(port_scan_indicators)
        * 100
    )


    # --------------------------------------------------------
    # Brute Force
    # --------------------------------------------------------

    bruteforce_indicators = [

        get_feature(
            features,
            "Destination Port"
        ) in {
            21,
            22,
        },

        get_feature(
            features,
            "Total Fwd Packets"
        ) >= 8,

        get_feature(
            features,
            "Total Backward Packets"
        ) >= 1,

        get_feature(
            features,
            "Flow Duration"
        ) > 0,

    ]

    scores["BruteForce"] = (
        sum(bruteforce_indicators)
        / len(bruteforce_indicators)
        * 100
    )


    # --------------------------------------------------------
    # Web Attack
    # --------------------------------------------------------

    web_indicators = [

        get_feature(
            features,
            "Destination Port"
        ) in {
            80,
            443,
            8080,
            8000,
        },

        get_feature(
            features,
            "Total Fwd Packets"
        ) > 20,

        get_feature(
            features,
            "Total Backward Packets"
        ) > 0,

        get_feature(
            features,
            "Flow Duration"
        ) > 0,

    ]

    scores["WebAttack"] = (
        sum(web_indicators)
        / len(web_indicators)
        * 100
    )


    return scores


# ============================================================
# MAIN SYMBOLIC DETECTOR
# ============================================================

def detect_attack_rules(features):
    """
    Execute symbolic security reasoning.

    The symbolic engine evaluates several independent
    evidence sources before selecting a classification.

    Priority is used only when multiple rules have comparable
    evidence.

    Returns:

        DDoS
        DoS
        PortScan
        SSH-Patator
        FTP-Patator
        Web Attack
        Normal
    """

    if features is None:
        return "Normal"


    scores = _rule_scores(
        features
    )


    # --------------------------------------------------------
    # Determine strongest symbolic evidence
    # --------------------------------------------------------

    best_attack = max(
        scores,
        key=scores.get
    )

    best_score = scores[
        best_attack
    ]


    # --------------------------------------------------------
    # Require meaningful symbolic evidence
    # --------------------------------------------------------

    if best_score < 75:

        return "Normal"


    # --------------------------------------------------------
    # DDoS
    # --------------------------------------------------------

    if (
        best_attack == "DDoS"
        and rule_ddos(features)
    ):

        return "DDoS"


    # --------------------------------------------------------
    # DoS
    # --------------------------------------------------------

    if (
        best_attack == "DoS"
        and rule_dos(features)
    ):

        return "DoS"


    # --------------------------------------------------------
    # PortScan
    # --------------------------------------------------------

    if (
        best_attack == "PortScan"
        and rule_port_scan(features)
    ):

        return "PortScan"


    # --------------------------------------------------------
    # Brute Force
    # --------------------------------------------------------

    if (
        best_attack == "BruteForce"
        and rule_bruteforce(features)
    ):

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

    if (
        best_attack == "WebAttack"
        and rule_web_attack(features)
    ):

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
    Return a human-readable explanation for a symbolic
    classification.
    """

    if prediction is None:

        return (
            "No symbolic prediction was generated."
        )


    prediction = str(
        prediction
    ).strip()


    if prediction in ATTACK_EXPLANATIONS:

        return ATTACK_EXPLANATIONS[
            prediction
        ]


    if prediction.startswith(
        "Web Attack"
    ):

        return (
            "Suspicious web application traffic "
            "was detected."
        )


    return (
        "The symbolic engine detected traffic "
        "characteristics associated with this "
        "attack class."
    )


# ============================================================
# SYMBOLIC RULE DETAILS
# ============================================================

def get_rule_details(features):
    """
    Return which symbolic rules fired.

    These values represent deterministic evidence and are
    useful for explainability.
    """

    details = {

        "ddos_rule":
            rule_ddos(
                features
            ),

        "dos_rule":
            rule_dos(
                features
            ),

        "port_scan_rule":
            rule_port_scan(
                features
            ),

        "bruteforce_rule":
            rule_bruteforce(
                features
            ),

        "web_attack_rule":
            rule_web_attack(
                features
            ),
    }


    return details


# ============================================================
# SYMBOLIC CONFIDENCE
# ============================================================

def symbolic_confidence(features):
    """
    Return symbolic evidence strength.

    IMPORTANT:

    This is NOT a statistical probability.

    It represents the percentage of symbolic indicators
    supporting the selected symbolic classification.
    """

    if features is None:

        return 0.0


    prediction = detect_attack_rules(
        features
    )


    if prediction == "Normal":

        return 0.0


    scores = _rule_scores(
        features
    )


    score_mapping = {

        "DDoS":
            "DDoS",

        "DoS":
            "DoS",

        "PortScan":
            "PortScan",

        "SSH-Patator":
            "BruteForce",

        "FTP-Patator":
            "BruteForce",

        "Web Attack":
            "WebAttack",

    }


    score_key = score_mapping.get(
        prediction
    )


    if score_key is None:

        return 0.0


    return round(
        float(
            scores.get(
                score_key,
                0.0
            )
        ),
        2
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 70)

    print(
        "AEGIS-NSAI SYMBOLIC RULE ENGINE TEST"
    )

    print("=" * 70)


    # --------------------------------------------------------
    # Normal sample
    # --------------------------------------------------------

    normal_sample = {

        "Destination Port": 443,

        "Flow Duration": 500000,

        "Total Fwd Packets": 5,

        "Total Backward Packets": 5,

        "Flow Packets/s": 20,

        "Flow Bytes/s": 10000,

        "SYN Flag Count": 0,

        "ACK Flag Count": 5,

    }


    # --------------------------------------------------------
    # DDoS sample
    # --------------------------------------------------------

    ddos_sample = {

        "Destination Port": 80,

        "Flow Duration": 1000,

        "Total Fwd Packets": 5000,

        "Total Backward Packets": 3000,

        "Flow Packets/s": 20000,

        "Flow Bytes/s": 5000000,

        "Packet Length Mean": 500,

        "SYN Flag Count": 1,

        "ACK Flag Count": 1,

    }


    # --------------------------------------------------------
    # Port scan sample
    # --------------------------------------------------------

    port_scan_sample = {

        "Destination Port": 443,

        "Flow Duration": 1000,

        "Total Fwd Packets": 2,

        "Total Backward Packets": 1,

        "Flow Packets/s": 3,

        "Flow Bytes/s": 100,

        "SYN Flag Count": 1,

        "ACK Flag Count": 0,

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
            f"Symbolic prediction : "
            f"{prediction}"
        )

        print(
            f"Symbolic evidence   : "
            f"{confidence}%"
        )

        print(
            f"Explanation         : "
            f"{explanation}"
        )

        print(
            f"Rules               : "
            f"{details}"
        )

    print()
    print("=" * 70)