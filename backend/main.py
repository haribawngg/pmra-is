from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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


# ─── Clinical Explanation Engine ──────────────────────────────────────

def analyze_anemia_indicators(data: AnemiaInput) -> list:
    """
    So sánh từng chỉ số với ngưỡng lâm sàng chuẩn (WHO/lab reference).
    Trả về list các dict mô tả trạng thái và giải thích từng chỉ số.
    """
    results = []

    # 1. Hemoglobin — ngưỡng theo giới tính (WHO)
    hgb_min = 13.0 if data.gender == 1 else 12.0
    gender_text = "nam" if data.gender == 1 else "nữ"
    hgb_status = "NORMAL"
    if data.hemoglobin < hgb_min:
        if data.hemoglobin < hgb_min - 3:
            hgb_status = "CRITICAL_LOW"
        else:
            hgb_status = "LOW"
    results.append({
        "indicator": "Hemoglobin",
        "value": data.hemoglobin,
        "unit": "g/dL",
        "reference": f"≥{hgb_min} g/dL (với {gender_text})",
        "status": hgb_status,
        "explanation": {
            "NORMAL": f"Hemoglobin {data.hemoglobin} g/dL nằm trong giới hạn bình thường (≥{hgb_min} g/dL với {gender_text}).",
            "LOW": f"Hemoglobin {data.hemoglobin} g/dL thấp hơn ngưỡng bình thường (≥{hgb_min} g/dL với {gender_text}). Đây là chỉ điểm chính của thiếu máu.",
            "CRITICAL_LOW": f"Hemoglobin {data.hemoglobin} g/dL rất thấp (≥{hgb_min} g/dL với {gender_text}). Mức độ thiếu máu nặng, cần đánh giá lâm sàng khẩn cấp.",
        }[hgb_status]
    })

    # 2. MCH — Mean Corpuscular Hemoglobin (27–33 pg)
    mch_status = "NORMAL"
    if data.mch < 27:
        mch_status = "LOW"
    elif data.mch > 33:
        mch_status = "HIGH"
    results.append({
        "indicator": "MCH",
        "value": data.mch,
        "unit": "pg",
        "reference": "27–33 pg",
        "status": mch_status,
        "explanation": {
            "NORMAL": f"MCH {data.mch} pg bình thường (27–33 pg). Lượng Hemoglobin trong mỗi hồng cầu ở mức ổn định.",
            "LOW": f"MCH {data.mch} pg thấp hơn bình thường (27–33 pg). Mỗi hồng cầu chứa ít Hemoglobin hơn, thường gặp trong thiếu máu thiếu sắt.",
            "HIGH": f"MCH {data.mch} pg cao hơn bình thường (27–33 pg). Có thể liên quan đến thiếu B12/Folate hoặc hồng cầu to.",
        }[mch_status]
    })

    # 3. MCHC — Mean Corpuscular Hemoglobin Concentration (32–36 g/dL)
    mchc_status = "NORMAL"
    if data.mchc < 32:
        mchc_status = "LOW"
    elif data.mchc > 36:
        mchc_status = "HIGH"
    results.append({
        "indicator": "MCHC",
        "value": data.mchc,
        "unit": "g/dL",
        "reference": "32–36 g/dL",
        "status": mchc_status,
        "explanation": {
            "NORMAL": f"MCHC {data.mchc} g/dL bình thường (32–36 g/dL). Nồng độ Hemoglobin trong từng hồng cầu ở mức ổn định.",
            "LOW": f"MCHC {data.mchc} g/dL thấp (32–36 g/dL). Hồng cầu nhược sắc — thiếu Hemoglobin tương đối, thường gặp trong thiếu sắt mạn tính.",
            "HIGH": f"MCHC {data.mchc} g/dL cao (32–36 g/dL). Có thể là hereditary spherocytosis hoặc lỗi xét nghiệm.",
        }[mchc_status]
    })

    # 4. MCV — Mean Corpuscular Volume (80–100 fL)
    mcv_status = "NORMAL"
    if data.mcv < 80:
        mcv_status = "LOW"
    elif data.mcv > 100:
        mcv_status = "HIGH"
    results.append({
        "indicator": "MCV",
        "value": data.mcv,
        "unit": "fL",
        "reference": "80–100 fL",
        "status": mcv_status,
        "explanation": {
            "NORMAL": f"MCV {data.mcv} fL bình thường (80–100 fL). Kích thước hồng cầu ở mức chuẩn.",
            "LOW": f"MCV {data.mcv} fL thấp (80–100 fL). Hồng cầu nhỏ (microcytic) — gợi ý thiếu sắt, bệnh Thalassemia hoặc thiếu máu viêm mạn.",
            "HIGH": f"MCV {data.mcv} fL cao (80–100 fL). Hồng cầu to (macrocytic) — gợi ý thiếu B12/Folate hoặc bệnh gan.",
        }[mcv_status]
    })

    return results


