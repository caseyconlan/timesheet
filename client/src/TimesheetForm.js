import React, { useState, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import axios from 'axios';
import './App.css';

const TimesheetForm = ({ timesheets, setTimesheets }) => {
  const [filteredTimesheets, setFilteredTimesheets] = useState([]);

  const initialValues = {
    date: '',
    project_number: '',
    project_name: '',
    start_time: '',
    end_time: '',
    notes: ''
  };

  const fetchTimesheets = async () => {
    try {
      const response = await axios.get('/timesheets');
      setTimesheets(response.data);
      setFilteredTimesheets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const submitForm = async (values, actions) => {
    try {
      const response = await axios.post('/timesheets', { ...values, user_id: 1 });
      setTimesheets([...timesheets, response.data]);
      actions.setSubmitting(false);
      actions.resetForm();
    } catch (error) {
      console.error(error);
      actions.setSubmitting(false);
    }
  };

  const deleteTimesheet = async (timesheetId) => {
    try {
      await axios.delete(`/timesheets/${timesheetId}`);
      const updatedTimesheets = timesheets.filter((timesheet) => timesheet.id !== timesheetId);
      setTimesheets(updatedTimesheets);
      setFilteredTimesheets(updatedTimesheets);
    } catch (error) {
      console.error(error);
    }
  };

  const filterTimesheets = (values) => {
    let filtered = [...timesheets];

    Object.keys(values).forEach((key) => {
      if (values[key]) {
        filtered = filtered.filter((timesheet) =>
          timesheet[key].toString().toLowerCase().includes(values[key].toString().toLowerCase())
        );
      }
    });

    setFilteredTimesheets(filtered);
  };

   // Function to convert military time to civilian time
   const convertToCivilianTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    let period = 'AM';
    let civilianHours = parseInt(hours, 10);
    if (civilianHours === 0) {
      civilianHours = 12;
    } else if (civilianHours === 12) {
      period = 'PM';
    } else if (civilianHours > 12) {
      civilianHours -= 12;
      period = 'PM';
    }
    return `${civilianHours}:${minutes} ${period}`;
  };

  return (
    <div className="App">
      <Formik initialValues={initialValues} onSubmit={submitForm}>
        <Form className="timesheet-form">
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <Field type="date" id="date" name="date" required className="form-field" />
          </div>
          <div className="form-group">
            <label htmlFor="project_number" className="form-label">
              Project Number
            </label>
            <Field type="text" id="project_number" name="project_number" required className="form-field" />
          </div>
          <div className="form-group">
            <label htmlFor="project_name" className="form-label">
              Project Name
            </label>
            <Field type="text" id="project_name" name="project_name" required className="form-field" />
          </div>
          <div className="form-group">
            <label htmlFor="start_time" className="form-label">
              Start Time
            </label>
            <Field type="time" id="start_time" name="start_time" required className="form-field" />
          </div>
          <div className="form-group">
            <label htmlFor="end_time" className="form-label">
              End Time
            </label>
            <Field type="time" id="end_time" name="end_time" required className="form-field" />
          </div>
          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <Field type="text" id="notes" name="notes" className="form-field" />
          </div>
          <button type="submit" className="button-login">
            Submit
          </button>
        </Form>
      </Formik>

      <div className="filter-form">
        <Formik initialValues={initialValues} onSubmit={filterTimesheets}>
          <Form>
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Date
              </label>
              <Field type="text" id="date" name="date" className="form-field" />
            </div>
            <div className="form-group">
              <label htmlFor="project_number" className="form-label">
                Project Number
              </label>
              <Field type="text" id="project_number" name="project_number" className="form-field" />
            </div>
            <div className="form-group">
              <label htmlFor="project_name" className="form-label">
                Project Name
              </label>
              <Field type="text" id="project_name" name="project_name" className="form-field" />
            </div>
            <div className="form-group">
              <label htmlFor="start_time" className="form-label">
                Start Time
              </label>
              <Field type="text" id="start_time" name="start_time" className="form-field" />
            </div>
            <div className="form-group">
              <label htmlFor="end_time" className="form-label">
                End Time
              </label>
              <Field type="text" id="end_time" name="end_time" className="form-field" />
            </div>
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Notes
              </label>
              <Field type="text" id="notes" name="notes" className="form-field" />
            </div>
            <button type="submit" className="button-login">
              Apply Filter
            </button>
          </Form>
        </Formik>
      </div>

      <table className="timesheet-table" align="center">
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
          {filteredTimesheets.map((timesheet) => (
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

export default TimesheetForm;
