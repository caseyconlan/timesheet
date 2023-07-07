import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import PunchCardImage from './PunchCard.jpg';
import { AuthContext } from './AuthContext';
import './App.css';

const Login = () => {
  const [formType, setFormType] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const { setLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    axios
      .get("/csrf-token", { withCredentials: true })
      .then((response) => {
        const token = response.headers["x-csrf-token"];
        setCsrfToken(token);
      })
      .catch((error) => {
        console.error("Failed to fetch CSRF token:", error);
      });
  }, []);

  const handleFormType = (type) => {
    setFormType(type);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "" || password === "") {
      console.log("Username and password must be provided");
      return;
    }

    const requestData = {
      username,
      password,
    };

    const headers = {
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    axios
      .post("/login", requestData, {
        withCredentials: true,
        headers,
      })
      .then((response) => {
        if (response.data.message === 'Login successful') {
          localStorage.setItem('isLoggedIn', 'true');
          setLoggedIn(true);
        } else {
          console.log('Invalid username or password');
        }
      })
      .catch((error) => {
        console.log('Login error:', error);
      });
  };

  const handleNewUser = (e) => {
    e.preventDefault();
    if (username === "" || password === "" || email === "" || firstName === "" || lastName === "") {
      console.log("All fields must be filled in");
      return;
    }

    if (password !== passwordConfirmation) {
      console.log("Password and confirmation do not match");
      return;
    }

    const requestData = {
      first_name: firstName,
      last_name: lastName,
      email,
      username,
      password,
    };

    const headers = {
      "X-CSRF-Token": csrfToken,
      "Content-Type": "application/json",
    };

    axios
      .post("/users", requestData, {
        withCredentials: true,
        headers,
      })
      .then((response) => {
        setLoggedIn(true);
      })
      .catch((error) => {
        console.error('New user creation error:', error);
      });
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="form">  
      <label className="form-label">  
        Username:
        <input className="login-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <label className="form-label">  
        Password:
        <input className="login-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <button className="button-login">Log In</button>
      <div className="button-container" align="center">
        <button className="button-login" onClick={handleForgotPassword}>Forgot Password</button>
        <button className="button-login" onClick={handleDeleteAccount}>Delete Account</button>
      </div>
    </form>
);

  const handleForgotPassword = (e) => {
    e.preventDefault();

    axios
        .post("/forgot-password", { username }, {
            headers: {
                "X-CSRF-Token": csrfToken,
                "Content-Type": "application/json",
            },
        })
        .then((response) => {
            // Prompt the user to enter a new password
            const new_password = window.prompt('Enter a new password:');

            // Update the password on the server
            axios
                .patch("/update-password", { username, new_password }, {
                    headers: {
                        "X-CSRF-Token": csrfToken,
                        "Content-Type": "application/json",
                    },
                })
                .then((response) => {
                    console.log(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });
        })
        .catch((error) => {
            console.log(error);
        });
};

const handleDeleteAccount = (e) => {
  e.preventDefault();

  const requestData = {
    username,
    password,
  };

  const headers = {
    "X-CSRF-Token": csrfToken,
    "Content-Type": "application/json",
  };

  axios
    .post("/delete-account", requestData, {
      headers,
      withCredentials: true,
    })
    .then((response) => {
      if (response.data.message === 'Account deleted successfully') {
        setLoggedIn(false);
      } else {
        console.log('Invalid username or password');
      }
    })
    .catch((error) => {
      console.log('Delete account error:', error);
    });
};

  const renderNewUserForm = () => (
    <form onSubmit={handleNewUser} className="form">
      <label className="form-label">
        First Name:
        <input className="login-field"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </label>
      <label className="form-label">
        Last Name:
        <input className="login-field"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </label>
      <label className="form-label">
        <div>
        Email:
        </div>
        <input className="login-field"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="form-label">
        Username:
        <input className="login-field"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="form-label">
        Password:
        <input className="login-field"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="form-label">
        Confirm Password:
        <input className="login-field"
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
        />
      </label>
      <button className="button-login" type="submit">Create New User</button>
    </form>
  );

  return (
    <div className="container">
      <div className="logo-container" align="center">
        <img className="logo" src={PunchCardImage} alt="PunchCard" style={{ width: '50%', height: 'auto' }} align="center" />
        </div>
        <div className="title">Welcome to PunchCard!</div>
        <div className="description">Timekeeping Made Simple</div>
      <div align="center">
        <button className="button-login" onClick={() => handleFormType("login")}>Returning User</button>
        <button className="button-login" onClick={() => handleFormType("newUser")}>New User</button>
        {formType === "login" && renderLoginForm()}
        {formType === "newUser" && renderNewUserForm()}
      </div>
    </div>
  );
};

export default Login;