def analyze_diabetes_indicators(data: DiabetesInput) -> list:
    """
    So sánh từng chỉ số với ngưỡng lâm sàng chuẩn (ADA/WHO).
    """
    results = []

    # 1. Glucose lúc đói (ADA: <100=BT, 100-125=Tiền ĐTĐ, ≥126=ĐTĐ)
    glc_status = "NORMAL"
    if data.glucose >= 126:
        glc_status = "HIGH"
    elif data.glucose >= 100:
        glc_status = "BORDERLINE"
    results.append({
        "indicator": "Glucose",
        "value": data.glucose,
        "unit": "mg/dL",
        "reference": "< 100 mg/dL (lúc đói)",
        "status": glc_status,
        "explanation": {
            "NORMAL": f"Glucose {data.glucose} mg/dL trong ngưỡng bình thường (<100 mg/dL). Đường huyết lúc đói ổn định.",
            "BORDERLINE": f"Glucose {data.glucose} mg/dL nằm trong vùng Tiền Đái tháo đường (100–125 mg/dL). Cần theo dõi định kỳ và điều chỉnh lối sống.",
            "HIGH": f"Glucose {data.glucose} mg/dL vượt ngưỡng chẩn đoán Đái tháo đường (≥126 mg/dL theo ADA). Cần xét nghiệm xác nhận.",
        }[glc_status]
    })

    # 2. Blood Pressure (tâm trương, bình thường <80 mmHg)
    bp_status = "NORMAL"
    if data.blood_pressure >= 90:
        bp_status = "HIGH"
    elif data.blood_pressure >= 80:
        bp_status = "BORDERLINE"
    results.append({
        "indicator": "Huyết áp",
        "value": data.blood_pressure,
        "unit": "mmHg",
        "reference": "< 80 mmHg",
        "status": bp_status,
        "explanation": {
            "NORMAL": f"Huyết áp {data.blood_pressure} mmHg bình thường (<80 mmHg). Không có dấu hiệu tăng huyết áp.",
            "BORDERLINE": f"Huyết áp {data.blood_pressure} mmHg ở mức tiền tăng huyết áp (80–89 mmHg). Tăng huyết áp kết hợp đái tháo đường làm tăng nguy cơ tim mạch.",
            "HIGH": f"Huyết áp {data.blood_pressure} mmHg cao (≥90 mmHg). Tăng huyết áp đi kèm là yếu tố nguy cơ bổ sung mạnh mẽ cho biến chứng đái tháo đường.",
        }[bp_status]
    })

    # 3. BMI
    bmi_status = "NORMAL"
    if data.bmi < 18.5:
        bmi_status = "LOW"
    elif data.bmi >= 30:
        bmi_status = "HIGH"
    elif data.bmi >= 25:
        bmi_status = "BORDERLINE"
    results.append({
        "indicator": "BMI",
        "value": data.bmi,
        "unit": "kg/m²",
        "reference": "18.5–24.9 kg/m²",
        "status": bmi_status,
        "explanation": {
            "NORMAL": f"BMI {data.bmi} kg/m² trong ngưỡng bình thường (18.5–24.9). Cân nặng không phải yếu tố nguy cơ hiện tại.",
            "LOW": f"BMI {data.bmi} kg/m² thấp (<18.5). Thiếu cân.",
            "BORDERLINE": f"BMI {data.bmi} kg/m² trong vùng thừa cân (25–29.9). Tăng nguy cơ kháng insulin và đái tháo đường type 2.",
            "HIGH": f"BMI {data.bmi} kg/m² thuộc mức béo phì (≥30). Béo phì là yếu tố nguy cơ hàng đầu của đái tháo đường type 2.",
        }[bmi_status]
    })

    # 4. Insulin lúc đói (bình thường 2–25 mu U/ml)
    ins_status = "NORMAL"
    if data.insulin > 25:
        ins_status = "HIGH"
    elif data.insulin < 2 and data.insulin > 0:
        ins_status = "LOW"
    results.append({
        "indicator": "Insulin",
        "value": data.insulin,
        "unit": "mu U/ml",
        "reference": "2–25 mu U/ml (lúc đói)",
        "status": ins_status,
        "explanation": {
            "NORMAL": f"Insulin {data.insulin} mu U/ml trong ngưỡng bình thường (2–25). Tiết insulin lúc đói ổn định.",
            "HIGH": f"Insulin {data.insulin} mu U/ml cao hơn bình thường (2–25). Có thể là dấu hiệu kháng insulin — cơ thể cần tiết nhiều insulin hơn để kiểm soát đường huyết.",
            "LOW": f"Insulin {data.insulin} mu U/ml thấp (<2). Có thể liên quan đến suy giảm chức năng tế bào beta tụy.",
        }[ins_status]
    })

    # 5. DiabetesPedigreeFunction (hệ số di truyền)
    dpf_status = "NORMAL"
    if data.diabetes_pedigree > 1.0:
        dpf_status = "HIGH"
    elif data.diabetes_pedigree > 0.5:
        dpf_status = "BORDERLINE"
    results.append({
        "indicator": "Hệ số di truyền",
        "value": round(data.diabetes_pedigree, 3),
        "unit": "",
        "reference": "< 0.5 (nguy cơ thấp)",
        "status": dpf_status,
        "explanation": {
            "NORMAL": f"Hệ số di truyền {data.diabetes_pedigree:.3f} thấp (<0.5). Tiền sử gia đình không phải yếu tố nguy cơ đáng lo.",
            "BORDERLINE": f"Hệ số di truyền {data.diabetes_pedigree:.3f} ở mức trung bình (0.5–1.0). Có tiền sử gia đình liên quan đái tháo đường, cần lưu ý theo dõi.",
            "HIGH": f"Hệ số di truyền {data.diabetes_pedigree:.3f} cao (>1.0). Tiền sử gia đình mạnh — yếu tố nguy cơ di truyền đáng kể.",
        }[dpf_status]
    })

    return results


