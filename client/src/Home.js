import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import TimesheetForm from './TimesheetForm';
import PunchCardImage from './PunchCard.jpg';
import './App.css';

const Home = () => {
  const { loggedIn, logout } = useContext(AuthContext);
  const [timesheets, setTimesheets] = useState([]);

  const handleLogout = () => {
    // Perform any additional logout logic if needed
    logout();
  };

  return (
    <div>
    <div className="route-links-container">
      {/* Navigation code... */}
      <div className="home-container">
        <div className="logo-container" align="center">
        <img className="logo" src={PunchCardImage} alt="PunchCard" style={{ width: '40%', height: 'auto' }} align="center" />
        </div>
        {/* Title and description code... */}

        {/* Render the TimesheetForm component and pass the timesheets and setTimesheets */}
        <TimesheetForm timesheets={timesheets} setTimesheets={setTimesheets} />

        {/* Render the timesheet table */}
        <div className="route-links">
          {loggedIn && (
            <button className="button-login" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Home;
