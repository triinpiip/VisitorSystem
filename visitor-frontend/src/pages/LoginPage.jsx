import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setError("");

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("Sisesta kasutajanimi ja parool");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Vale kasutajanimi või parool");
      }

      login(data.token, data.user);
      navigate("/employee");
    } catch (err) {
      setError(err.message || "Sisselogimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <div style={styles.logo}>VISITOR SYSTEM</div>
          <h1 style={styles.title}>Logi sisse</h1>
        </div>

        <label style={styles.label}>
          Kasutajanimi
          <input
            style={styles.input}
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            placeholder="Kasutajanimi"
            required
          />
        </label>

        <label style={styles.label}>
          Parool
          <input
            style={styles.input}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Sisenen..." : "Logi sisse"}
        </button>

        <p style={styles.footer}>
          Kontot pole? <Link to="/register">Registreeri kasutaja</Link>
        </p>
      </form>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f7fb",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "24px",
    padding: "2rem",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },

  logo: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#2563eb",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  title: {
    margin: 0,
    fontSize: "2.2rem",
    fontWeight: 700,
    color: "#111827",
  },

  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.45rem",
    fontWeight: 600,
    color: "#374151",
  },

  input: {
    padding: "0.95rem 1rem",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    fontSize: "1rem",
    outline: "none",
  },

  button: {
    marginTop: "0.5rem",
    padding: "1rem",
    border: "none",
    borderRadius: "14px",
    background: "#2563eb",
    color: "white",
    fontWeight: 700,
    fontSize: "1rem",
  },

  error: {
<<<<<<< HEAD
=======
    margin: 0,
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid #fecaca",
  },

  footer: {
    textAlign: "center",
    color: "#6b7280",
>>>>>>> a18b85492f70f31605b3cd48f75fd1b497ee4e8e
    margin: 0,
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid #fecaca",
  },
<<<<<<< HEAD

  footer: {
    textAlign: "center",
    color: "#6b7280",
    margin: 0,
  },
};
=======
};
>>>>>>> a18b85492f70f31605b3cd48f75fd1b497ee4e8e
