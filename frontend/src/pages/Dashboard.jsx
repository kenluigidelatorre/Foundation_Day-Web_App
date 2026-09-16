import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DASHBOARD STATS
  // ==========================================

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/dashboard/stats`);

      if (!response.ok) {
        throw new Error("Failed to load dashboard.");
      }

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH REGISTRATIONS
  // ==========================================

  const fetchRegistrations = async (searchValue = "") => {
    try {
      setLoadingRegistrations(true);

      const response = await fetch(
        `${API_URL}/api/logs?search=${encodeURIComponent(searchValue)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to load registration records.");
      }

      const data = await response.json();

      setRegistrations(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchStats();
    fetchRegistrations();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRegistrations(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // ==========================================
  // DELETE REGISTRATION
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this registration?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/logs/${id}`, {
        method: "DELETE",
      });

      const text = await response.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Server returned:", text);

        throw new Error(
          "Server returned an invalid response. Please restart the backend.",
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete registration.");
      }

      alert("Registration deleted successfully!");

      // Refresh dashboard statistics
      await fetchStats();

      // Refresh search results
      await fetchRegistrations(search);
    } catch (error) {
      console.error("DELETE ERROR:", error);

      alert(error.message);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error && !stats) {
    return (
      <div className="page">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ==================================
                PAGE HEADER
            ================================== */}

      <div className="page-header">
        <div>
          <h1>Foundation Day Dashboard</h1>

          <p>Monitor students, booths, and booth visits.</p>
        </div>
      </div>

      {/* ==================================
                STAT CARDS
            ================================== */}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students Registered</h3>

          <h2>{stats.totalStudents}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Booths</h3>

          <h2>{stats.totalBooths}</h2>
        </div>

        <div className="stat-card">
          <h3>Total Booth Visits</h3>

          <h2>{stats.totalVisits}</h2>
        </div>
      </div>

      {/* ==================================
                MOST VISITED BOOTH
            ================================== */}

      <div className="dashboard-section">
        <h2>Most Visited Booth</h2>

        {stats.mostVisitedBooth ? (
          <div className="featured-booth">
            <h3>{stats.mostVisitedBooth.booth_name}</h3>

            <p>{stats.mostVisitedBooth.visitor_count} visitors</p>
          </div>
        ) : (
          <p>No booth data yet.</p>
        )}
      </div>

      {/* ==================================
                BOOTH ACTIVITY
            ================================== */}

      <div className="dashboard-section">
        <h2>Booth Activity</h2>

        {stats.boothActivity.length === 0 ? (
          <p>No booth activity yet.</p>
        ) : (
          stats.boothActivity.map((booth) => (
            <div className="booth-activity" key={booth.id}>
              <div className="activity-header">
                <strong>{booth.booth_name}</strong>

                <span>{booth.visitor_count} visitors</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${booth.percentage}%`,
                  }}
                ></div>
              </div>

              <small>{booth.percentage}%</small>
            </div>
          ))
        )}
      </div>

      {/* ==================================
                ALL REGISTRATIONS + SEARCH
            ================================== */}

      <div className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Student Registrations</h2>

            <p>Search by student ID, name, or program.</p>
          </div>

          <div className="search-box">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student..."
            />
          </div>
        </div>

        {/* Search result count */}

        <div className="search-result-count">
          {loadingRegistrations
            ? "Searching..."
            : `${registrations.length} registration${
                registrations.length !== 1 ? "s" : ""
              } found`}
        </div>

        {/* ==================================
                    TABLE
                ================================== */}

        {registrations.length === 0 ? (
          <div className="empty-state">
            <h3>No students found</h3>

            <p>Try searching using a different student name, ID, or program.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Program</th>
                  <th>Block & Year</th>
                  <th>Booth</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td>{registration.student_id}</td>

                    <td>{registration.full_name}</td>

                    <td>{registration.program}</td>

                    <td>{registration.block_year}</td>

                    <td>{registration.booth_name}</td>

                    <td>{registration.visit_date}</td>

                    <td>{registration.visit_time}</td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(registration.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
