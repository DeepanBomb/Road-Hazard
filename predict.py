import cv2
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_WEIGHTS_PATH = os.path.join(BASE_DIR, "model", "best1.pt")

yolo_model = None
resnet_model = None

def get_yolo():
    global yolo_model
    if yolo_model is None:
        print("Loading YOLOv8 Custom Model...")
        try:
            from ultralytics import YOLO
            yolo_model = YOLO(DEFAULT_WEIGHTS_PATH)
        except Exception as e:
            print(f"Warning: Could not load YOLO: {e}")
    return yolo_model

# ResNet fallback disabled to reduce memory usage on free hosting
# def get_resnet():
#     global resnet_model
#     if resnet_model is None:
#         print("Loading Hazard AI Model (ResNet50 + OpenCV)...")
#         try:
#             from tensorflow.keras.applications.resnet50 import ResNet50
#             resnet_model = ResNet50(weights='imagenet')
#         except Exception as e:
#             print(f"Warning: Could not load ResNet50: {e}")
#     return resnet_model

def detect_waterlogging(image_path):
    """
    Uses OpenCV color heuristics to detect large bodies of water/puddles
    """
    img = cv2.imread(image_path)
    if img is None:
        return False, 0.0

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_murky = np.array([5, 20, 20])
    upper_murky = np.array([40, 255, 200])
    mask = cv2.inRange(hsv, lower_murky, upper_murky)
    water_ratio = cv2.countNonZero(mask) / (img.shape[0] * img.shape[1])
    return water_ratio > 0.25, water_ratio


def detect_hazard(image_path, weights_path=DEFAULT_WEIGHTS_PATH):
    """
    Ensemble AI: Combines YOLOv8, ResNet50, and OpenCV for multi-hazard detection.
    """
    detections = []
    
    # --- PHASE 1: PRECISION YOLO (Highest Priority) ---
    current_yolo = get_yolo()
    if current_yolo is not None:
        try:
            results = current_yolo(image_path, imgsz=320, verbose=False)
            for r in results:
                for box in r.boxes:
                    confidence = float(box.conf[0])
                    # If YOLO is reasonably confident, prioritize it heavily
                    if confidence > 0.3: 
                        detections.append({
                            "class": "pothole", 
                            "confidence": confidence + 0.5, # Boost YOLO confidence so it overrides ResNet guesses
                            "bbox": box.xyxy[0].tolist()
                        })
        except Exception as e:
            print(f"YOLO Inference Error: {e}")

    # --- PHASE 2: AMBIENT OPENCV (Waterlogging) ---
    is_waterlogged, intensity = detect_waterlogging(image_path)
    if is_waterlogged:
        detections.append({
            "class": "waterlogging",
            "confidence": min(0.95, intensity * 2), 
            "bbox": [0, 0, 600, 600] 
        })
        
    # --- PHASE 3: GENERALIZED RESNET (Disabled to save memory on free hosting) ---
    # ResNet + TensorFlow requires ~500MB+ RAM which causes OOM on Render free tier
    # YOLO + OpenCV waterlogging detection is sufficient for production use

    # --- PHASE 4: LAST RESORT FALLBACK ---
    if len(detections) == 0:
        detections.append({
            "class": "unclassified_road_hazard",
            "confidence": 0.50,
            "bbox": [100, 100, 400, 400]
        })

    # Sort by highest confidence and return the top threat
    detections.sort(key=lambda x: x['confidence'], reverse=True)
    
    # Cap maximum confidence at 1.0 (since we mathematically boosted YOLO)
    detections[0]["confidence"] = min(1.0, detections[0]["confidence"])
    
    return [detections[0]]

