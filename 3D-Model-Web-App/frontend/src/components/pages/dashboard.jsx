import React, { useEffect, useState, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../css/dashb_user.css';

function UserDashboard() {
    const navigate = useNavigate();
    const [auth, setAuth] = useState(false);
    const [userid, setUserid] = useState('');
    const [email, setEmail] = useState('');
    const [user_name, setUserName] = useState('');
    const [theme, setTheme] = useState('light');  // default theme
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(true);

    axios.defaults.withCredentials = true;

    const handleLogout = () => {
        axios.post('http://localhost:8081/logout', {}, { withCredentials: true })
            .then(res => {
                console.log("Logout response:", res.data);
                setAuth(false);
                setUserid('');
                setEmail('');
                setUserName('');
                setUserInfo({});
                navigate("/signin");
            })
            .catch(err => {
                console.error("Logout error:", err);
            });
    };

    const datafetch = () => {
        axios.get('http://localhost:8081/user_info', { withCredentials: true })
            .then(res => {
                console.log("User Info Response:", res.data);
                setLoading(false);

                if (res.data) {
                    const userInfo = res.data;
                    setAuth(true);
                    setUserid(userInfo.userid);
                    setEmail(userInfo.email);
                    setUserName(userInfo.user_name);
                    setUserInfo(userInfo);
                    setTheme(userInfo.color_theme);  // set theme from MySQL
                }
            })
            .catch(err => {
                setAuth(false);
                navigate("/signin");
            });
    }

    useEffect(() => {
        datafetch();
        const interval = setInterval(() => {
            datafetch();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Toggle theme with useCallback
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        // Update theme in the MySQL database
        axios.post('http://localhost:8081/update_theme', { userid, newTheme }, { withCredentials: true })
            .then(res => {
                console.log("Theme updated successfully:", res.data);
                datafetch();
            })
            .catch(err => {
                console.error("Error updating theme:", err);
            });
    }, [theme, userid]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={`vh-100 ${theme}`}>
            <nav className={`navbar navbar-expand-lg ${theme === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'}`}>
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">Navbar</Link>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link active" aria-current="page" to="/dashboard">Home</Link>
                            </li>
                            <li className="nav-item" onClick={toggleTheme}>
                                {theme === 'light' ? <i className='bi bi-toggle-off fs-3'></i> :
                                    <i className='bi bi-toggle-on fs-3'></i>}
                            </li>
                            <li className="nav-item dropdown">
                                <a
                                    className="nav-link dropdown-toggle"
                                    href="#"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    Dropdown
                                </a>
                                <ul className={`dropdown-menu dropdown-menu-${theme}`}>
                                    <li><Link className="dropdown-item" to="#">Action</Link></li>
                                    <li><Link className='dropdown-item'>Another Action</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><a className="dropdown-item" onClick={handleLogout}>Logout</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container mt-4">
                <h2>Welcome, {user_name || 'Guest'}!</h2>
                <p>UserID: {userid || 'N/A'}</p>
                <p>Email: {email || 'Not logged in'}</p>
                <p>Auth: {auth ? 'Authenticated' : 'Not Auth'}</p>
                <p>First Name: {userInfo.first_name || 'N/A'}</p>
                <p>Last Name: {userInfo.last_name || 'N/A'}</p>
                <p>Gender: {userInfo.gender || 'N/A'}</p>
                <p>Birth Date: {userInfo.birth_date || 'N/A'}</p>
                <p>Bio: {userInfo.bio || 'N/A'}</p>
                <p>Theme: {userInfo.color_theme}</p>
            </div>
        </div>
    );
}

export default UserDashboard;
