import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input, decode_predictions
from tensorflow.keras.preprocessing import image
from ultralytics import YOLO
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_WEIGHTS_PATH = os.path.join(BASE_DIR, "model", "best1.pt")

# 1. Initialize YOLO (Custom Potholes)
print("Loading YOLOv8 Custom Model...")
try:
    yolo_model = YOLO(DEFAULT_WEIGHTS_PATH)
except Exception as e:
    print(f"Warning: Could not load YOLO: {e}")
    yolo_model = None

# 2. Initialize ResNet50 (Fallback Generalized Hazards)
print("Loading Hazard AI Model (ResNet50 + OpenCV)...")
try:
    resnet_model = ResNet50(weights='imagenet')
except Exception as e:
    print(f"Warning: Could not load ResNet50: {e}")
    resnet_model = None

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
    if yolo_model is not None:
        try:
            results = yolo_model(image_path)
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
        
    # --- PHASE 3: GENERALIZED RESNET (Fallback) ---
    if resnet_model is not None and not any(d["class"] == "pothole" for d in detections):
        try:
            img = image.load_img(image_path, target_size=(224, 224))
            x = image.img_to_array(img)
            x = np.expand_dims(x, axis=0)
            x = preprocess_input(x)
            
            preds = resnet_model.predict(x)
            decoded = decode_predictions(preds, top=3)[0]
            hazard_keywords = ['hole', 'crater', 'debris', 'mud', 'rock', 'stone', 'log', 'tree', 'crack', 'street']
            
            for _class_id, label, prob in decoded:
                label_lower = label.lower()
                if any(keyword in label_lower for keyword in hazard_keywords) and prob > 0.15:
                    detections.append({
                        "class": label_lower if 'hole' not in label_lower else 'pothole',
                        "confidence": float(prob),
                        "bbox": [50, 50, 300, 300] 
                    })
        except Exception as e:
            print(f"Error during ResNet inference: {e}")

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

