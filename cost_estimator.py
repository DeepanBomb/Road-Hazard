def estimate_cost(severity_score, road_type="city"):

    base_cost = 10000

    road_factor = {
        "local": 1,
        "city": 2,
        "highway": 3
    }

    cost = severity_score * base_cost * road_factor[road_type]

    return int(cost)