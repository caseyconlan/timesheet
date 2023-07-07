import React from 'react';

const TimesheetTable = ({ timesheets, deleteTimesheet }) => {
  if (!timesheets || timesheets.length === 0) {
    return <p>No timesheets available.</p>;
  }

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Project Number</th>
            <th>Project Name</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Duration (Hours)</th>
            <th>Notes</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.map((timesheet) => (
            <tr key={timesheet.id}>
              <td>{timesheet.date}</td>
              <td>{timesheet.project_number}</td>
              <td>{timesheet.project_name}</td>
              <td>{timesheet.start_time}</td>
              <td>{timesheet.end_time}</td>
              <td>{timesheet.duration}</td>
              <td>{timesheet.notes}</td>
              <td>
                <button onClick={() => deleteTimesheet(timesheet.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimesheetTable;
