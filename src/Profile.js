import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Spinner, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error.response?.data || error.message);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, token]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(`${baseURL}/api/users/${profile._id}`, profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage("Failed to update profile.");
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <>
      <Container className="mt-4">
        <Card className="shadow p-3">
          <Row className="align-items-center mb-4">
            <Col md={8} className="d-flex align-items-center">
              <img
                src="/avatar-default.png"
                alt="avatar"
                width={80}
                height={80}
                className="rounded-circle me-3"
              />
              <div>
                <h3 className="mb-1">{profile.first_name} {profile.last_name}</h3>
                <small className="text-muted">{profile.email}</small><br/>
                <span className="badge mt-1" style={{
                  backgroundColor: "#00B0FF",
                  color: "#fff",
                  padding: "6px 12px",
                  fontSize: "0.75rem",
                }}>{profile.department}</span>
              </div>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              {editMode ? (
                <>
                  <Button className="gradient-btn save me-2" onClick={handleSave}>Save</Button>
                  <Button className="gradient-btn reject" onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <Button className="gradient-btn save me-2" onClick={() => setEditMode(true)}>Edit</Button>
              )}
            </Col>
          </Row>

          {message && (
            <Alert variant={message.includes("success") ? "success" : "danger"}>
              {message}
            </Alert>
          )}

          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={profile.first_name || ""}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="last_name"
                    value={profile.last_name || ""}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    readOnly={!editMode}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.email || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employment Status</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.employment_status || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    value={profile.department || ""}
                    readOnly
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
    </>
  );
};

export default Profile;