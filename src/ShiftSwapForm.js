import React, { useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

const ShiftSwapForm = ({ employeesForShift, swappingEmployee, onClose }) => {
  const [swapRequest, setSwapRequest] = useState({
    yourShift: "",
    theirShift: "",
  });
  const handleSwapChange = (e) => {
    setSwapRequest({ ...swapRequest, [e.target.name]: e.target.value });
  };
  const handleSwapSubmit = () => {
    if (swapRequest.yourShift && swapRequest.theirShift) {
      alert(`Shift swap request submitted!\nYour Shift: ${swapRequest.yourShift}\nTheir Shift: ${swapRequest.theirShift}`);
      onClose();
    } else {
      alert("Please select both shifts.");
    }
  };
  return (
    <tr>
      <td colSpan="8">
        <Form>
          <Row>
            <Col md={5}>
              <Form.Group>
                <Form.Label>Your Shift</Form.Label>
                <Form.Select name="yourShift" value={swapRequest.yourShift} onChange={handleSwapChange}>
                  <option value="">Select your shift</option>
                  {employeesForShift.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.date} - {shift.start_time} to {shift.end_time}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5}>
              <Form.Group>
                <Form.Label>Their Shift</Form.Label>
                <Form.Select name="theirShift" value={swapRequest.theirShift} onChange={handleSwapChange}>
                  <option value="">Select their shift</option>
                  {employeesForShift.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.date} - {shift.start_time} to {shift.end_time}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button className="gradient-btn approve"  
                style={{ marginRight: "10px" }} 
                onClick={handleSwapSubmit}>Submit</Button>
              <Button className="gradient-btn reject" onClick={onClose} >Cancel</Button>
            </Col>
          </Row>
        </Form>
      </td>
    </tr>
  );
};

export default ShiftSwapForm;
