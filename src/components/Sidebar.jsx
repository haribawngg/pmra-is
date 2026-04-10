import React from 'react';
import { Brain, SquaresFour, UserCircle, Gear, SignOut } from '@phosphor-icons/react';

export function Sidebar({ currentPage, onNavigate }) {
    return (
        <aside className="sidebar">
            <div className="logo">
                <Brain weight="fill" color="var(--accent-blue)" size={32} />
                <h2>PMRA-IS</h2>
            </div>
            
            <nav className="sidebar-nav">
                <a
                    href="#"
                    className={`nav-item ${currentPage === 'personal' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('personal'); }}
                >
                    <UserCircle size={24} /> Thông tin cá nhân
                </a>
                <a
                    href="#"
                    className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
                >
                    <SquaresFour size= {24} /> Dự đoán nguy cơ
                </a>
            </nav>

            <div className="sidebar-footer">
                <div className="settings">
                    <a href="#" className="nav-item"><Gear size={24} /> Cài đặt</a>
                    <a href="#" className="nav-item"><SignOut size={24} /> Đăng xuất</a>
                </div>
            </div>
        </aside>
    );
}
