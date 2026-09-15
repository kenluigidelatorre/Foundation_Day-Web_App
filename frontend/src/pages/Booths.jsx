import { useEffect, useState } from "react";
import BoothCard from "../components/BoothCard";
import BoothForm from "../components/BoothForm";

function Booths() {
  const [booths, setBooths] = useState([]);
  const [editingBooth, setEditingBooth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooths = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/booths");

      if (!response.ok) {
        throw new Error("Failed to load booths.");
      }

      const data = await response.json();
      setBooths(data);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooths();
  }, []);

  // Edit booth
  const handleEdit = (booth) => {
    setEditingBooth(booth);

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete booth
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this booth?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/booths/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete booth.");
      }

      alert("Booth deleted successfully!");

      fetchBooths();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // After adding/updating
  const handleFormSuccess = () => {
    setEditingBooth(null);
    fetchBooths();
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingBooth(null);
  };

  return (
    <div className="page">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Booths</h1>

          <p>Manage the booths available during Foundation Day.</p>
        </div>
      </div>

      {/* BOOTH FORM */}
      <div className="form-container">
        <BoothForm
          booth={editingBooth}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>

      {/* ERROR */}
      {error && <div className="error-message">{error}</div>}

      {/* BOOTH LIST */}
      {loading ? (
        <div className="loading">Loading booths...</div>
      ) : booths.length === 0 ? (
        <div className="empty-state">
          <h2>No booths yet</h2>

          <p>Use the form above to add your first Foundation Day booth.</p>
        </div>
      ) : (
        <div className="booths-grid">
          {booths.map((booth) => (
            <BoothCard
              key={booth.id}
              booth={booth}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Booths;
