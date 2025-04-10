import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Card, Table, Button, Form, Row, Col, Alert, Modal } from "react-bootstrap";
import { v4 as uuidv4 } from "uuid";

const AvailabilityForm = ({ userId: propUserId }) => {
  const [availability, setAvailability] = useState([]);
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loggedInUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const userId = propUserId || loggedInUserId;
  const isViewingOwn = !propUserId || propUserId === loggedInUserId;
  const isEditable = !isViewingOwn && (role === "admin" || role === "manager");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  const fetchAvailability = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/users/${userId}/availability`,
        axiosConfig
      );
      setAvailability(data);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setMessage("Failed to load availability.");
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [userId]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();

    if (!day || !startTime || !endTime) {
      setMessage("Please fill in all fields.");
      return;
    }

    const payload = {
      _id: uuidv4(),
      day,
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const response = await axios.post(
        `http://localhost:5000/api/users/${userId}/availability`,
        payload,
        axiosConfig
      );

      setAvailability(response.data);
      setDay("");
      setStartTime("");
      setEndTime("");
      setMessage("Availability added successfully!");
    } catch (err) {
      console.error("Error adding availability:", err);
      setMessage(err.response?.data?.error || "Failed to add availability.");
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/users/${userId}/availability/${availabilityId}`,
        axiosConfig
      );

      setAvailability(response.data.availability);
      setMessage("Availability deleted successfully.");
    } catch (err) {
      console.error("Error deleting availability:", err);
      setMessage(err.response?.data?.error || "Failed to delete availability.");
    }
  };

  const handleEditAvailability = (item) => {
    setEditItem(item);
    setDay(item.day);
    setStartTime(item.start_time);
    setEndTime(item.end_time);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        day,
        start_time: startTime,
        end_time: endTime,
      };

      const response = await axios.put(
        `http://localhost:5000/api/users/${userId}/availability/${editItem._id}`,
        payload,
        axiosConfig
      );

      setAvailability(response.data.availability);
      setMessage("Availability updated successfully.");
      setShowEditModal(false);
      setEditItem(null);
      setDay("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      console.error("Error updating availability:", err);
      setMessage(err.response?.data?.error || "Failed to update availability.");
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <>
      <div className="mt-4 ps-4">
        <h2 className="mb-2" style={{ fontWeight: "bold" }}>Availability</h2>
        <hr className="mb-4" />
      </div>
      <div className="ps-4 pe-4">
        <Card className="shadow p-4">
          {message && (
            <Alert variant={message.toLowerCase().includes("fail") ? "danger" : "success"}>
              {message}
            </Alert>
          )}

          {isEditable && (
            <Form onSubmit={handleAddAvailability} className="mb-4">
              <Row>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Day</Form.Label>
                    <Form.Select value={day} onChange={(e) => setDay(e.target.value)} required>
                      <option value="">Select Day</option>
                      {daysOfWeek.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>End Time</Form.Label>
                    <Form.Control
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" className="gradient-btn save mt-3">Add Availability</Button>
            </Form>
          )}

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Day</th>
                <th>Start Time</th>
                <th>End Time</th>
                {isEditable && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {availability.length > 0 ? (
                [...availability]
                  .sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day))
                  .map((item) => (
                    <tr key={item._id}>
                      <td>{item.day}</td>
                      <td>{item.start_time}</td>
                      <td>{item.end_time}</td>
                      {isEditable && (
                        <td>
                          <Button className="gradient-btn approve me-2" onClick={() => handleEditAvailability(item)}>
                            Edit
                          </Button>
                          <Button className="gradient-btn reject" onClick={() => handleDeleteAvailability(item._id)}>
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={isEditable ? 4 : 3} className="text-center">No availability set.</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Availability</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Day</Form.Label>
              <Form.Select value={day} onChange={(e) => setDay(e.target.value)} required>
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button className="gradient-btn reject" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button className="gradient-btn save" onClick={handleSaveEdit}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AvailabilityForm;
