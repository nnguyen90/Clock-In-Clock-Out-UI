import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Container, Card } from "react-bootstrap";

const WeeklyShiftCalendar = ({ userRole, refreshKey }) => {
  const [shifts, setShifts] = useState([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (userRole === "manager" || userRole === "admin") {
      fetchShifts();
    }
  }, [currentWeekStart, userRole, refreshKey]);

  const fetchShifts = async () => {
    try {
      const formattedDate = currentWeekStart.toISOString().split("T")[0];
      const response = await axios.get(
        `${baseURL}/api/shifts/week/${formattedDate}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setShifts(groupShiftsByEmployee(response.data));
      setError(null);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      setError("Access denied. Only managers or admins can view shifts.");
    }
  };

  // Group shifts by employee numeric ID
  const groupShiftsByEmployee = (shifts) => {
    const grouped = {};
    shifts.forEach((shift) => {
      const employeeId = shift.employee_id?.id || "Unknown";

      if (!grouped[employeeId]) {
        grouped[employeeId] = {
          name: `Employee ID: ${employeeId}`,
          shifts: [],
        };
      }
      grouped[employeeId].shifts.push(shift);
    });

    console.log("Grouped Employees:", JSON.stringify(grouped, null, 2));
    return Object.values(grouped);
  };

  const changeWeek = (offset) => {
    const newWeek = new Date(currentWeekStart);
    newWeek.setDate(newWeek.getDate() + offset * 7);
    setCurrentWeekStart(newWeek);
  };

  const getDayOfWeek = (offset) => {
    const day = new Date(currentWeekStart);
    day.setDate(day.getDate() + offset);
    return day.toISOString().split("T")[0];
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (userRole !== "manager" && userRole !== "admin") return null;

  return (
    <Container className="mt-4 w-100">
      <Card className="shadow p-4 rounded w-100">
        <h3 className="mb-3 text-center">Weekly Shift Schedule</h3>
        <div className="d-flex justify-content-between mb-3">
            <Button
            className="nav-pills-btn"
            onClick={() => changeWeek(-1)}
            >
              ⬅️ Previous Week
            </Button>
            <Button
              className="nav-pills-btn ms-2"
              onClick={() => changeWeek(1)}
            >
              Next Week ➡️
            </Button>
        </div>
        <Table striped bordered hover responsive className="shadow text-center">
          <thead className="table-dark">
            <tr>
              <th>Employee</th>
              {Array.from({ length: 7 }, (_, i) => (
                <th key={i}>{getDayOfWeek(i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((employee, index) => (
                <tr key={index}>
                  <td className="fw-bold">{employee.name}</td>
                  {Array.from({ length: 7 }, (_, i) => {
                    const shiftForDay = employee.shifts.find(shift =>
                      new Date(shift.date).toISOString().split("T")[0] === getDayOfWeek(i)
                    );
                    return (
                      <td key={i}>
                        {shiftForDay ? (
                          <div className="shift-cell">
                            {shiftForDay.start_time} - {shiftForDay.end_time}
                          </div>
                        ) : (
                          ""
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-muted">No shifts scheduled for this week</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default WeeklyShiftCalendar;
