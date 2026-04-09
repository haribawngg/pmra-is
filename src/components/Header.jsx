import React from 'react';
import { MagnifyingGlass, Bell, Plus } from '@phosphor-icons/react';

export function Header() {
    return (
        <header className="top-header">
            <div className="header-greeting">
                <h1>Hệ thống Chuẩn đoán Đa Bệnh Thông minh</h1>
                <p>Nền tảng AI hỗ trợ phân tích và dự đoán cá thể hóa.</p>
            </div>
            <div className="header-actions">
                <div className="search-bar">
                    <MagnifyingGlass size={20} />
                    <input type="text" placeholder="Tìm kiếm mã bệnh nhân, bệnh lý..." />
                </div>
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
