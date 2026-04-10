import React, { useState } from 'react';
import { MagicWand, ShieldWarning, CheckCircle } from '@phosphor-icons/react';

export function PredictionPanel() {
    const [selectedModel, setSelectedModel] = useState('anemia');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);

    const handlePredict = async () => {
        setIsAnalyzing(true);
        setResult(null);

        try {
            let endpoint = '';
            let payload = {};

            if (selectedModel === 'anemia') {
                endpoint = 'http://localhost:8000/api/predict/anemia';
                payload = {
                    gender: parseInt(document.getElementById('inputGender').value) || 0,
                    hemoglobin: parseFloat(document.getElementById('inputHgb').value) || 0,
                    mch: parseFloat(document.getElementById('inputMch').value) || 0,
                    mchc: parseFloat(document.getElementById('inputMchc').value) || 0,
                    mcv: parseFloat(document.getElementById('inputMcv').value) || 0
                };
            } else if (selectedModel === 'diabetes') {
                endpoint = 'http://localhost:8000/api/predict/diabetes';
                payload = {
                    glucose: parseFloat(document.getElementById('inputGluc').value) || 0,
                    blood_pressure: parseFloat(document.getElementById('inputBP').value) || 0,
                    skin_thickness: parseFloat(document.getElementById('inputSkin').value) || 0,
                    insulin: parseFloat(document.getElementById('inputInsulin').value) || 0,
                    bmi: parseFloat(document.getElementById('inputBmi').value) || 0,
                    diabetes_pedigree: parseFloat(document.getElementById('inputPedigree').value) || 0,
                    age: parseFloat(document.getElementById('inputAge').value) || 0
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('API failed');
            
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            setResult({
                isRisk: true,
                disease: 'Lỗi Kết Nối Máy Chủ',
                message: 'Không thể kết nối Backend FastAPI (cổng 8000). Vui lòng đảm bảo backend đang chạy.'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="prediction-panel">
            <div className="section-header">
                <h2>Hệ thống Chuẩn đoán Phân nhóm Bệnh</h2>
                <span>Chạy trên lõi PMRA-IS API</span>
            </div>

            <div className="model-selector">
                <button
                    className={`model-option ${selectedModel === 'anemia' ? 'active' : ''}`}
                    onClick={() => setSelectedModel('anemia')}
                >
                    <i className="ph-fill ph-drop"></i> Thiếu máu (Anemia)
                </button>
                <button
                    className={`model-option ${selectedModel === 'diabetes' ? 'active' : ''}`}
                    onClick={() => setSelectedModel('diabetes')}
                >
                    <i className="ph-fill ph-pulse"></i> Tiểu đường (Diabetes)
                </button>
                <button className="model-option disabled" disabled title="Mô hình đang được cấu trúc API">
                    <i className="ph-fill ph-heartbeat"></i> Bệnh Tim mạch <span className="dev-badge">Đang phát triển</span>
                </button>
                <button className="model-option disabled" disabled>
                    <i className="ph-fill ph-lungs"></i> Ung thư Phổi <span className="dev-badge">Đang phát triển</span>
                </button>
            </div>

            <div className="input-form">
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                    Nhập chỉ số y khoa để chuẩn đoán {selectedModel === 'anemia' ? 'Thiếu máu' : 'Tiểu đường'}:
                </h3>

                {selectedModel === 'anemia' ? (
                    <div className="input-grid" key="anemia">
                        <div className="input-group">
                            <label>Giới tính</label>
                            <select id="inputGender" defaultValue="1" style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                <option value="0">Nữ</option>
                                <option value="1">Nam</option>
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Hemoglobin (g/dL)</label>
                            <input id="inputHgb" type="number" placeholder="VD: 13.5" defaultValue="11.2" step="0.1" />
                        </div>
                        <div className="input-group">
                            <label>MCH (pg)</label>
                            <input id="inputMch" type="number" placeholder="VD: 29" defaultValue="27" step="0.1" />
                        </div>
                        <div className="input-group">
                            <label>MCHC (g/dL)</label>
                            <input id="inputMchc" type="number" placeholder="VD: 34" defaultValue="32" step="0.1" />
                        </div>
                        <div className="input-group">
                            <label>MCV (fL)</label>
                            <input id="inputMcv" type="number" placeholder="VD: 85" defaultValue="80" step="0.1" />
                        </div>
                    </div>
                ) : (
                    <div className="input-grid" key="diabetes">
                        <div className="input-group">
                            <label>Đường huyết lúc đói - Glucose (mg/dL)</label>
                            <input id="inputGluc" type="number" placeholder="VD: 90" defaultValue="130" />
                        </div>
                        <div className="input-group">
                            <label>Huyết áp - BloodPressure (mmHg)</label>
                            <input id="inputBP" type="number" placeholder="VD: 72" defaultValue="80" />
                        </div>
                        <div className="input-group">
                            <label>Độ dày da - SkinThickness (mm)</label>
                            <input id="inputSkin" type="number" placeholder="VD: 35" defaultValue="30" />
                        </div>
                        <div className="input-group">
                            <label>Insulin (mu U/ml)</label>
                            <input id="inputInsulin" type="number" placeholder="VD: 100" defaultValue="80" />
                        </div>
                        <div className="input-group">
                            <label>BMI (kg/m²)</label>
                            <input id="inputBmi" type="number" placeholder="VD: 25.0" defaultValue="33.6" step="0.1" />
                        </div>
                        <div className="input-group">
                            <label>Hệ số di truyền - DiabetesPedigree</label>
                            <input id="inputPedigree" type="number" placeholder="VD: 0.5" defaultValue="0.627" step="0.001" />
                        </div>
                        <div className="input-group">
                            <label>Tuổi</label>
                            <input id="inputAge" type="number" placeholder="VD: 45" defaultValue="50" />
                        </div>
                    </div>
                )}

                <button className="action-btn" onClick={handlePredict} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                        <><i className="ph ph-spinner ph-spin"></i> Đang gọi API từ FastAPI Server...</>
                    ) : (
                        <><MagicWand size={20} /> Gửi dự đoán tới Học Máy</>
                    )}
                </button>
            </div>

            {result && (
                <div className={`result-card ${result.isRisk ? 'positive' : 'negative'}`}>
                    <div className="result-header">
                        {result.isRisk ? <ShieldWarning size={28} /> : <CheckCircle size={28} />}
                        {result.isRisk
                            ? `Phát hiện rủi ro: ${result.disease}`
                            : `Bình thường: Không có dấu hiệu ${result.disease}`}
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>{result.message}</p>
                    {result.isRisk && (
                        <div style={{ marginTop: '1rem' }}>
                            <button className="urgent-btn">Tạo Kế hoạch Điều trị &raquo;</button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
