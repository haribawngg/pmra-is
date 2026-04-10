from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os

app = FastAPI()

# Cho phép React (chạy ở localhost:5173) gọi API mà không bị lỗi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế nên để frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Models & Scalers ────────────────────────────────────────────
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

try:
    with open(os.path.join(MODELS_DIR, "anemia_model.pkl"), "rb") as f:
        anemia_model = pickle.load(f)
    with open(os.path.join(MODELS_DIR, "anemia_scaler.pkl"), "rb") as f:
        anemia_scaler = pickle.load(f)
    print("✅ Loaded anemia model + scaler")
except Exception as e:
    print(f"⚠️  Chưa load được anemia model: {e}")
    anemia_model = None
    anemia_scaler = None

try:
    with open(os.path.join(MODELS_DIR, "diabetes_model.pkl"), "rb") as f:
        diabetes_model = pickle.load(f)
    with open(os.path.join(MODELS_DIR, "diabetes_scaler.pkl"), "rb") as f:
        diabetes_scaler = pickle.load(f)
    print("✅ Loaded diabetes model + scaler")
except Exception as e:
    print(f"⚠️  Chưa load được diabetes model: {e}")
    diabetes_model = None
    diabetes_scaler = None


# ─── Input Schemas ─────────────────────────────────────────────────────
class AnemiaInput(BaseModel):
    gender: int         # 0 = Nữ, 1 = Nam
    hemoglobin: float
    mch: float
    mchc: float
    mcv: float


class DiabetesInput(BaseModel):
    glucose: float
    blood_pressure: float
    skin_thickness: float
    insulin: float
    bmi: float
    diabetes_pedigree: float
    age: float


# ─── API Endpoints ─────────────────────────────────────────────────────
@app.post("/api/predict/anemia")
def predict_anemia(data: AnemiaInput):
    # Tạo array theo đúng thứ tự features model đã train:
    # [Gender, Hemoglobin, MCH, MCHC, MCV]
    input_features = np.array([[data.gender, data.hemoglobin, data.mch, data.mchc, data.mcv]])

    if anemia_model and anemia_scaler is not None:
        input_scaled = anemia_scaler.transform(input_features)
        prediction = int(anemia_model.predict(input_scaled)[0])
    else:
        # Fallback nếu model chưa load
        prediction = 1 if data.hemoglobin < 12 else 0

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Thiếu máu (Anemia)",
        "message": (
            "Phát hiện chỉ số bất thường từ mô hình Học máy."
            if prediction == 1
            else "Các chỉ số an toàn theo đánh giá của mô hình Học máy."
        ),
    }


@app.post("/api/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    # Tạo array theo đúng thứ tự features model đã train:
    # [Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age]
    input_features = np.array([[
        data.glucose,
        data.blood_pressure,
        data.skin_thickness,
        data.insulin,
        data.bmi,
        data.diabetes_pedigree,
        data.age,
    ]])

    if diabetes_model and diabetes_scaler is not None:
        input_scaled = diabetes_scaler.transform(input_features)
        prediction = int(diabetes_model.predict(input_scaled)[0])
    else:
        # Fallback nếu model chưa load
        prediction = 1 if data.glucose > 125 else 0

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Tiểu đường (Diabetes)",
        "message": (
            "Chỉ số Glucose cao, phát hiện nguy cơ theo mô hình Học máy."
            if prediction == 1
            else "Chỉ số an toàn theo đánh giá của mô hình Học máy."
        ),
    }


# Lệnh chạy: uvicorn main:app --reload --port 8000
# Hoặc: python main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
