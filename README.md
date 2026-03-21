# RoadSentinel AI

### AI-Powered Road Hazard Detection & Monitoring System

---

## Overview

RoadSentinel AI is a smart civic-tech platform that enables citizens to report road hazards and helps authorities prioritize repairs using AI-driven insights. The system uses computer vision to detect hazards, estimate severity, and compute repair costs, which are then visualized on an interactive dashboard.

---

## Problem Statement

Poor road conditions contribute to a significant number of accidents, yet there is no structured, real-time system for reporting and prioritizing road hazards. This project aims to convert citizens into real-time infrastructure sensors and provide actionable data to municipal authorities.

---

## Features

### AI Hazard Detection

* Detects road hazards from images using YOLOv8
* Supports: potholes, broken edges, waterlogging, missing manholes

### Severity Scoring

* Calculates severity based on bounding box size
* Categorizes hazards into Low, Medium, and Severe

### Repair Cost Estimation

* Estimates repair cost using severity-based logic
* Helps authorities prioritize budget allocation

### Interactive Map Dashboard

* Displays hazards on a live map using Leaflet
* Color-coded markers based on severity

### Analytics Dashboard

* Total hazards, severe cases, and cost estimation
* Priority repair list for decision-making

### API Integration

* FastAPI backend processes image inputs
* Returns structured JSON for frontend consumption

---

## System Architecture

```
Citizen Input (Image + GPS)
            ↓
      FastAPI Backend
            ↓
   YOLOv8 Detection Model
            ↓
     Severity Scoring
            ↓
   Repair Cost Estimator
            ↓
        Database
            ↓
     React Dashboard
            ↓
   Map + Analytics View
```

---

## Tech Stack

**Frontend**

* React (Vite)
* Leaflet.js
* Chart.js

**Backend**

* FastAPI (Python)

**AI / ML**

* YOLOv8 (Ultralytics)
* scikit-learn (for prediction)

**Database**

* Supabase / Firebase (optional)

---

## Project Structure

```
road-hazard-ai/
│
├── frontend/        # React dashboard
├── backend/         # FastAPI server
├── model/           # YOLO model
├── dataset/         # Simulated data
└── README.md
```

---

## Setup Instructions

### 1. Clone Repository

```
git clone https://github.com/your-username/road-sentinel-ai.git
cd road-sentinel-ai
```

---

### 2. Backend Setup

```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## API Endpoint

### POST `/predict`

**Input**

* Image file

**Output**

```
{
  "hazard": "pothole",
  "confidence": 0.91,
  "severity": "Severe",
  "repair_cost": 5400
}
```

---

## Demo Flow

1. User uploads an image of a road hazard
2. AI model detects hazard and assigns severity
3. Repair cost is estimated
4. Hazard is plotted on the dashboard map
5. Authorities can prioritize repairs

---

## Impact

* Enables real-time infrastructure monitoring
* Improves road safety
* Provides data-driven decision-making for authorities
* Encourages citizen participation

---

## Future Enhancements

* Predictive hazard hotspot mapping
* Contractor accountability verification system
* Weather-based hazard prioritization
* Gamified citizen reporting leaderboard

---
