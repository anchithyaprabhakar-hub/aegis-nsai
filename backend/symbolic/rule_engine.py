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
        "activity characterized by short flows, small "
        "packet exchanges, and limited response traffic.",

    "Bot":
        "Traffic characteristics indicate possible "
        "botnet-controlled communication.",

    "FTP-Patator":
        "Repeated FTP authentication behaviour indicates "
        "a possible brute-force attack.",

    "SSH-Patator":
        "Repeated SSH authentication behaviour indicates "
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

    Important design decision:

    CIC-IDS2017 PortScan flows do not consistently expose
    SYN activity through the selected SYN Flag Count feature.

    Therefore SYN activity is NOT required for this rule.

    The rule instead uses the indicators that were empirically
    observed in the PortScan dataset:

        1. Short flow
        2. Small packet exchange
        3. Limited response traffic

    A single flow cannot prove a complete port scan. This rule
    therefore represents flow-level scanning evidence only.

    Returns True when all three independent indicators agree.
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

    ack_flags = get_feature(
        features,
        "ACK Flag Count"
    )

    # --------------------------------------------------------
    # Indicator 1: Short flow
    # --------------------------------------------------------

    short_flow = (
        flow_duration <= 100000
    )

    # --------------------------------------------------------
    # Indicator 2: Small packet exchange
    # --------------------------------------------------------

    small_exchange = (
        total_fwd_packets <= 4
        and
        total_bwd_packets <= 2
    )

    # --------------------------------------------------------
    # Indicator 3: Limited response
    # --------------------------------------------------------

    limited_response = (
        total_bwd_packets <= 1
        and
        ack_flags <= 1
    )

    evidence_count = sum([
        short_flow,
        small_exchange,
        limited_response,
    ])

    # All three indicators are required.
    return evidence_count >= 3


# ============================================================
# RULE: DDoS
# ============================================================

def rule_ddos(features):
    """
    Detect strong high-volume DDoS-like characteristics.

    Multiple independent traffic-volume indicators are
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

    evidence_count = sum([
        high_packet_volume,
        very_high_packet_rate,
        high_byte_rate,
        traffic_volume,
    ])

    # Reject obviously invalid traffic records.
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

    IMPORTANT:

    Port 21 or 22 alone does NOT indicate brute force.

    A normal SSH/FTP connection can legitimately use these
    ports. Therefore the rule requires:

        1. Authentication service port
        2. Repeated forward packets
        3. Multiple response packets
        4. Meaningful packet exchange

    This remains flow-level supporting evidence and should
    ultimately be combined across multiple flows.
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

    # Increased threshold to reduce false positives from
    # ordinary SSH/FTP connections.
    repeated_forward_traffic = (
        total_fwd_packets >= 12
    )

    # Require multiple response packets rather than a single
    # response packet.
    repeated_response_traffic = (
        total_bwd_packets >= 3
    )

    active_flow = (
        flow_duration > 0
    )

    evidence_count = sum([
        authentication_port,
        repeated_forward_traffic,
        repeated_response_traffic,
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

    HTTP/HTTPS ports are combined with sustained traffic and
    bidirectional communication.
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

    IMPORTANT:

    The indicators used here are deliberately aligned with
    the corresponding rule functions above.
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

        # Short flow
        get_feature(
            features,
            "Flow Duration"
        ) <= 100000,

        # Small packet exchange
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

        # Limited response
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

        # Authentication service
        get_feature(
            features,
            "Destination Port"
        ) in {
            21,
            22,
        },

        # Repeated forward traffic
        get_feature(
            features,
            "Total Fwd Packets"
        ) >= 12,

        # Multiple responses
        get_feature(
            features,
            "Total Backward Packets"
        ) >= 3,

        # Active connection
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

    if features is None:

        return {

            "ddos_rule": False,

            "dos_rule": False,

            "port_scan_rule": False,

            "bruteforce_rule": False,

            "web_attack_rule": False,
        }


    return {

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

        "Packet Length Mean": 500,
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
    # PortScan sample
    # --------------------------------------------------------

    port_scan_sample = {

        "Destination Port": 443,

        "Flow Duration": 1000,

        "Total Fwd Packets": 2,

        "Total Backward Packets": 1,

        "Flow Packets/s": 3,

        "Flow Bytes/s": 100,

        "SYN Flag Count": 0,

        "ACK Flag Count": 0,

        "Packet Length Mean": 50,
    }


    # --------------------------------------------------------
    # SSH normal-like sample
    # --------------------------------------------------------

    ssh_normal_sample = {

        "Destination Port": 22,

        "Flow Duration": 500000,

        "Total Fwd Packets": 5,

        "Total Backward Packets": 5,

        "Flow Packets/s": 20,

        "Flow Bytes/s": 10000,

        "SYN Flag Count": 1,

        "ACK Flag Count": 5,

        "Packet Length Mean": 500,
    }


    # --------------------------------------------------------
    # SSH brute-force-like sample
    # --------------------------------------------------------

    ssh_bruteforce_sample = {

        "Destination Port": 22,

        "Flow Duration": 100000,

        "Total Fwd Packets": 20,

        "Total Backward Packets": 5,

        "Flow Packets/s": 100,

        "Flow Bytes/s": 50000,

        "SYN Flag Count": 1,

        "ACK Flag Count": 2,

        "Packet Length Mean": 200,
    }


    samples = {

        "Normal sample":
            normal_sample,

        "DDoS sample":
            ddos_sample,

        "PortScan sample":
            port_scan_sample,

        "SSH normal-like sample":
            ssh_normal_sample,

        "SSH brute-force-like sample":
            ssh_bruteforce_sample,
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