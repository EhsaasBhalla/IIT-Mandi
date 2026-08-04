import React from 'react';
import { Link } from 'react-router-dom';
import { History, FilePlus2, BookOpen } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <BookOpen className="logo-icon" />
        <h1>Teacher AI Platform</h1>
      </div>
      <div className="navbar-actions">
        <Link to="/" className="nav-btn primary">
          <FilePlus2 size={18} />
          <span>New Job</span>
        </Link>
        <Link to="/history" className="nav-btn secondary">
          <History size={18} />
          <span>History</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
