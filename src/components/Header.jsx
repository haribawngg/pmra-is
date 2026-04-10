import React from 'react';
import { Bell, Plus } from '@phosphor-icons/react';

export function Header() {
    return (
        <header className="top-header">
            <div className="header-greeting">
                <h1>Hệ thống Dự đoán Nguy cơ Đa Bệnh Thông minh</h1>
                <p>Nền tảng AI hỗ trợ phân tích và dự đoán cá thể hóa.</p>
            </div>
            <div className="header-actions">
                <button className="icon-btn" aria-label="Thông báo">
                    <Bell size={24} />
                    <span className="notification-indicator"></span>
                </button>
                <button className="icon-btn" aria-label="Thêm hồ sơ">
                    <Plus size={24} />
                </button>
            </div>
        </header>
    );
}
