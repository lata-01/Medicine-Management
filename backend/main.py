from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from fastapi import HTTPException
import models
from database import engine, SessionLocal

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Medicine Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schema
class MedicineSchema(BaseModel):
    id: int
    name: str
    quantity: int
    price: float

    class Config:
        orm_mode = True

# ---------------- APIs ----------------

# VIEW ALL + SEARCH (always returns list)
@app.get("/medicines")
def get_medicines(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Medicine)
    if search:
        query = query.filter(models.Medicine.name.ilike(f"%{search}%"))
    return query.all()

# ADD MEDICINE (with duplicate ID check)
@app.post("/medicines")
def add_medicine(medicine: MedicineSchema, db: Session = Depends(get_db)):
    existing = db.query(models.Medicine).filter(
        models.Medicine.id == medicine.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Medicine with this ID already exists"
        )

    med = models.Medicine(**medicine.model_dump())
    db.add(med)
    db.commit()

    return {"message": "Medicine added successfully"}


# DELETE MEDICINE
@app.delete("/medicines/{med_id}")
def delete_medicine(med_id: int, db: Session = Depends(get_db)):
    med = db.query(models.Medicine).filter(models.Medicine.id == med_id).first()
    if med:
        db.delete(med)
        db.commit()
    return {"message": "Medicine deleted successfully"}

# UPDATE QUANTITY
@app.put("/medicines/{med_id}")
def update_quantity(
    med_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    med = db.query(models.Medicine).filter(models.Medicine.id == med_id).first()

    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    med.quantity = quantity
    db.commit()

    return {"message": "Quantity updated successfully"}

