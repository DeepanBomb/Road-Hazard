import cv2

def calculate_severity(image_path, bbox):

    img = cv2.imread(image_path)
    if img is None:
        return 0.1, "Low" # Fallback severity for unprocessable images

    h, w, _ = img.shape

    image_area = h * w

    x1, y1, x2, y2 = bbox

    bbox_area = (x2-x1)*(y2-y1)

    severity_score = bbox_area / image_area

    if severity_score < 0.05:
        severity = "Low"
    elif severity_score < 0.15:
        severity = "Medium"
    else:
        severity = "Severe"

    return severity_score, severity