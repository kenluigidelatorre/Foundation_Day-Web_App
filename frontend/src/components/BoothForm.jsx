import { useEffect, useState } from "react";

function BoothForm({ booth, onSuccess, onCancel }) {
  const [boothName, setBoothName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fill form when editing
  useEffect(() => {
    if (booth) {
      setBoothName(booth.booth_name || "");
      setDescription(booth.description || "");
      setLocation(booth.location || "");
    } else {
      setBoothName("");
      setDescription("");
      setLocation("");
    }

    setError("");
  }, [booth]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!boothName.trim()) {
      setError("Booth name is required.");
      return;
    }

    setLoading(true);

    try {
      const url = booth
        ? `http://localhost:5000/api/booths/${booth.id}`
        : "http://localhost:5000/api/booths";

      const method = booth ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          booth_name: boothName,
          description: description,
          location: location,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      // Clear form
      setBoothName("");
      setDescription("");
      setLocation("");

      onSuccess();
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="booth-form" onSubmit={handleSubmit}>
      <h2>{booth ? "Edit Booth" : "Add New Booth"}</h2>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label>Booth Name</label>

        <input
          type="text"
          value={boothName}
          onChange={(event) => setBoothName(event.target.value)}
          placeholder="Enter booth name"
        />
      </div>

      <div className="form-group">
        <label>Description</label>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter booth description"
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Location</label>

        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Enter booth location"
        />
      </div>

      <div className="form-buttons">
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Saving..." : booth ? "Update Booth" : "Add Booth"}
        </button>

        {booth && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default BoothForm;
