import React, { useState, useEffect } from 'react';

export function ClinicalInfoPanel() {
    const [data, setData] = useState({
        height: 170,
        weight: 65,
        temp: 37,
        bp: 120,
        pulse: 80,
        resp: 16,
        spo2: 98
    });

    const [score, setScore] = useState(100);

    useEffect(() => {
        // Thuật toán giả lập tính Health Wellness Index
        let penalty = 0;
        
        // Phạt BMI bất thường
        const heightM = data.height / 100;
        const bmi = data.weight / (heightM * heightM);
        if (bmi > 25) penalty += (bmi - 25) * 2;
        if (bmi < 18.5) penalty += (18.5 - bmi) * 2;

        // Phạt chỉ số sinh tồn bất thường
        penalty += Math.abs(data.temp - 37) * 8;
        penalty += Math.abs(data.bp - 120) * 0.4;
        penalty += Math.abs(data.pulse - 80) * 0.3;
        penalty += Math.abs(data.resp - 16) * 1.5;
        if (data.spo2 < 98) penalty += (98 - data.spo2) * 3;

        let finalScore = Math.round(100 - penalty);
        if (finalScore < 0) finalScore = 0;
        if (finalScore > 100) finalScore = 100;
        
        setScore(finalScore);
    }, [data]);

    const handleChange = (key, value) => {
        setData(prev => ({ ...prev, [key]: parseFloat(value) }));
    };

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let scoreColor = 'var(--accent-green, #01B574)'; 
    let strokeColor = 'var(--text-primary, #000)'; // Default ring color
    let statusText = 'Normal';
    if (score < 50) { 
        scoreColor = '#EE5D50'; 
        strokeColor = '#000'; // Đen như trong ảnh khi điểm thấp 39
        statusText = 'Action Required'; 
    }
    else if (score < 80) { 
        scoreColor = 'var(--accent-yellow, #FFCE20)';
        strokeColor = 'var(--accent-yellow, #FFCE20)'; 
        statusText = 'Caution'; 
    } else {
        strokeColor = 'var(--accent-green, #01B574)';
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
            {/* Box nhập liệu */}
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>Thông số lâm sàng</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <SliderRow label="Chiều cao (cm)" min={100} max={220} value={data.height} onChange={(v) => handleChange('height', v)} />
                    <SliderRow label="Cân nặng (kg)" min={30} max={150} value={data.weight} onChange={(v) => handleChange('weight', v)} />
                    <SliderRow label="Nhiệt độ (°C)" min={35} max={42} step={0.1} value={data.temp} onChange={(v) => handleChange('temp', v)} />
                    <SliderRow label="Huyết áp (mmHg)" min={90} max={200} value={data.bp} onChange={(v) => handleChange('bp', v)} />
                    <SliderRow label="Mạch (bpm)" min={40} max={180} value={data.pulse} onChange={(v) => handleChange('pulse', v)} />
                    <SliderRow label="Nhịp thở (l/p)" min={10} max={40} value={data.resp} onChange={(v) => handleChange('resp', v)} />
                    <SliderRow label="SpO2 (%)" min={70} max={100} value={data.spo2} onChange={(v) => handleChange('spo2', v)} />
                </div>
            </div>

            {/* Vòng tròn hiển thị điểm */}
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ marginBottom: '2rem', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.1rem', fontWeight: '700' }}>Health Wellness Index</h3>
                
                <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="180" height="180" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
                        <circle 
                            cx="90" cy="90" r="70" 
                            fill="transparent" 
                            stroke="var(--bg-dark)" 
                            strokeWidth="14" 
                        />
                        <circle 
                            cx="90" cy="90" r="70" 
                            fill="transparent" 
                            stroke={strokeColor} 
                            strokeWidth="14" 
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease' }}
                        />
                    </svg>
                    
                    <div style={{ textAlign: 'center', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: score < 50 ? scoreColor : 'var(--text-primary)' }}>{score}</span>
                    </div>
                </div>
                
                <div style={{ marginTop: '2.5rem', fontWeight: '700', color: score < 50 ? scoreColor : 'var(--text-primary)', fontSize: '1.1rem' }}>
                    {statusText}
                </div>
            </div>
        </div>
    );
}

function SliderRow({ label, min, max, step = 1, value, onChange }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '160px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{label}</div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step} 
                value={value} 
                onChange={(e) => onChange(e.target.value)} 
                style={{ flexGrow: 1, cursor: 'pointer', height: '6px', appearance: 'auto', accentColor: 'var(--accent-blue)' }}
            />
            <div style={{ width: '50px', textAlign: 'right', fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{value}</div>
        </div>
    );
}
