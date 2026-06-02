import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header({ title }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div style={styles.wrapper}>
      <div>
        <h1>{title}</h1>

        <p>
          Sisselogitud: <strong>{user?.username}</strong> ({user?.role})
        </p>
      </div>

      <div style={styles.buttons}>
        <button
          onClick={() => navigate("/employee")}
          style={{
            ...styles.button,
            ...(isActive("/employee") ? styles.activeButton : {}),
          }}
        >
          Minu vaade
        </button>

        <button
          onClick={() => navigate("/guests")}
          style={{
            ...styles.button,
            ...(isActive("/guests") ? styles.activeButton : {}),
          }}
        >
          Külalised
        </button>

        <button
          onClick={() => navigate("/visits")}
          style={{
            ...styles.button,
            ...(isActive("/visits") ? styles.activeButton : {}),
          }}
        >
          Külastused
        </button>

        {user?.role === "administraator" && (
          <button
            onClick={() => navigate("/cards")}
            style={{
              ...styles.button,
              ...(isActive("/cards") ? styles.activeButton : {}),
            }}
          >
            Kaardid
          </button>
        )}

        <button onClick={handleLogout} style={styles.logout}>
          Logi välja
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },

  buttons: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },

  button: {
    padding: "0.8rem 1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.2s",
    backgroundColor: "#e5e5e5",
  },

  activeButton: {
    backgroundColor: "#6d4c7d",
    color: "white",
    fontWeight: "bold",
  },

  logout: {
    padding: "0.8rem 1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "#e5e5e5",
  },
};