import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <NavLink to="/" className="logo">
          Foundation Day
        </NavLink>

        <div className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/booths">Booths</NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/about">About</NavLink>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
