import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, Table, Button, Alert, Form, Modal } from "react-bootstrap";

const TimeOff = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const role = localStorage.getItem("role");
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        role === "admin" || role === "manager"
          ? `${baseURL}/api/timeoff`
          : `${baseURL}/api/timeoff/user`;

      const { data } = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const handleRequestTimeOff = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseURL}/api/timeoff`,
        { start_date: startDate, end_date: endDate, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data.message);
      setShowModal(false);
      fetchRequests();
    } catch (error) {
      console.error("Error submitting request:", error);
      setMessage("Failed to submit request.");
    }
  };

  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${baseURL}/api/timeoff/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage(response.data.message);
      fetchRequests();
    } catch (error) {
      console.error("Error updating request:", error);
      setMessage("Failed to update request.");
    }
  };

  const renderStatus = (status) => {
    const className =
      status === "Approved"
        ? "status-approved"
        : status === "Rejected"
        ? "status-rejected"
        : "status-pending";
  
    const icon =
      status === "Approved"
        ? "✅"
        : status === "Rejected"
        ? "❌"
        : "⏳";
  
    return (
      <span className={`status-badge ${className}`}>
        <span className="status-icon">{icon}</span>
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="mt-4 ps-4">
        <h2 className="mb-2" style={{ fontWeight: "bold" }}>Time Off Requests</h2>
        <hr className="mb-4" />
      </div>

      <div className="ps-4 pe-4">
        <Card className="shadow p-4">
          {message && <Alert variant="success">{message}</Alert>}

          {role === "user" && (
            <Button
              className="gradient-btn save"
              style={{ width: "fit-content", marginBottom: "16px" }}
              onClick={() => setShowModal(true)}
            >
              Request Time Off
            </Button>
          )}

          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  {(role === "manager" || role === "admin") && <th>Employee</th>}
                  {role === "user" && <th>Request ID</th>}
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  {(role === "manager" || role === "admin") && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((request) => (
                    <tr key={request._id}>
                      {(role === "manager" || role === "admin") && (
                        <td>
                          {request.employee_id?.first_name} {request.employee_id?.last_name}
                        </td>
                      )}
                      {role === "user" && <td>{request._id}</td>}
                      <td>{new Date(request.start_date).toLocaleDateString()}</td>
                      <td>{new Date(request.end_date).toLocaleDateString()}</td>
                      <td>{request.reason}</td>
                      <td>
                        {role === "user" || role === "admin" || role === "manager"
                          ? renderStatus(request.status)
                          : request.status}
                      </td>
                      {(role === "manager" || role === "admin") && (
                        <td>
                          <button
                            className="gradient-btn approve"
                            onClick={() => handleAction(request._id, "Approved")}
                          >
                            Approve
                          </button>
                          <button
                            className="gradient-btn reject ms-2"
                            onClick={() => handleAction(request._id, "Rejected")}
                          >
                            Reject
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(role === "manager" || role === "admin") ? 7 : 6} className="text-center">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Request Time Off</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRequestTimeOff}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reason</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </Form.Group>
            <Button className="custom-login-btn" type="submit">
              Submit Request
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default TimeOff;
