import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Form, Button, Card, OverlayTrigger, Tooltip } from "react-bootstrap";
import "./styles/App.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [generalError, setGeneralError] = useState("");
    const navigate = useNavigate();
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    const handleLogin = async (e) => {
      e.preventDefault();

      // Reset errors before new attempt
      setEmailError("");
      setPasswordError("");
      setGeneralError("");

      try {
        console.log("Sending login request:", email, password);
        
        const response = await axios.post(
          `${baseURL}/api/auth/login`,
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
          if (response.data.field === "email") {
          setEmailError(response.data.message || "Invalid email, please try again");
          } else if (response.data.field === "password") {
            setPasswordError(response.data.message || "Wrong password, please try again");
          } else {
            setGeneralError(response.data.message || "Login failed, please try again");
          }
          console.error("Login failed:", response.data.message);
        }
      } catch (error) {

        const errMsg = error.response?.data?.message || "Login failed, please try again";
        const errField = error.response?.data?.field;

        if (errField === "email") {
          setEmailError(errMsg);
        } else if (errField === "password") {
          setPasswordError(errMsg);
        } else {
          setGeneralError(errMsg);
        }

        console.log("Raw error response:", error.response?.data);
        console.log("Raw error status:", error.response?.status);

        // console.error("Full login error:", error);
        // console.error("Error response data:", error.response?.data || "No response received");
        // console.error("Error status:", error.response?.status || "No status received");
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
                <OverlayTrigger
                  placement="right"
                  trigger={['hover', 'focus']}
                  overlay={<Tooltip id="tooltip-email">For Testing: john.doe@example.com</Tooltip>}
                >
                   <div className="d-flex align-items-center">
                  <i className="bi bi-envelope-fill me-2"></i>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!emailError}
                  required
                />
              </div>
                </OverlayTrigger>
                <Form.Control.Feedback type="invalid">
                  {emailError}
                </Form.Control.Feedback>
              </Form.Group>

              {/* Password Input */}
              <Form.Group controlId="password" className="mt-3">
                <Form.Label>Password</Form.Label>
                <OverlayTrigger
                  placement="right"
                  trigger={['hover', 'focus']}
                  overlay={<Tooltip id="tooltip-password">For Testing: admin</Tooltip>}
                >
                   <div className="d-flex align-items-center">
                <i className="bi bi-lock-fill me-2"></i>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  isInvalid={!!passwordError}
                  required
                />
                </div>
                </OverlayTrigger>
                <Form.Control.Feedback type="invalid">
                  {passwordError}
                </Form.Control.Feedback>
              </Form.Group>
              {/* General Error */}
                {generalError && (
                  <div className="text-danger mt-2 text-center">
                    {generalError}
                  </div>
                )}

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