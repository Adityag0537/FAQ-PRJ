import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link to="/" className="brand-link">
          <span className="brand-mark">S</span>
          <div>
            <strong>Samagama FAQ</strong>
            <span>Vicharanashala Knowledge Base</span>
          </div>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end className="nav-link">
            FAQ
          </NavLink>
          <NavLink to="/questions" className="nav-link">
            Community
          </NavLink>

          {user ? (
            <>
              <NavLink to="/ask" className="nav-link nav-link-cta">
                Ask Question
              </NavLink>
              <Link to="/my-activity" className="user-chip" title="My Activity">
                <span className="user-avatar">{initials}</span>
                <span className="user-name">{user.name}</span>
              </Link>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn btn-primary btn-sm nav-login">
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
