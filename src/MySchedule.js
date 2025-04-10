import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Container, Row, Col, Card, Alert, ListGroup } from "react-bootstrap";

const MySchedule = () => {
  const [shifts, setShifts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [error, setError] = useState("");
  const baseURL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${baseURL}/api/shifts/userShifts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(res.data);
      } catch (err) {
        console.error("Error fetching your shifts:", err);
        setError("Unable to load your schedule.");
      }
    };

    fetchShifts();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-CA");
  };

  const toLocalDateStr = (date) =>
    new Date(date).toLocaleDateString("en-CA");

  const getShiftsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return shifts.filter(
      (shift) => new Date(shift.date).toISOString().split("T")[0] === dateStr
    );
  };

  const todayStr = toLocalDateStr(new Date());

  const sortedUpcomingShifts = [...shifts]
    .filter((shift) => toLocalDateStr(shift.date) >= todayStr)
    .sort((a, b) =>
      toLocalDateStr(a.date).localeCompare(toLocalDateStr(b.date))
    )
    .slice(0, 5);

  return (
    <>
      <div className="mt-4 ps-4">
        <h2 className="mb-2" style={{ fontWeight: "bold" }}>My Schedule</h2>
        <hr className="mb-4" />
      </div>

      <Container fluid className="mt-4 ps-4 pe-4">
        <Row>
          <Col md={6} sm={12}>
            <Card className="shadow p-4 mb-4">
            <h4 className="mb-3">Calendar</h4>
              {error && <Alert variant="danger">{error}</Alert>}

              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileClassName={({ date, view }) => {
                  if (view === "month") {
                    const dateStr = date.toISOString().split("T")[0];
                    const hasShift = shifts.some(
                      (shift) =>
                        new Date(shift.date).toISOString().split("T")[0] === dateStr
                    );
                    return hasShift ? "shift-day" : null;
                  }
                }}
              />

              <h5 className="mt-4 mb-3">{selectedDate.toDateString()}</h5>
              <ListGroup>
                {getShiftsForDate(selectedDate).length > 0 ? (
                  getShiftsForDate(selectedDate).map((shift) => (
                    <ListGroup.Item key={shift._id}>
                      {shift.start_time} - {shift.end_time}
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item>No shifts on this day</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* Right Column: Upcoming Shifts */}
          <Col md={6} sm={12}>
            <Card className="shadow p-4 mb-4">
              <h4 className="mb-3">Upcoming Shifts</h4>
              {sortedUpcomingShifts.length > 0 ? (
                <ListGroup>
                  {sortedUpcomingShifts.map((shift) => (
                    <ListGroup.Item key={shift._id}>
                      <strong>
                        {new Date(shift.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                        })}
                      </strong><br />
                      {shift.start_time} - {shift.end_time}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No upcoming shifts.</p>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MySchedule;
