import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Add = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    role: "user", 
    email: "",
    phone: "",
    job_title: "",
    department: "",
    hourly_pay_rate: "",
    employment_status: "Full-Time",
    availability: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "hourly_pay_rate") {
      const regex = /^\d*\.?\d{0,2}$/; 
      if (!regex.test(value)) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
  
    try {
      const token = localStorage.getItem("token"); 
  
      if (!token) {
        setError("Authentication required. Please log in.");
        return;
      }
  
      console.log("Token being sent in request:", token);
  
      await axios.post("http://localhost:5000/api/users", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is included
          "Content-Type": "application/json",
        },
      });
  
      setMessage("Employee added successfully!");
      setFormData({
        first_name: "",
        last_name: "",
        role: "user",
        email: "",
        phone: "",
        job_title: "",
        department: "",
        hourly_pay_rate: "",
        employment_status: "Full-Time",
        availability: "",
        password: "",
      });
  
      // Navigate back to Admin panel after success
      setTimeout(() => navigate("/admin"), 2000);
    } catch (error) {
      console.error("Error adding employee:", error.response?.data || error.message);
      setError(error.response?.data?.error || "Error adding employee.");
    }
  };
  

  return (
    <Container className="mt-4">
      <Card className="shadow p-4">
        <h2 className="mb-3">Add New Employee</h2>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Role</Form.Label>
                <Form.Select name="role" value={formData.role} onChange={handleChange} required>
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
                <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Job Title</Form.Label>
                <Form.Control type="text" name="job_title" value={formData.job_title} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Department</Form.Label>
                <Form.Control type="text" name="department" value={formData.department} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Hourly Pay Rate</Form.Label>
                <Form.Control
                  type="text"
                  name="hourly_pay_rate"
                  value={formData.hourly_pay_rate}
                  onChange={handleChange}
                  required
                  placeholder="Enter amount (e.g., 12.50)"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Employment Status</Form.Label>
                <Form.Select name="employment_status" value={formData.employment_status} onChange={handleChange}>
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Availability</Form.Label>
                <Form.Control type="text" name="availability" value={formData.availability} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mt-3">
            <Col>
              <Button variant="success" type="submit" className="gradient-btn save mt-3 w-100">
                Add Employee
              </Button>
            </Col>
            <Col>
              <Button variant="secondary" onClick={() => navigate("/admin")} className="gradient-btn reject mt-3 w-100">
                Cancel
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </Container>
  );
};

export default Add;
