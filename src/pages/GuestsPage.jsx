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
    document_no: "",
    phone: "",
    email: "",
  });

  const loadGuests = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/guests");
      setGuests(data);
      setError("");
    } catch (err) {
      setError(err.message || "Guestide laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
        document_no: "",
        phone: "",
        email: "",
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
          <h1>Guests</h1>
          <p>
            Sisselogitud: <strong>{user?.username}</strong> ({user?.role})
          </p>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logi välja
        </button>
      </div>

      <form onSubmit={handleCreate} style={styles.form}>
        <input
          name="first_name"
          placeholder="Eesnimi"
          value={form.first_name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="last_name"
          placeholder="Perenimi"
          value={form.last_name}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="personal_id"
          placeholder="Isikukood"
          value={form.personal_id}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="document_no"
          placeholder="Dokumendi nr"
          value={form.document_no}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="phone"
          placeholder="Telefon"
          value={form.phone}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="email"
          placeholder="E-post"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
        />

        <button type="submit" style={styles.addBtn}>
          Lisa külaline
        </button>
      </form>

      {loading && <p>Laen andmeid...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Eesnimi</th>
              <th>Perenimi</th>
              <th>Isikukood</th>
              <th>Telefon</th>
              <th>E-post</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td>{guest.id}</td>
                <td>{guest.first_name}</td>
                <td>{guest.last_name}</td>
                <td>{guest.personal_id || "-"}</td>
                <td>{guest.phone || "-"}</td>
                <td>{guest.email || "-"}</td>
              </tr>
            ))}
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
};