import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function GuestsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    personal_id: "",
    company: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/guests");
      setGuests(data);
      setError("");
    } catch (err) {
      setError(err.message || "Külaliste laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/guests", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        first_name: "",
        last_name: "",
        personal_id: "",
        company: "",
      });

      loadGuests();
    } catch (err) {
      alert(err.message || "Külalise lisamine ebaõnnestus");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <h1>Külalised</h1>
          <p>
            Sisselogitud: <strong>{user?.username}</strong> ({user?.role})
          </p>
        </div>

        <div style={styles.navButtons}>
          <button onClick={() => navigate("/visits")} style={styles.navBtn}>
            Külastused
          </button>

          {user?.role === "administraator" && (
            <button onClick={() => navigate("/cards")} style={styles.navBtn}>
              Kaardid
            </button>
          )}

          <button onClick={() => navigate("/employee")} style={styles.navBtn}>
            Minu vaade
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logi välja
          </button>
        </div>
      </div>

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          name="first_name"
          placeholder="Eesnimi"
          value={form.first_name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          name="last_name"
          placeholder="Perenimi"
          value={form.last_name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          name="personal_id"
          placeholder="Isikukood"
          value={form.personal_id}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="company"
          placeholder="Ettevõte"
          value={form.company}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.addBtn}>
          Lisa külaline
        </button>
      </form>

      {loading && <p>Laen andmeid...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Eesnimi</th>
              <th>Perenimi</th>
              <th>Isikukood</th>
              <th>Ettevõte</th>
            </tr>
          </thead>

          <tbody>
            {guests.length === 0 ? (
              <tr>
                <td colSpan="5">Külalisi ei ole</td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.id}</td>
                  <td>{guest.first_name}</td>
                  <td>{guest.last_name}</td>
                  <td>{guest.personal_id || "-"}</td>
                  <td>{guest.company || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem",
    fontFamily: "Arial, sans-serif",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
  },
  navButtons: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
  },
  navBtn: {
    padding: "0.8rem 1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "0.8rem 1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem",
    marginBottom: "2rem",
    background: "#f7f7f7",
    padding: "1rem",
    borderRadius: "12px",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  addBtn: {
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  error: {
    color: "red",
  },
};