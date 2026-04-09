import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { PersonalInfoPage } from './pages/PersonalInfoPage';
import './index.css';

function App() {
    const [currentPage, setCurrentPage] = useState('personal');

    return (
        <div className="dashboard-wrapper">
            <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

            <main className="main-content">
                <Header />
                {currentPage === 'dashboard' && <DashboardPage />}
                {currentPage === 'personal' && <PersonalInfoPage />}
            </main>
        </div>
    );
}

export default App;
