from predict import detect_hazard
from severity import calculate_severity
from cost_estimator import estimate_cost
import json

image = "test_images/pothole1.jpg"

detections = detect_hazard(image)

total_cost = 0
results_list = []

for d in detections:

    bbox = d["bbox"]

    severity_score, severity = calculate_severity(image, bbox)

    cost = estimate_cost(severity_score)

    total_cost += cost

    pothole_data = {
        "hazard_type": "pothole",
        "severity": severity,
        "severity_score": severity_score,
        "estimated_repair_cost": cost
    }

    results_list.append(pothole_data)

summary = {
    "total_potholes": len(detections),
    "total_repair_cost": total_cost,
    "hazards": results_list
}

print(json.dumps(summary, indent=2))

with open("dashboard_data.json", "w") as f:
    json.dump(summary, f, indent=2)