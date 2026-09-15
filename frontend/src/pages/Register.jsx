import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

function Register() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Go to Dashboard after successful registration
    navigate("/");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Register</h1>
          <p>Record a student's visit to a Foundation Day booth.</p>
        </div>
      </div>

      <div className="register-container">
        <RegisterForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}

export default Register;
