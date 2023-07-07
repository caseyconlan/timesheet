import React, { useEffect, useState } from 'react';
import './App.css';

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    fetchHeatmapData(); // Fetch heatmap data on component mount
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchHeatmapData(); // Fetch heatmap data when startDate or endDate changes
    }
  }, [startDate, endDate]);

  const fetchHeatmapData = () => {
    let url = '/heatmap';
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
  
    fetch(url)
      .then((response) => response.json())
      .then((data) => setHeatmapData(data))
      .catch((error) => console.log(error))
      .finally(() => {
        // Schedule the next fetch after a delay (e.g., 1 minute)
        setTimeout(fetchHeatmapData, 60000);
      });
  };  

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // Perform any validation or additional logic before updating the date filters
    fetchHeatmapData();
  };

  const renderHeatmap = () => {
    if (heatmapData) {
      // Extract data from heatmapData
      const { projects, dates, heatmap } = heatmapData;

      // Function to determine the heatmap cell color based on the value
      const getHeatmapColor = (value) => {
        const minValue = 0;
        const maxValue = 480;

        // Calculate the normalized value (between 0 and 1)
        const normalizedValue = (value - minValue) / (maxValue - minValue);

        // Calculate the RGB values based on the normalized value
        const r = Math.round(500 * normalizedValue);
        const g = 255 - Math.round(255 * normalizedValue);
        const b = 0;

        // Return the CSS color string
        return `rgb(${r}, ${g}, ${b})`;
      };

      // Helper function to format the date without the time
      const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
      };

      return (
        <div className="heatmap-container">
          <h2 className="heatmap-title">Heatmap</h2>
          <div className="heatmap-filter">
            <form onSubmit={handleFilterSubmit}>
              <div>
                <label>Start Date:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <label>End Date:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <button className="button-login" type="submit">Apply Filter</button>
            </form>
          </div>
          <table className="heatmap-table">
            <thead>
              <tr>
                <th></th>
                {projects.map((project) => (
                  <th key={project} className="heatmap-header">
                    {project}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((date, dateIndex) => (
                <tr key={date}>
                  <td className="heatmap-row-label">{formatDate(date)}</td>
                  {heatmap[dateIndex].map((value, projectIndex) => (
                    <td
                      key={`${date}-${projectIndex}`}
                      className="heatmap-cell"
                      style={{ backgroundColor: getHeatmapColor(value) }}
                    >
                      {value} min
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return null; // Render nothing if heatmapData is not available yet
    }
  };

  return <div>{renderHeatmap()}</div>;
};

export default Heatmap;
