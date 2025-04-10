import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import "./styles/App.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
  
    const handleLogin = async (e) => {
      e.preventDefault();
      try {
        console.log("Sending login request:", email, password);
        
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );
    
        console.log("Login success:", response.data);
        
        if (response.data.success) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("role", response.data.role);
          localStorage.setItem("userId", response.data.userId);
          
          navigate("/employee");
        } else {
          console.error("Login failed:", response.data.message);
        }
      } catch (error) {
        console.error("Full login error:", error);
        console.error("Error response data:", error.response?.data || "No response received");
        console.error("Error status:", error.response?.status || "No status received");
      }
    };

  
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Row>
        <Col>
          <Card className="shadow p-4" style={{ width: "22rem" }}>
            <Card.Title className="text-center mb-3">Login</Card.Title>
            <Form onSubmit={handleLogin}>
              {/* Email Input */}
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Password Input */}
              <Form.Group controlId="password" className="mt-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              {/* Submit Button */}
              <Button type="submit" className="d-block mx-auto mt-4 custom-login-btn" style={{ width: "30%" }} >
                Login
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;