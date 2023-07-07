import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TimesheetTable from './TimesheetTable';

const ParentComponent = () => {
  const [timesheets, setTimesheets] = useState([]);

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      const response = await axios.get('/timesheets');
      setTimesheets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Timesheet App</h1>
      {/* Navbar code */}
      <TimesheetTable timesheets={timesheets} />
    </div>
  );
};

export default ParentComponent;
