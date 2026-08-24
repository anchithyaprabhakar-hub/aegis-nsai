"""
AEGIS-NSAI Knowledge Graph

Maps detected attack classes to related
security entities and concepts.
"""


# ============================================================
# ATTACK RELATIONSHIPS
# ============================================================

attack_relations = {

    "Normal": [
        "Normal Traffic",
        "No Malicious Activity"
    ],

    "Bot": [
        "Botnet",
        "Command and Control",
        "Malicious Communication"
    ],

    "DDoS": [
        "High Traffic",
        "Botnet",
        "Service Disruption"
    ],

    "DoS GoldenEye": [
        "Denial of Service",
        "HTTP Flood",
        "Service Disruption"
    ],

    "DoS Hulk": [
        "Denial of Service",
        "HTTP Flood",
        "High Traffic"
    ],

    "DoS Slowhttptest": [
        "Denial of Service",
        "Slow HTTP",
        "Service Disruption"
    ],

    "DoS slowloris": [
        "Denial of Service",
        "Slow Connections",
        "Service Disruption"
    ],

    "FTP-Patator": [
        "FTP",
        "Credential Attack",
        "Brute Force"
    ],

    "Heartbleed": [
        "SSL/TLS",
        "Memory Disclosure",
        "Data Exposure"
    ],

    "Infiltration": [
        "Network Infiltration",
        "Unauthorized Access",
        "Compromise"
    ],

    "PortScan": [
        "Reconnaissance",
        "Open Ports",
        "Network Scanning"
    ],

    "SSH-Patator": [
        "SSH",
        "Credential Attack",
        "Brute Force"
    ],

    "Web Attack � Brute Force": [
        "Web Application",
        "Credential Attack",
        "Brute Force"
    ],

    "Web Attack � Sql Injection": [
        "Web Application",
        "SQL Injection",
        "Database Attack"
    ],

    "Web Attack � XSS": [
        "Web Application",
        "Cross-Site Scripting",
        "Client-Side Attack"
    ],

    "Web Attack": [
        "Web Application",
        "Suspicious Request",
        "Application Attack"
    ],
}


# ============================================================
# GET ATTACK CONTEXT
# ============================================================

def get_attack_context(attack_name):

    if attack_name is None:

        return [
            "Unknown Attack"
        ]


    attack_name = str(
        attack_name
    ).strip()


    return attack_relations.get(
        attack_name,
        [
            "Unknown Attack"
        ]
    )


# ============================================================
# GET ALL RELATIONSHIPS
# ============================================================

def get_all_attack_relations():

    return attack_relations


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("AEGIS-NSAI KNOWLEDGE GRAPH TEST")
    print("=" * 60)

    test_attacks = [
        "Normal",
        "DDoS",
        "PortScan",
        "SSH-Patator",
        "Web Attack � Sql Injection"
    ]

    for attack in test_attacks:

        print(
            f"\n{attack}"
        )

        print(
            "  → "
            + ", ".join(
                get_attack_context(
                    attack
                )
            )
        )