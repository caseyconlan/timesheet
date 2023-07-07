import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">
            Home
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/heatmap" className="navbar-link">
            Heatmap
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
