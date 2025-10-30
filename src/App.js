import React, { useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AttendanceForm from './components/AttendanceForm';
import AttendanceDashboard from './components/AttendanceDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AttendanceDashboard />;
      case 'form':
        return <AttendanceForm />;
      default:
        return <AttendanceDashboard />;
    }
  };

  return (
    <div className="App">
      <Header 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
      
      <main className="main-content">
        {renderPage()}
      </main>

      <Footer />
    </div>
  );
}

export default App;
