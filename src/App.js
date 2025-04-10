import React from "react";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { FaCommentDots, FaUserCircle , FaClipboardCheck, FaChartBar, FaIdCard, FaCalendarAlt } from "react-icons/fa";
import { IoMdSwap } from "react-icons/io";
import { HashRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Admin from "./Admin";
import Login from "./Login";
import Employee from "./Employee";
import AvailabilityForm from "./AvailabilityForm";
import Profile from "./Profile";
import Add from "./Add";
import TimeOff from "./TimeOff";
import SwapRequests from "./SwapRequests";
import MySchedule from "./MySchedule";
import "./styles/App.css";


const Sidebar = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="d-flex flex-column p-3 text-white custom-sidebar" >
      <h3 className="mb-4 fw-bold text-center">ShiftEase</h3>

      <Nav defaultActiveKey="/employee" className="flex-column">
        {role === "admin" && (
          <>
            <Nav.Link as={Link} to="/employee" className="text-white fw-semibold"> <FaChartBar size={20} className="me-2" />Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/admin" className="text-white fw-semibold d-flex align-items-start"> <FaIdCard size={20} className="me-2 mt-1"/>Employee Management</Nav.Link>
            <Nav.Link as={Link} to="/employee/availability" className="text-white fw-semibold"><FaClipboardCheck size={20} className="me-2" />My Availability</Nav.Link>
            <Nav.Link as={Link} to="/my-schedule" className="text-white fw-semibold"> <FaCalendarAlt size={20} className="me-2" />My Schedule</Nav.Link>
            <Nav.Link as={Link} to="/timeoff" className="text-white fw-semibold"> <FaCommentDots size={20} className="me-2" />Time Off Requests</Nav.Link>
            <Nav.Link as={Link} to="/swap-requests" className="text-white fw-semibold"> <IoMdSwap size={20} className="me-2" />Swap Requests</Nav.Link>
          </>
        )}
        {role === "user" && (
          <>
            <Nav.Link as={Link} to="/employee" className="text-white fw-semibold"> <FaChartBar size={20} className="me-2" />Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/employee/availability" className="text-white fw-semibold"> <FaClipboardCheck size={20} className="me-2" />My Availability</Nav.Link>
            <Nav.Link as={Link} to="/my-schedule" className="text-white fw-semibold"> <FaCalendarAlt size={20} className="me-2" />My Schedule</Nav.Link>
            <Nav.Link as={Link} to="/timeoff" className="text-white fw-semibold"> <FaCommentDots size={20} className="me-2" />Time Off Requests</Nav.Link>
            <Nav.Link as={Link} to="/swap-requests" className="text-white fw-semibold"> <IoMdSwap size={20} className="me-2" />Swap Requests</Nav.Link>
          </>
        )}
        <div className="mt-auto">
          {!role && (
            <Nav.Link as={Link} to="/" className="text-white fw-semibold">
              Login
            </Nav.Link>
          )}
          {role && (
            <NavDropdown className="custom-dropdown" title={
              <span style={{ color: "white" }}>
                <FaUserCircle size={20} className="me-2" />
                Account
              </span>
            } id="account-dropdown" align="start">
              <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
            </NavDropdown>
          )}
        </div>
      </Nav>     
    </div>
  );
};

const App = () => (
  <Router>
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 p-3">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/employee" element={<Employee />} />
          <Route path="/employee/availability" element={<AvailabilityForm />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add" element={<Add />} />
          <Route path="/timeoff" element={<TimeOff />} />
          <Route path="/swap-requests" element={<SwapRequests />} />
          <Route path="/my-schedule" element={<MySchedule />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;
