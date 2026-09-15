import { useEffect, useState } from "react";

function RegisterForm({ onSuccess }) {
  const [studentId, setStudentId] = useState("");
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [customProgram, setCustomProgram] = useState("");
  const [blockYear, setBlockYear] = useState("");
  const [boothId, setBoothId] = useState("");

  const [booths, setBooths] = useState([]);

  const [loadingBooths, setLoadingBooths] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================
  // GET BOOTHS
  // ============================================

  const fetchBooths = async () => {
    try {
      setLoadingBooths(true);

      const response = await fetch("http://localhost:5000/api/booths");

      if (!response.ok) {
        throw new Error("Failed to load booths.");
      }

      const data = await response.json();

      setBooths(data);
    } catch (error) {
      console.error(error);

      setError("Failed to load booths.");
    } finally {
      setLoadingBooths(false);
    }
  };

  useEffect(() => {
    fetchBooths();
  }, []);

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !studentId.trim() ||
      !fullName.trim() ||
      !program ||
      !blockYear.trim() ||
      !boothId
    ) {
      setError("Please complete all required fields.");

      return;
    }

    if (program === "Others" && !customProgram.trim()) {
      setError("Please enter your program.");

      return;
    }

    setLoading(true);

    try {
      const finalProgram =
        program === "Others" ? customProgram.trim() : program;

      const response = await fetch("http://localhost:5000/api/logs", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          student_id: studentId.trim(),
          full_name: fullName.trim(),
          program: finalProgram,
          block_year: blockYear.trim(),
          booth_id: Number(boothId),
        }),
      });

      const data = await response.json();

      // ========================================
      // DUPLICATE / OTHER ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      // ========================================
      // SUCCESS
      // ========================================

      setSuccess("Student registered successfully!");

      // Clear form
      setStudentId("");
      setFullName("");
      setProgram("");
      setCustomProgram("");
      setBlockYear("");
      setBoothId("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register Student</h2>

      <p className="form-description">
        Enter the student's information and select the booth they visited.
      </p>

      {/* SUCCESS */}

      {success && <div className="success-message">{success}</div>}

      {/* ERROR */}

      {error && <div className="form-error">{error}</div>}

      {/* STUDENT ID */}

      <div className="form-group">
        <label>Student ID</label>

        <input
          type="text"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          placeholder="Enter student ID (e.g., 26-0001)"
        />
      </div>

      {/* FULL NAME */}

      <div className="form-group">
        <label>Full Name</label>

        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Enter full name"
        />
      </div>

      {/* PROGRAM */}

      <div className="form-group">
        <label>Program</label>

        <select
          value={program}
          onChange={(event) => {
            setProgram(event.target.value);

            if (event.target.value !== "Others") {
              setCustomProgram("");
            }
          }}
        >
          <option value="">Select Program</option>
          <option value="BSIT">
            Bachelor of Science in Information Technology
          </option>
          <option value="BSCS">Bachelor of Science in Criminology</option>
          <option value="BSIS">
            Bachelor of Science in Hospitality Management
          </option>
          <option value="BSEd">Bachelor of Secondary Education</option>
          <option value="BEEd">Bachelor of Elementary Education</option>
          <option value="BSBA">
            Bachelor of Science in Business Administration
          </option>
          <option value="BSE">Bachelor of Science in Tourism Management</option>
          <option value="Others">Others</option>
        </select>
      </div>

      {/* CUSTOM PROGRAM */}

      {program === "Others" && (
        <div className="form-group">
          <label>Specify Program</label>

          <input
            type="text"
            value={customProgram}
            onChange={(event) => setCustomProgram(event.target.value)}
            placeholder="Enter your program"
          />
        </div>
      )}

      {/* BLOCK AND YEAR */}

      <div className="form-group">
        <label>Year & Section</label>

        <input
          type="text"
          value={blockYear}
          onChange={(event) => setBlockYear(event.target.value)}
          placeholder="Enter year and section (e.g., 3-Python)"
        />
      </div>

      {/* BOOTH */}

      <div className="form-group">
        <label>Select Booth</label>

        <select
          value={boothId}
          onChange={(event) => setBoothId(event.target.value)}
          disabled={loadingBooths}
        >
          <option value="">
            {loadingBooths ? "Loading booths..." : "Select Booth"}
          </option>

          {booths.map((booth) => (
            <option key={booth.id} value={booth.id}>
              {booth.booth_name}
            </option>
          ))}
        </select>
      </div>

      {/* BUTTON */}

      <button
        type="submit"
        className="primary-btn register-btn"
        disabled={loading || loadingBooths}
      >
        {loading ? "Registering..." : "Register Student"}
      </button>
    </form>
  );
}

export default RegisterForm;
