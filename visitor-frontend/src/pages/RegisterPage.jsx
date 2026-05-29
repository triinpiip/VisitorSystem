import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "kasutaja",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordRules = useMemo(
    () => ({
      length: form.password.length >= 8,
      uppercase: /[A-Z]/.test(form.password),
      lowercase: /[a-z]/.test(form.password),
      number: /\d/.test(form.password),
    }),
    [form.password]
  );

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const showPasswordMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleChange = (e) => {
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (!form.username.trim()) return "Kasutajanimi on kohustuslik";
    if (!form.password) return "Parool on kohustuslik";
    if (!form.confirmPassword) return "Parooli kordus on kohustuslik";
    if (!isPasswordValid) return "Parool ei vasta nõuetele";
    if (form.password !== form.confirmPassword) return "Paroolid ei ühti";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          role: form.role,
        }),
      });

      setSuccess("Kasutaja loodud. Suunan sisselogimisele...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.message || "Registreerimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.header}>
          <div style={styles.logo}>VISITOR SYSTEM</div>
          <h1 style={styles.title}>Registreeri</h1>
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
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </label>

        {form.password.length > 0 && (
          <div style={styles.rulesBox}>
            <PasswordRule valid={passwordRules.length}>Vähemalt 8 märki</PasswordRule>
            <PasswordRule valid={passwordRules.uppercase}>Suur täht</PasswordRule>
            <PasswordRule valid={passwordRules.lowercase}>Väike täht</PasswordRule>
            <PasswordRule valid={passwordRules.number}>Number</PasswordRule>
          </div>
        )}

        <label style={styles.label}>
          Korda parooli
          <input
            style={{
              ...styles.input,
              borderColor: showPasswordMismatch ? "#dc2626" : "#d1d5db",
            }}
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            placeholder="••••••••"
            required
          />
        </label>

        {showPasswordMismatch && (
          <p style={styles.fieldError}>Paroolid ei ühti</p>
        )}

        {passwordsMatch && isPasswordValid && (
          <p style={styles.fieldSuccess}>Paroolid sobivad</p>
        )}

        <label style={styles.label}>
          Roll
          <select
            style={styles.input}
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="kasutaja">Kasutaja</option>
            <option value="administraator">Administraator</option>
          </select>
        </label>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <button style={styles.button} type="submit" disabled={loading}>
          {loading ? "Loon kasutajat..." : "Registreeri"}
        </button>

        <p style={styles.footer}>
          Konto olemas? <Link to="/login">Logi sisse</Link>
        </p>
      </form>
    </main>
  );
}

function PasswordRule({ valid, children }) {
  return (
    <p style={valid ? styles.ruleValid : styles.ruleInvalid}>
      {valid ? "✓" : "•"} {children}
    </p>
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
    background: "#fff",
  },

  rulesBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "0.8rem",
    display: "grid",
    gap: "0.3rem",
  },

  ruleValid: {
    margin: 0,
    color: "#15803d",
    fontSize: "0.9rem",
  },

  ruleInvalid: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.9rem",
  },

  fieldError: {
    margin: "-0.5rem 0 0",
    color: "#dc2626",
    fontSize: "0.9rem",
  },

  fieldSuccess: {
    margin: "-0.5rem 0 0",
    color: "#15803d",
    fontSize: "0.9rem",
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
    cursor: "pointer",
  },

  error: {
    margin: 0,
    color: "#dc2626",
    background: "#fef2f2",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid #fecaca",
  },

  success: {
    margin: 0,
    color: "#15803d",
    background: "#f0fdf4",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
  },

  footer: {
    textAlign: "center",
    color: "#6b7280",
    margin: 0,
  },
};