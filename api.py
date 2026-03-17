from fastapi import FastAPI, Depends, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import uuid

from database import engine, get_db, Base, Report
from predict import detect_hazard
from severity import calculate_severity
from cost_estimator import estimate_cost

app = FastAPI(title="Road Hazard Monitoring API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://road-hazard.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.post("/api/reports")
async def create_report(
    gps_lat: float = Form(...),
    gps_long: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        detections = detect_hazard(file_path)
        
        if not detections:
            return {
                "message": "No hazards detected in the image.",
                "hazard_type": "none",
                "severity_label": "None",
                "severity_score": 0.0,
                "estimated_cost": 0,
                "image_url": f"/uploads/{unique_filename}"
            }
            
        # For simplicity, if multiple are detected, we take the one with highest severity
        max_severity = 0.0
        best_detection = None
        best_severity_label = "Low"

        for d in detections:
            bbox = d["bbox"]
            sev_score, sev_label = calculate_severity(file_path, bbox)
            
            # Since our new unclassified fallback bbox is large, let's also factor in confidence
            if d["class"] in ["waterlogging", "unclassified_road_hazard"]:
                sev_score = d["confidence"] * 0.5 
                
                if sev_score < 0.15:
                    sev_label = "Low"
                elif sev_score < 0.30:
                    sev_label = "Medium"
                else:
                    sev_label = "Severe"
                    
            if sev_score > max_severity:
                max_severity = sev_score
                best_severity_label = sev_label
                best_detection = d
                
        hazard_type = best_detection["class"] if best_detection else "unknown hazard"
        
        cost = estimate_cost(max_severity)

        new_report = Report(
            gps_lat=gps_lat,
            gps_long=gps_long,
            image_path=f"/uploads/{unique_filename}",
            hazard_type=hazard_type,
            severity_label=best_severity_label,
            severity_score=max_severity,
            estimated_cost=cost,
            status="reported"
        )
        
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report submitted successfully.",
            "report_id": new_report.id,
            "hazard_type": new_report.hazard_type,
            "severity_label": new_report.severity_label,
            "severity_score": new_report.severity_score,
            "estimated_cost": new_report.estimated_cost,
            "image_url": new_report.image_path
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/reports")
def get_reports(db: Session = Depends(get_db)):
    reports = db.query(Report).order_by(Report.date_reported.desc()).all()
    return reports

@app.patch("/api/reports/{report_id}/resolve")
def resolve_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    report.status = "resolved"
    db.commit()
    db.refresh(report)
    
    return {"message": "Report resolved successfully", "report_id": report.id, "status": report.status}

@app.post("/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    if username == "admin" and password == "admin123":
        return {"token": "fake-jwt-token-for-hackathon", "role": "admin"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=False)
