import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Heatmap from './Heatmap';
import TimesheetTable from './TimesheetTable';
import Navbar from './Navbar';
import { AuthContext } from './AuthContext';
import './App.css';

const App = () => {
  const { loggedIn, logout } = useContext(AuthContext);

  return (
    <Router>
      <div>
        <Navbar />
        <Switch>
          {loggedIn ? (
            <>
              <Route exact path="/" component={Home} />
              <Route exact path="/timesheet" component={TimesheetTable} />
              <Route exact path="/heatmap" component={Heatmap} />
            </>
          ) : (
            <>
              <Route exact path="/" component={Login} />
              <Redirect to="/" />
            </>
          )}
        </Switch>
      </div>
    </Router>
  );
};

export default App;
