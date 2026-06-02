import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import Header from "../components/Header";

export default function GuestsPage() {

  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    personal_id: "",
    company: "",
  });
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

  const validateForm = () => {
    const errors = {};

    if (!form.first_name.trim()) {
      errors.first_name = "Eesnimi on kohustuslik";
    }

    if (!form.last_name.trim()) {
      errors.last_name = "Perenimi on kohustuslik";
    }

    if (form.personal_id.trim() && !/^\d{11}$/.test(form.personal_id.trim())) {
      errors.personal_id = "Isikukood peab koosnema 11 numbrist";
    }

    if (form.company.trim().length > 100) {
      errors.company = "Ettevõtte nimi võib olla kuni 100 märki";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitError("");

      await apiFetch("/guests", {
        method: "POST",
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          personal_id: form.personal_id.trim() || null,
          company: form.company.trim() || null,
        }),
      });

      setForm({
        first_name: "",
        last_name: "",
        personal_id: "",
        company: "",
      });

      setFormErrors({});
      await loadGuests();
    } catch (err) {
      setSubmitError(err.message || "Külalise lisamine ebaõnnestus");
    }
  };

  return (
    <div style={styles.page}>
      <Header title="Külalised" />

      <form onSubmit={handleCreate} style={styles.form} noValidate>
        <div style={styles.field}>
          <input
            name="first_name"
            placeholder="Eesnimi"
            value={form.first_name}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(formErrors.first_name ? styles.inputError : {}),
            }}
          />
          {formErrors.first_name && (
            <p style={styles.fieldError}>{formErrors.first_name}</p>
          )}
        </div>

        <div style={styles.field}>
          <input
            name="last_name"
            placeholder="Perenimi"
            value={form.last_name}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(formErrors.last_name ? styles.inputError : {}),
            }}
          />
          {formErrors.last_name && (
            <p style={styles.fieldError}>{formErrors.last_name}</p>
          )}
        </div>

        <div style={styles.field}>
          <input
            name="personal_id"
            placeholder="Isikukood"
            value={form.personal_id}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(formErrors.personal_id ? styles.inputError : {}),
            }}
          />
          {formErrors.personal_id && (
            <p style={styles.fieldError}>{formErrors.personal_id}</p>
          )}
        </div>

        <div style={styles.field}>
          <input
            name="company"
            placeholder="Ettevõte"
            value={form.company}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(formErrors.company ? styles.inputError : {}),
            }}
          />
          {formErrors.company && (
            <p style={styles.fieldError}>{formErrors.company}</p>
          )}
        </div>

        <button type="submit" style={styles.addBtn}>
          Lisa külaline
        </button>

        {submitError && (
          <div style={styles.formAlert}>
            {submitError}
          </div>
        )}
      </form>

      {loading && <p>Laen andmeid...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <table className="data-table" style={styles.table}>
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
  field: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  fieldError: {
    color: "#dc2626",
    fontSize: "0.85rem",
    margin: "0.35rem 0 0",
  },
  formAlert: {
    gridColumn: "1 / -1",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    padding: "0.75rem",
    borderRadius: "8px",
  },
  addBtn: {
    padding: "0.8rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  error: {
    color: "red",
  },
};