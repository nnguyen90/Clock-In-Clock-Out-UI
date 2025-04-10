import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Card, Row, Col, Button, Table, Alert, Tabs, Tab } from "react-bootstrap";

const Employee = () => {
  const [employee, setEmployee] = useState(null);
  const [clockRecords, setClockRecords] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployee(response.data);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        navigate("/");
      }
    };

    const fetchClockRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/api/clock`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClockRecords(response.data);

        // Check last status from logs
        if (response.data.length > 0) {
          setStatusMessage(`Last action: ${response.data[0].status}`);
        }
      } catch (error) {
        console.error("Error fetching clock-in records:", error);
      }
    };

    fetchEmployeeData();
    fetchClockRecords();
  }, [navigate]);

  const handleClockIn = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseURL}/api/clock/in`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setClockRecords((prevRecords) => {
        const filteredRecords = prevRecords.filter((record) => record.status !== "Clocked In");
        return [...filteredRecords, response.data]; 
      });
    } catch (error) {
      console.error("Error clocking in:", error);
    }
  };

  const handleClockOut = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseURL}/api/clock/out`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setClockRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.status === "Clocked In"
            ? { ...record, ...response.data } 
            : record
        )
      );
    } catch (error) {
      console.error("Error clocking out:", error);
    }
  };

  const formatTotalHours = (hours) => {
    if (hours < 0.01) {
      
      return `${(hours * 60).toFixed(2)} minutes`;
    }
    return `${hours.toFixed(2)} hours`; 
  };

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   localStorage.removeItem("role");
  //   navigate("/");
  // };

  if (!employee) {
    return <p>Loading...</p>;
  }

  return (
      <>
      {/* Left-aligned */}
      <div className="mt-4 ps-4">
        <h2 className="mb-2" style={{ fontWeight: "bold" }}>Welcome, {employee.first_name} {employee.last_name}</h2>
        <hr className="mb-4" />
      </div>

      {/* Tabs (aligned left) */}
      <div className="ps-4 pe-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          variant="pills"
          className="mb-3"
        >
          <Tab eventKey="profile" title="Profile" />
          <Tab eventKey="time" title="Time Record" />
        </Tabs>
      </div>

      {/* Main content (aligned left) */}
      <div className="ps-4 pe-4">
        <Card className="shadow p-4">
          {activeTab === "profile" && (
            <>
              {statusMessage && <Alert variant="info">{statusMessage}</Alert>}

              <Table striped bordered hover>
                <tbody>
                  <tr><td><strong>Email</strong></td><td>{employee.email}</td></tr>
                  <tr><td><strong>Phone</strong></td><td>{employee.phone}</td></tr>
                  <tr><td><strong>Job Title</strong></td><td>{employee.job_title}</td></tr>
                  <tr><td><strong>Department</strong></td><td>{employee.department}</td></tr>
                  <tr><td><strong>Hourly Pay Rate</strong></td><td>${employee.hourly_pay_rate}</td></tr>
                  <tr><td><strong>Employment Status</strong></td><td>{employee.employment_status}</td></tr>
                </tbody>
              </Table>
            </>
          )}

          {activeTab === "time" && (
            <>
              <Col className="mt-3">
                <Col md={6}>
                  <Button onClick={handleClockIn} 
                  className="gradient-btn save w-20"
                  style={{ marginBottom: "16px", width: "20%" }}
                  >
                    Clock In
                  </Button>
                </Col>
                <Col md={6}>
                  <Button onClick={handleClockOut} 
                  className="gradient-btn reject w-20"
                  style={{ marginBottom: "16px", width: "20%" }}
                  >
                    Clock Out
                  </Button>
                </Col>
              </Col>

              <h4 className="mt-4">Clock Records</h4>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Action</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {clockRecords.length > 0 ? (
                    clockRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{record.status}</td>
                        <td>{record.clock_in_time ? new Date(record.clock_in_time).toLocaleString() : "N/A"}</td>
                        <td>{record.clock_out_time ? new Date(record.clock_out_time).toLocaleString() : "N/A"}</td>
                        <td>{formatTotalHours(record.total_hours)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">No records found.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Card>
      </div>
    </>
  );
};

export default Employee;
