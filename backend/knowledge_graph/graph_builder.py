attack_relations = {
    "DDoS": [
        "High Traffic",
        "Botnet",
        "Service Disruption"
    ],

    "PortScan": [
        "Reconnaissance",
        "Open Ports"
    ],

    "BruteForce": [
        "Credential Theft",
        "Password Attack"
    ]
}


def get_attack_context(attack_name):

    return attack_relations.get(
        attack_name,
        ["Unknown Attack"]
    )


if __name__ == "__main__":

    print(get_attack_context("Class 0"))