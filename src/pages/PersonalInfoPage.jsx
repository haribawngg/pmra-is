import React from 'react';
import { ClinicalInfoPanel } from '../components/ClinicalInfoPanel';

export function PersonalInfoPage() {
    return (
        <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '20px', padding: '2rem', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                {/* Left: Avatar */}
                <div style={{ width: '150px', height: '180px', flexShrink: 0, border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <svg viewBox="0 0 150 180" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <rect width="150" height="180" fill="#d1d5db" />
                        <circle cx="75" cy="70" r="40" fill="#ffffff" />
                        <circle cx="75" cy="230" r="90" fill="#ffffff" />
                    </svg>
                </div>

                {/* Right: Info */}
                <div style={{ flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ width: '5px', height: '24px', backgroundColor: 'var(--accent-blue)', borderRadius: '4px' }}></div>
                        <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.3px' }}>Thông tin cơ bản</h2>
                    </div>
                    
                    <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}></div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', rowGap: '2rem' }}>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Họ và tên</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>Nguyễn Văn A</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giới tính</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>Nam</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày sinh</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>01/01/1990</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tuổi</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>35</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Địa chỉ</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>Hà Nội, Việt Nam</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nghề nghiệp</p>
                            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '500' }}>Kỹ sư phần mềm</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <ClinicalInfoPanel />
        </div>
    );
}