def build_summary(explanations: list, disease: str) -> str:
    """Tạo câu tóm tắt tổng hợp dựa trên các chỉ số bất thường."""
    abnormal = [e for e in explanations if e["status"] != "NORMAL"]
    if not abnormal:
        return f"Tất cả các chỉ số đều trong ngưỡng bình thường. Không phát hiện dấu hiệu nguy cơ {disease} rõ ràng từ dữ liệu này."
    names = ", ".join(e["indicator"] for e in abnormal)
    return f"Phát hiện {len(abnormal)} chỉ số bất thường: {names}. Mô hình học máy đánh giá đây là nguy cơ {disease}. Bác sĩ cần đối chiếu với bệnh cảnh lâm sàng để có kết luận chính xác."


# ─── API Endpoints ─────────────────────────────────────────────────────
@app.post("/api/predict/anemia")
def predict_anemia(data: AnemiaInput):
    input_features = np.array([[data.gender, data.hemoglobin, data.mch, data.mchc, data.mcv]])

    if anemia_model and anemia_scaler is not None:
        input_scaled = anemia_scaler.transform(input_features)
        prediction = int(anemia_model.predict(input_scaled)[0])
    else:
        prediction = 1 if data.hemoglobin < 12 else 0

    explanations = analyze_anemia_indicators(data)
    summary = build_summary(explanations, "Thiếu máu")

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Thiếu máu (Anemia)",
        "summary": summary,
        "explanations": explanations,
    }


@app.post("/api/predict/diabetes")
def predict_diabetes(data: DiabetesInput):
    input_features = np.array([[
        data.glucose, data.blood_pressure, data.skin_thickness,
        data.insulin, data.bmi, data.diabetes_pedigree, data.age,
    ]])

    if diabetes_model and diabetes_scaler is not None:
        input_scaled = diabetes_scaler.transform(input_features)
        prediction = int(diabetes_model.predict(input_scaled)[0])
    else:
        prediction = 1 if data.glucose > 125 else 0

    explanations = analyze_diabetes_indicators(data)
    summary = build_summary(explanations, "Tiểu đường")

    return {
        "isRisk": bool(prediction == 1),
        "disease": "Tiểu đường (Diabetes)",
        "summary": summary,
        "explanations": explanations,
    }


# Lệnh chạy: uvicorn main:app --reload --port 8000
# Hoặc: python main.py
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
