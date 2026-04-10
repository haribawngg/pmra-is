import React, { useState, useEffect, useCallback } from 'react';
import { MagicWand, ShieldWarning, CheckCircle, X, Keyboard, ArrowsClockwise } from '@phosphor-icons/react';

export function PredictionPanel() {
    const [selectedModel, setSelectedModel] = useState('anemia');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Stored input data (read-only on main page)
    const [inputData, setInputData] = useState(null);

    // F1 key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                setShowModal(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleModalSubmit = (data) => {
        setInputData(data);
        setShowModal(false);
        setResult(null);
    };

    const handleLoadData = async () => {
        if (!inputData) return;
        setIsAnalyzing(true);
        setResult(null);

        try {
            let endpoint = '';
            let payload = {};

            if (selectedModel === 'anemia') {
                endpoint = 'http://localhost:8000/api/predict/anemia';
                payload = {
                    gender: inputData.gender,
                    hemoglobin: inputData.hemoglobin,
                    mch: inputData.mch,
                    mchc: inputData.mchc,
                    mcv: inputData.mcv,
                };
            } else if (selectedModel === 'diabetes') {
                endpoint = 'http://localhost:8000/api/predict/diabetes';
                payload = {
                    glucose: inputData.glucose,
                    blood_pressure: inputData.blood_pressure,
                    skin_thickness: inputData.skin_thickness,
                    insulin: inputData.insulin,
                    bmi: inputData.bmi,
                    diabetes_pedigree: inputData.diabetes_pedigree,
                    age: inputData.age,
                };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('API failed');
            const data = await response.json();
            setResult(data);
        } catch (error) {
            console.error('Lỗi khi gọi API:', error);
            setResult({
                isRisk: true,
                disease: 'Lỗi Kết Nối Máy Chủ',
                summary: 'Không thể kết nối Backend FastAPI (cổng 8000). Vui lòng đảm bảo backend đang chạy.',
                explanations: [],
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Label maps for display
    const anemiaLabels = {
        gender: 'Giới tính',
        hemoglobin: 'Hemoglobin (g/dL)',
        mch: 'MCH (pg)',
        mchc: 'MCHC (g/dL)',
        mcv: 'MCV (fL)',
    };
    const diabetesLabels = {
        glucose: 'Glucose (mg/dL)',
        blood_pressure: 'Huyết áp (mmHg)',
        skin_thickness: 'Độ dày da (mm)',
        insulin: 'Insulin (mu U/ml)',
        bmi: 'BMI (kg/m²)',
        diabetes_pedigree: 'Hệ số di truyền',
        age: 'Tuổi',
    };

    const labels = selectedModel === 'anemia' ? anemiaLabels : diabetesLabels;
    const displayFields = selectedModel === 'anemia'
        ? ['gender', 'hemoglobin', 'mch', 'mchc', 'mcv']
        : ['glucose', 'blood_pressure', 'skin_thickness', 'insulin', 'bmi', 'diabetes_pedigree', 'age'];

    const formatDisplayValue = (key, val) => {
        if (key === 'gender') return val === 1 ? 'Nam' : 'Nữ';
        return val;
    };

    return (
        <section className="prediction-panel">
            <div className="section-header">
                <h2>Hệ thống Dự đoán Nguy cơ Phân nhóm Bệnh</h2>
                <span>Chạy trên lõi PMRA-IS API</span>
            </div>

            {/* Model selector tabs */}
            <div className="model-selector">
                <button
                    className={`model-option ${selectedModel === 'anemia' ? 'active' : ''}`}
                    onClick={() => { setSelectedModel('anemia'); setResult(null); setInputData(null); }}
                >
                    <i className="ph-fill ph-drop"></i> Thiếu máu (Anemia)
                </button>
                <button
                    className={`model-option ${selectedModel === 'diabetes' ? 'active' : ''}`}
                    onClick={() => { setSelectedModel('diabetes'); setResult(null); setInputData(null); }}
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

            {/* Read-only data display area */}
            <div className="readonly-data-area">
                {inputData ? (
                    <>
                        <div className="readonly-header">
                            <h3>Dữ liệu chỉ số ({selectedModel === 'anemia' ? 'Thiếu máu' : 'Tiểu đường'})</h3>
                            <button className="load-data-btn" onClick={handleLoadData} disabled={isAnalyzing}>
                                {isAnalyzing ? (
                                    <><ArrowsClockwise size={16} className="spin" /> Đang phân tích...</>
                                ) : (
                                    <><MagicWand size={16} /> Chạy mô hình</>
                                )}
                            </button>
                        </div>
                        <div className="readonly-grid">
                            {displayFields.map((key) => (
                                <div key={key} className="readonly-item">
                                    <span className="readonly-label">{labels[key]}</span>
                                    <span className="readonly-value">{formatDisplayValue(key, inputData[key])}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-data-state">
                        <Keyboard size={48} weight="thin" />
                        <p>Chưa có dữ liệu. Nhấn <kbd>F1</kbd> để nhập chỉ số y khoa.</p>
                        <button className="open-modal-btn" onClick={() => setShowModal(true)}>
                            Mở form nhập liệu
                        </button>
                    </div>
                )}
            </div>

            {/* Result section */}
            {result && (
                <div className="result-section">
                    <div className={`result-card ${result.isRisk ? 'positive' : 'negative'}`}>
                        <div className="result-header">
                            {result.isRisk ? <ShieldWarning size={28} /> : <CheckCircle size={28} />}
                            {result.isRisk
                                ? `Phát hiện rủi ro: ${result.disease}`
                                : `Bình thường: Không có dấu hiệu ${result.disease}`}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                            {result.summary}
                        </p>
                    </div>

                    {result.explanations && result.explanations.length > 0 && (
                        <div className="indicator-analysis">
                            <h4 className="indicator-analysis-title">
                                <i className="ph ph-magnifying-glass"></i>
                                Phân tích chi tiết từng chỉ số
                            </h4>
                            <div className="indicator-grid">
                                {result.explanations.map((item, idx) => (
                                    <div key={idx} className={`indicator-card status-${item.status.toLowerCase()}`}>
                                        <div className="indicator-card-header">
                                            <span className="indicator-name">{item.indicator}</span>
                                            <span className={`indicator-badge badge-${item.status.toLowerCase()}`}>
                                                {item.status === 'NORMAL' && '✓ Bình thường'}
                                                {item.status === 'LOW' && '↓ Thấp'}
                                                {item.status === 'CRITICAL_LOW' && '↓↓ Rất thấp'}
                                                {item.status === 'HIGH' && '↑ Cao'}
                                                {item.status === 'BORDERLINE' && '⚠ Cận ngưỡng'}
                                            </span>
                                        </div>
                                        <div className="indicator-value">
                                            <strong>{item.value}</strong>
                                            {item.unit && <span className="indicator-unit"> {item.unit}</span>}
                                            <span className="indicator-ref"> (Tham chiếu: {item.reference})</span>
                                        </div>
                                        <p className="indicator-explanation">{item.explanation}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="disclaimer">
                                ⚕️ Kết quả trên chỉ mang tính hỗ trợ tham khảo. Bác sĩ cần đối chiếu với bệnh cảnh lâm sàng đầy đủ để đưa ra chẩn đoán chính thức.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* F1 Modal */}
            {showModal && (
                <InputModal
                    model={selectedModel}
                    onSubmit={handleModalSubmit}
                    onClose={() => setShowModal(false)}
                />
            )}
        </section>
    );
}


/* ─── Input Modal Component ────────────────────────────────────────── */
function InputModal({ model, onSubmit, onClose }) {
    const [formData, setFormData] = useState(
        model === 'anemia'
            ? { gender: 1, hemoglobin: '', mch: '', mchc: '', mcv: '' }
            : { glucose: '', blood_pressure: '', skin_thickness: '', insulin: '', bmi: '', diabetes_pedigree: '', age: '' }
    );

    const handleChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Convert string values to numbers
        const parsed = {};
        for (const [key, val] of Object.entries(formData)) {
            parsed[key] = key === 'gender' ? parseInt(val) : parseFloat(val) || 0;
        }
        onSubmit(parsed);
    };

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Nhập chỉ số y khoa — {model === 'anemia' ? 'Thiếu máu' : 'Tiểu đường'}</h3>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <p className="modal-hint">Nhấn <kbd>F1</kbd> để mở • <kbd>Esc</kbd> để đóng</p>

                <form onSubmit={handleSubmit}>
                    {model === 'anemia' ? (
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Giới tính</label>
                                <select value={formData.gender} onChange={(e) => handleChange('gender', e.target.value)}
                                    style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit' }}>
                                    <option value="0">Nữ</option>
                                    <option value="1">Nam</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Hemoglobin (g/dL)</label>
                                <input type="number" step="0.1" placeholder="VD: 13.5"
                                    value={formData.hemoglobin} onChange={(e) => handleChange('hemoglobin', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>MCH (pg)</label>
                                <input type="number" step="0.1" placeholder="VD: 29"
                                    value={formData.mch} onChange={(e) => handleChange('mch', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>MCHC (g/dL)</label>
                                <input type="number" step="0.1" placeholder="VD: 34"
                                    value={formData.mchc} onChange={(e) => handleChange('mchc', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>MCV (fL)</label>
                                <input type="number" step="0.1" placeholder="VD: 85"
                                    value={formData.mcv} onChange={(e) => handleChange('mcv', e.target.value)} />
                            </div>
                        </div>
                    ) : (
                        <div className="input-grid">
                            <div className="input-group">
                                <label>Glucose (mg/dL)</label>
                                <input type="number" placeholder="VD: 90"
                                    value={formData.glucose} onChange={(e) => handleChange('glucose', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Huyết áp (mmHg)</label>
                                <input type="number" placeholder="VD: 72"
                                    value={formData.blood_pressure} onChange={(e) => handleChange('blood_pressure', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Độ dày da (mm)</label>
                                <input type="number" placeholder="VD: 35"
                                    value={formData.skin_thickness} onChange={(e) => handleChange('skin_thickness', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Insulin (mu U/ml)</label>
                                <input type="number" placeholder="VD: 100"
                                    value={formData.insulin} onChange={(e) => handleChange('insulin', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>BMI (kg/m²)</label>
                                <input type="number" step="0.1" placeholder="VD: 25.0"
                                    value={formData.bmi} onChange={(e) => handleChange('bmi', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Hệ số di truyền</label>
                                <input type="number" step="0.001" placeholder="VD: 0.5"
                                    value={formData.diabetes_pedigree} onChange={(e) => handleChange('diabetes_pedigree', e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Tuổi</label>
                                <input type="number" placeholder="VD: 45"
                                    value={formData.age} onChange={(e) => handleChange('age', e.target.value)} />
                            </div>
                        </div>
                    )}

                    <button type="submit" className="action-btn" style={{ marginTop: '1.5rem' }}>
                        <MagicWand size={20} /> Xác nhận dữ liệu
                    </button>
                </form>
            </div>
        </div>
    );
}
