from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
# import joblib # Nếu bạn dùng joblib để save model
import numpy as np

app = FastAPI()

# Cho phép React (chạy ở localhost:5173) gọi API mà không bị lỗi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Trong thực tế nên để frontend domain, vd: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Tải Model (Mở comment khi bạn đã để file model đúng vị trí)
# try:
#     anemia_model = pickle.load(open("anemia_model.pkl", "rb"))
#     diabetes_model = pickle.load(open("diabetes_model.pkl", "rb"))
# except Exception as e:
#     print("Chưa tìm thấy model: ", e)
#     anemia_model = None
#     diabetes_model = None

# 2. Định nghĩa cấu trúc dữ liệu gửi lên từ React (Frontend)
class AnemiaInput(BaseModel):
    hemoglobin: float
    mch: float
    mchc: float
    mcv: float

class DiabetesInput(BaseModel):
    glucose: float
    hba1c: float
    systolic_bp: float
    diastolic_bp: float

# 3. Tạo API Endpoint cho Thiếu máu
@app.post("/api/predict/anemia")
def predict_anemia(data: AnemiaInput):
    # Biến đổi thành ma trận numpy tương ứng model của bạn
    input_features = np.array([[data.hemoglobin, data.mch, data.mchc, data.mcv]])
    
    # if anemia_model:
    #     prediction = anemia_model.predict(input_features)[0]
    # else:
    #     prediction = 1 # Chạy tạm khi chưa có file model
    
    # Tạm thời để logic giả lập để bạn thấy cách trả về JSON
    prediction = 1 if data.hemoglobin < 12 else 0

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Thiếu máu (Anemia)",
        "message": "Phát hiện chỉ số bất thường từ mô hình Học máy." if prediction == 1 else "Các chỉ số an toàn theo đánh giá của mô hình Học máy."
    }

# 4. Tạo API Endpoint cho Tiểu đường
@app.post("/api/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    input_features = np.array([[data.glucose, data.hba1c, data.systolic_bp, data.diastolic_bp]])
    
    # if diabetes_model:
    #     prediction = diabetes_model.predict(input_features)[0]
    # else:
    #     prediction = 0 
    
    prediction = 1 if data.glucose > 125 else 0

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Tiểu đường (Diabetes)",
        "message": "Chỉ số Glucose cao, phát hiện nguy cơ theo mô hình Học máy." if prediction == 1 else "Chỉ số an toàn theo đánh giá của mô hình Học máy."
    }

# Lệnh chạy: uvicorn main:app --reload --port 8000
