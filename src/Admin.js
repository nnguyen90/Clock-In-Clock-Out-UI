import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Row, Col, Card, Spinner, Alert, Form, Modal, Dropdown } from "react-bootstrap";
import WeeklyShiftCalendar from "./WeeklyShiftCalendar";
import ShiftSwapForm from "./ShiftSwapForm";
import AvailabilityForm from "./AvailabilityForm";

const Admin = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editedEmployee, setEditedEmployee] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingAvailability, setViewingAvailability] = useState(null);
  const [swappingEmployeeId, setSwappingEmployeeId] = useState(null);

  
  // State for shift management
  const [shiftDate, setShiftDate] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [employeesForShift, setEmployeesForShift] = useState([]);
  const [assignedEmployee, setAssignedEmployee] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  

  useEffect(() => {
    const token = localStorage.getItem("token");
      if (token) {
        const decoded = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setUserRole(decoded.role);
      }

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${baseURL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmployees(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError("Failed to load employees. Please try again later.");
        setLoading(false);
      }
    };

    const fetchEmployeesForShift = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Token being sent in request:", token);
   
        const response = await axios.get(`${baseURL}/api/shifts/employees`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
   
        setEmployeesForShift(response.data);
      } catch (err) {
        console.error("Error fetching employees for shift:", err);
      }
    };

    fetchEmployees();
    fetchEmployeesForShift();
  }, []);
  
  // Handle clicking "Edit" button
  const handleEditClick = (employee) => {
    setEditingEmployeeId(employee.id || employee._id);
    setEditedEmployee({ ...employee });
  };

  // Handle input changes
  const handleInputChange = (e) => {
    setEditedEmployee({ ...editedEmployee, [e.target.name]: e.target.value });
  };

  // Handle delete
  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${baseURL}/api/users/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
      } catch (err) {
        console.error("Error deleting employee:", err);
        setError("Failed to delete employee.");
      }
    }
  };

  // Handle save action
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${baseURL}/api/users/${editedEmployee.id || editedEmployee._id}`, editedEmployee, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEmployees(employees.map(emp => (emp.id === editedEmployee.id ? editedEmployee : emp)));
      setEditingEmployeeId(null);
    } catch (error) {
      console.error("Error updating employee:", error);
      setError("Failed to update employee.");
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    setEditingEmployeeId(null);
    setEditedEmployee(null);
  };

  // Handle view availability
  const handleViewAvailability = async (employee) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${baseURL}/api/users/${employee._id}/availability`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setViewingAvailability((prev) =>
        prev && prev._id === employee._id ? null : { ...employee, availability: data }
      );
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError("Failed to fetch availability.");
    }
  };

  // Handle create shift action
  const handleCreateShift = async () => {
    try {
      const token = localStorage.getItem("token");
      const shiftData = {
        date: shiftDate,
        start_time: shiftStartTime,
        end_time: shiftEndTime,
        employee_id: assignedEmployee,
      };

      const response = await axios.post(`${baseURL}/api/shifts`, shiftData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setShiftDate("");
        setShiftStartTime("");
        setShiftEndTime("");
        setAssignedEmployee("");
        setError(""); 
        setShowModal(true);
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Error creating shift:", err);
      setError("Failed to create shift. Please check logs.");
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, "0");
        const minute = m.toString().padStart(2, "0");
        times.push(`${hour}:${minute}`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Filter employees through search
  const filteredEmployees = employees.filter((emp) => {
    const search = searchTerm.toLowerCase().trim();
    return (
      emp.first_name.toLowerCase().includes(search) ||
      emp.last_name.toLowerCase().includes(search) ||
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search) ||
      emp.email.toLowerCase().includes(search) ||
      emp.department?.toLowerCase().includes(search)
    );
  });

  const closeAllModals = () => {
    setShowModal(false);
    setViewingAvailability(null);
    setSwappingEmployeeId(null);
  };

  return (
    <>
      {/* Left-aligned heading */}
      <div className="mt-4 ps-4">
          <h2 className="mb-2" style={{ fontWeight: "bold" }}>Employee Management</h2>
          <hr className="mb-4" />
      </div>


    <Container className="mt-4">
      <Card className="shadow p-3">
      <h3>Employee List</h3>
      
      <Form className="mb-3">
        <Row className="align-items-center">
          <Col md={8}>
            <Form.Control
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4} className="text-end">
            <Button
              className="gradient-btn save"
              onClick={() => navigate("/add")}
            >
              Add Employee
            </Button>
          </Col>
        </Row>
      </Form>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Job Title</th>
                <th>Departments</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <React.Fragment key={employee.id || employee._id}>
                    <tr>
                      <td>{employee.id || employee._id}</td>
                      <td>{employee.first_name}</td>
                      <td>{employee.last_name}</td>
                      <td>{employee.job_title}</td>
                      <td>{employee.department}</td>
                      <td>{employee.email}</td>
                      <td>{employee.role}</td>
                      <td>
                        <Dropdown align="end">
                          <Dropdown.Toggle className="gradient-btn save" size="sm" id={`dropdown-${employee._id}`}>
                            Actions
                          </Dropdown.Toggle>

                          <Dropdown.Menu className="custom-dropdown-menu">
                            <Dropdown.Item onClick={() => handleEditClick(employee)}>
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleDelete(employee._id)}>
                              Delete
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleViewAvailability(employee)}>
                              {viewingAvailability?._id === employee._id ? "Hide Availability" : "View Availability"}
                            </Dropdown.Item>
                            {/* <Dropdown.Item
                              onClick={() =>
                                setSwappingEmployeeId(
                                  swappingEmployeeId === employee._id ? null : employee._id
                                )
                              }
                            >
                              {swappingEmployeeId === employee._id ? "Cancel Swap" : "Request Swap"}
                            </Dropdown.Item> */}
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                    {swappingEmployeeId === employee._id && (
                      <ShiftSwapForm
                        employeesForShift={employeesForShift}
                        swappingEmployee={employee}
                        onClose={() => setSwappingEmployeeId(null)}
                      />
                    )}

                    {editingEmployeeId === (employee.id || employee._id) && (
                    <tr>
                      <td colSpan="8">
                        <Form>
                          <Row>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>First Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="first_name"
                                  value={editedEmployee.first_name}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Last Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="last_name"
                                  value={editedEmployee.last_name}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={editedEmployee.email}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mt-3">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="phone"
                                  value={editedEmployee.phone}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Job Title</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="job_title"
                                  value={editedEmployee.job_title}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Department</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="department"
                                  value={editedEmployee.department}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mt-3">
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label>Role</Form.Label>
                              <Form.Select
                                name="role"
                                value={editedEmployee.role}
                                onChange={handleInputChange}
                              >
                                <option value="admin">admin</option>
                                <option value="user">user</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Hourly Pay Rate</Form.Label>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  name="hourly_pay_rate"
                                  value={editedEmployee.hourly_pay_rate}
                                  onChange={handleInputChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Employment Status</Form.Label>
                                <Form.Select
                                  name="employment_status"
                                  value={editedEmployee.employment_status}
                                  onChange={handleInputChange}
                                >
                                  <option value="Full-Time">Full-Time</option>
                                  <option value="Part-Time">Part-Time</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mt-3">
                            <Col className="text-end">
                              <Button className="gradient-btn save"  style={{ marginRight: "10px" }} onClick={handleSave} >
                                Save
                              </Button>
                              <Button className="gradient-btn reject" onClick={handleCancel}>
                                Cancel
                              </Button>
                            </Col>
                          </Row>
                        </Form>
                      </td>
                    </tr>
                  )}
                  {viewingAvailability?._id === employee._id && (
                    <tr>
                      <td colSpan="8">
                        <Card className="mt-3">
                          <Card.Body>
                            <AvailabilityForm userId={employee._id} />
                          </Card.Body>
                        </Card>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Shift Management Form */}
      <Card className="shadow p-3 mt-4">
        <h3>Create Shift</h3>
        <Form>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Shift Date</Form.Label>
                <Form.Control
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                />
              </Form.Group>
            </Col>
     
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Select
                  value={shiftStartTime}
                  onChange={(e) => setShiftStartTime(e.target.value)}
                  required
                >
                  <option value="">Select Start Time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
     
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Select
                  value={shiftEndTime}
                  onChange={(e) => setShiftEndTime(e.target.value)}
                  required
                >
                  <option value="">Select End Time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
     
          <Row className="mt-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Assign Employee</Form.Label>
                <Form.Select
                  value={assignedEmployee}
                  onChange={(e) => setAssignedEmployee(e.target.value)}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Button variant="primary" onClick={handleCreateShift} className="gradient-btn save w-20 mt-3">
            Create Shift
          </Button>
        </Form>
      </Card>

      {/* Popup Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Shift Assigned</Modal.Title>
        </Modal.Header>
        <Modal.Body>Shift has been assigned!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    {userRole === "manager" || userRole === "admin" ? (
        <WeeklyShiftCalendar userRole={userRole} refreshKey={refreshKey} />
      ) : null}
    </>
  );
};

export default Admin;