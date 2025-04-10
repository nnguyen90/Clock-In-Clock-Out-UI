import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Alert, Form, Modal, Card } from "react-bootstrap";

const SwapRequests = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [reason, setReason] = useState("");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const [userShifts, setUserShifts] = useState([]);
    const [selectedShift, setSelectedShift] = useState("");
    const [employeeList, setEmployeeList] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [employeeShifts, setEmployeeShifts] = useState([]);
    const [selectedEmployeeShift, setSelectedEmployeeShift] = useState("");
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchRequests();
        fetchUserShifts();
        fetchEmployees();
    }, []);

    const fetchUserShifts = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${baseURL}/api/shifts/userShifts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserShifts(res.data);
        } catch (err) {
            console.error("Error fetching user shifts", err);
        }
    };

    const fetchEmployees = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${baseURL}/api/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployeeList(res.data);
        } catch (err) {
            console.error("Error fetching employee list", err);
        }
    };

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const endpoint =
                role === "admin" || role === "manager"
                    ? `${baseURL}/api/swapshift` // Fetch all requests for manager/admin
                    : `${baseURL}/api/swapshift/user`; // Fetch only logged-in employee's requests

            const { data } = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        }
    };

    const handleEmployeeSelect = async (e) => {
        const empId = e.target.value;
        setSelectedEmployee(empId);

        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(`${baseURL}/api/shifts/user/${empId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEmployeeShifts(res.data);
        } catch (err) {
            console.error("Error fetching employee shifts", err);
            setEmployeeShifts([]); // If no shifts found
        }
    };

    const handleRequestSwapShift = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        const payload = {
            requested_by: userId,
            requested_by_employee_shiftID: selectedShift,
            requested_for: selectedEmployee,
            requested_for_employee_shiftID: selectedEmployeeShift,
            reason,
        };

        try {
            const response = await axios.post(`${baseURL}/api/swapshift`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            setMessage(response.data.message || "Request submitted");
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
            const response = await axios.put(`${baseURL}/api/swapshift/${id}/${status}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            );

            setMessage(response.data.message);
            fetchRequests(); // Refresh list after approval/rejection
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
                <h2 className="mb-2" style={{ fontWeight: "bold" }}>Swap Shift Requests</h2>
                <hr className="mb-4" />
            </div>
            <div className="ps-4 pe-4">
                <Card className="shadow p-4">
                    {message && <Alert variant="success">{message}</Alert>}

                    {role === "user" && (
                        <Button 
                            className="gradient-btn save" 
                            style={{ width: "fit-content", marginBottom: "16px" }} 
                            onClick={() => setShowModal(true)}>
                                Request Shift Swap
                        </Button>
                    )}

                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                {role === "user" && <th>Request ID</th>}
                                <th>Requested By</th>
                                <th>Shift</th>
                                <th>Requested For</th>
                                <th>Shift</th>
                                <th>Reason</th>
                                <th>Status</th>
                                {(role === "manager" || role === "admin") && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length > 0 ? (
                                requests.map((request) => (
                                    <tr key={request._id}>
                                        {role === "user" && <td>{request._id}</td>}
                                        <td>{request.requested_by?.first_name} {request.requested_by?.last_name} </td>
                                        <td>
                                            {request.requested_by_employee_shiftID
                                                ? `${new Date(request.requested_by_employee_shiftID.date).toLocaleDateString()} | ${request.requested_by_employee_shiftID.start_time} - ${request.requested_by_employee_shiftID.end_time}`
                                                : "N/A"}
                                        </td>
                                        <td>{request.requested_for?.first_name} {request.requested_for?.last_name}</td>
                                        <td>
                                            {request.requested_for_employee_shiftID
                                                ? `${new Date(request.requested_for_employee_shiftID.date).toLocaleDateString()} | ${request.requested_for_employee_shiftID.start_time} - ${request.requested_for_employee_shiftID.end_time}`
                                                : "N/A"}
                                        </td>

                                        <td>{request.reason}</td>
                                        <td>{renderStatus(request.status)}</td>
                                        {(role === "manager" || role === "admin") && (
                                            <td>
                                                <Button
                                                    className="gradient-btn approve"
                                                    onClick={() => handleAction(request._id, "approve")}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    className="gradient-btn reject ms-2"
                                                    onClick={() => handleAction(request._id, "reject")}
                                                >
                                                    Reject
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={role === "manager" || role === "admin" ? 7 : 7} className="text-center">
                                        No requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                    {/* Modal for Requesting Swap shift */}
                    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                        <Modal.Header closeButton>
                            <Modal.Title>Request Swap shift</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form onSubmit={handleRequestSwapShift}>

                                <Form.Group className="mb-3">
                                    <Form.Label>Your Shift</Form.Label>
                                    <Form.Select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} required>
                                        <option value="">Select your shift</option>
                                        {userShifts.map(shift => (
                                            <option key={shift._id} value={shift._id}>
                                                {shift.date} - {shift.start_time} to {shift.end_time}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Swap With</Form.Label>
                                    <Form.Select value={selectedEmployee} onChange={handleEmployeeSelect} required>
                                        <option value="">Select employee</option>
                                        {employeeList.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.first_name} {emp.last_name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Employee's Shift</Form.Label>
                                    <Form.Select
                                        value={selectedEmployeeShift}
                                        onChange={(e) => setSelectedEmployeeShift(e.target.value)}
                                        required
                                        disabled={employeeShifts.length === 0}
                                    >
                                        <option value="">{employeeShifts.length ? "Select shift" : "No shifts found"}</option>
                                        {employeeShifts.map(shift => (
                                            <option key={shift._id} value={shift._id}>
                                                {shift.date} - {shift.start_time} to {shift.end_time}
                                            </option>
                                        ))}
                                    </Form.Select>
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

                                <Button variant="primary" type="submit">
                                    Submit Request
                                </Button>
                            </Form>

                        </Modal.Body>
                    </Modal>
                </Card>
            </div>
        </>
    );
};

export default SwapRequests;
