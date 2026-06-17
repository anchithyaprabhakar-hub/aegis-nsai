attack_relations = {
    
    "Class 0": ["High Traffic", "Botnet", "Service Disruption"],
    "Class 1": ["Reconnaissance", "Open Ports"],
    "Class 2": ["Credential Theft", "Password Attack"]
}


def get_attack_context(attack_name):

    return attack_relations.get(
        attack_name,
        ["Unknown Attack"]
    )


if __name__ == "__main__":

    print(get_attack_context("Class 0"))