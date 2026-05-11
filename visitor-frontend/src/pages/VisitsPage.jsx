import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function VisitsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);
  const [guests, setGuests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cards, setCards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    guest_id: "",
    employee_id: "",
    access_card_id: "",
    department_id: "",
    purpose: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [visitsData, guestsData, employeesData, cardsData, departmentsData] =
        await Promise.all([
          apiFetch("/visits"),
          apiFetch("/guests"),
          apiFetch("/employees"),
          apiFetch("/cards"),
          apiFetch("/departments"),
        ]);

      setVisits(visitsData);
      setGuests(guestsData);
      setEmployees(employeesData);
      setCards(cardsData);
      setDepartments(departmentsData);
      setError("");
    } catch (err) {
      setError(err.message || "Andmete laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
      await apiFetch("/visits", {
        method: "POST",
        body: JSON.stringify({
          guest_id: Number(form.guest_id),
          employee_id: Number(form.employee_id),
          access_card_id: Number(form.access_card_id),
          department_id: Number(form.department_id),
          purpose: form.purpose,
        }),
      });

      setForm({
        guest_id: "",
        employee_id: "",
        access_card_id: "",
        department_id: "",
        purpose: "",
      });

      loadData();
    } catch (err) {
      alert(err.message || "Külastuse lisamine ebaõnnestus");
    }
  };

  const handleFinish = async (id) => {
    try {
      await apiFetch(`/visits/${id}/finish`, {
        method: "PUT",
      });

      loadData();
    } catch (err) {
      alert(err.message || "Külastuse lõpetamine ebaõnnestus");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Kas kustutada see külastus?")) return;

    try {
      await apiFetch(`/visits/${id}`, {
        method: "DELETE",
      });

      loadData();
    } catch (err) {
      alert(err.message || "Kustutamine ebaõnnestus");
    }
  };

  const freeCards = cards.filter((card) => card.status === "vaba");

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <h1>Külastused</h1>
          <p>
            Sisselogitud: <strong>{user?.username}</strong> ({user?.role})
          </p>
        </div>

        <div style={styles.topButtons}>
          <button onClick={() => navigate("/guests")} style={styles.navBtn}>
            Külalised
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
        <select
          name="guest_id"
          value={form.guest_id}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Vali külaline</option>
          {guests.map((guest) => (
            <option key={guest.id} value={guest.id}>
              {guest.nimi || `${guest.first_name || ""} ${guest.last_name || ""}`}
            </option>
          ))}
        </select>

        <select
          name="employee_id"
          value={form.employee_id}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Vali registreerija</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.username ||
                `${employee.first_name || ""} ${employee.last_name || ""}`}
            </option>
          ))}
        </select>

        <select
          name="access_card_id"
          value={form.access_card_id}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Vali vaba kaart</option>
          {freeCards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.card_number}
            </option>
          ))}
        </select>

        <select
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          style={styles.input}
          required
        >
          <option value="">Vali osakond</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>

        <input
          name="purpose"
          placeholder="Külastuse eesmärk"
          value={form.purpose}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.addBtn}>
          Lisa külastus
        </button>
      </form>

      {loading && <p>Laen andmeid...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Külaline</th>
              <th>Registreeris</th>
              <th>Kaart</th>
              <th>Osakond</th>
              <th>Eesmärk</th>
              <th>Saabumine</th>
              <th>Lahkumine</th>
              <th>Staatus</th>
              <th>Tegevus</th>
            </tr>
          </thead>

          <tbody>
            {visits.length === 0 ? (
              <tr>
                <td colSpan="10">Külastusi ei ole</td>
              </tr>
            ) : (
              visits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.id}</td>

                  <td>
                    {visit.guest_name ||
                      `${visit.guest_first_name || ""} ${
                        visit.guest_last_name || ""
                      }`}
                  </td>

                  <td>
                    {visit.employee_first_name ||
                      `${visit.employee_first_name || ""} ${
                        visit.employee_last_name || ""
                      }`}
                  </td>

                  <td>{visit.card_number || "-"}</td>
                  <td>{visit.department_name || "-"}</td>
                  <td>{visit.purpose || "-"}</td>

                  <td>
                    {visit.arrival_time
                      ? new Date(visit.arrival_time).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {visit.leaving_time
                      ? new Date(visit.leaving_time).toLocaleString()
                      : "-"}
                  </td>

                  <td>{visit.status}</td>

                  <td>
                    {visit.status === "active" && (
                      <button
                        onClick={() => handleFinish(visit.id)}
                        style={styles.actionBtn}
                      >
                        Lõpeta
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(visit.id)}
                      style={styles.deleteBtn}
                    >
                      Kustuta
                    </button>
                  </td>
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
  topButtons: {
    display: "flex",
    gap: "0.75rem",
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
  actionBtn: {
    padding: "0.4rem 0.6rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "0.4rem",
  },
  deleteBtn: {
    padding: "0.4rem 0.6rem",
    border: "none",
    borderRadius: "6px",
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