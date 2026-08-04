import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar/Navbar';
import UploadPage from './pages/UploadPage/UploadPage';
import ProgressPage from './pages/ProgressPage/ProgressPage';
import ResultsPage from './pages/ResultsPage/ResultsPage';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import './index.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: 'rgba(18, 28, 24, 0.9)',
          color: '#F8FAF9',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          backdropFilter: 'blur(12px)',
        }
      }} />
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress/:jobId" element={<ProgressPage />} />
            <Route path="/results/:jobId" element={<ResultsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
