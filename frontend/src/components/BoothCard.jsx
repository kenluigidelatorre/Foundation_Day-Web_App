function BoothCard({ booth, onEdit, onDelete }) {
  return (
    <div className="booth-card">
      <div className="booth-card-header">
        <h3>{booth.booth_name}</h3>

        <span className="visitor-badge">{booth.visitor_count} visitors</span>
      </div>

      <p className="booth-description">
        {booth.description || "No description provided."}
      </p>

      <div className="booth-info">
        <p>
          <strong>Location:</strong> {booth.location || "Not specified"}
        </p>

        <p>
          <strong>Date Created:</strong> {booth.date_created}
        </p>
      </div>

      <div className="booth-actions">
        <button className="edit-btn" onClick={() => onEdit(booth)}>
          Edit
        </button>

        <button className="delete-btn" onClick={() => onDelete(booth.id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default BoothCard;
