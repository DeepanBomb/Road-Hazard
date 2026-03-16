import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

DATABASE_URL = "sqlite:///./hazards.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    gps_lat = Column(Float, nullable=False)
    gps_long = Column(Float, nullable=False)
    image_path = Column(String, nullable=False)
    hazard_type = Column(String, index=True)
    severity_label = Column(String)
    severity_score = Column(Float)
    estimated_cost = Column(Integer)
    status = Column(String, default="reported", index=True) # reported, resolved
    date_reported = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
