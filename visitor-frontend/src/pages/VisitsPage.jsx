import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/api";
import Header from "../components/Header";


export default function VisitsPage() {
  const { user } = useAuth();

  const [visits, setVisits] = useState([]);
  const [guests, setGuests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [cards, setCards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState("status");
  const [sortDirection, setSortDirection] = useState("asc");

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
  const handleSort = (field) => {
  if (sortField === field) {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortField(field);
    setSortDirection("asc");
  }
};

  const sortedVisits = [...visits].sort((a, b) => {
  let aValue = a[sortField];
  let bValue = b[sortField];

  if (aValue === null || aValue === undefined) aValue = "";
  if (bValue === null || bValue === undefined) bValue = "";

  if (typeof aValue === "string") aValue = aValue.toLowerCase();
  if (typeof bValue === "string") bValue = bValue.toLowerCase();

  if (aValue < bValue) {
    return sortDirection === "asc" ? -1 : 1;
  }

  if (aValue > bValue) {
    return sortDirection === "asc" ? 1 : -1;
  }

  return 0;
});

  return (
    <div style={styles.page}>
      <Header title="Külastused" />

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
        <div style={styles.tableWrapper}>
          <table className="data-table" style={styles.table}>
            <thead>
              <tr>
                <th onClick={() => handleSort("id")} style={styles.sortableHeader}>
                ID {sortField === "id" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>                
                <th onClick={() => handleSort("guest_name")} style={styles.sortableHeader}>
                  Külaline {sortField === "guest_name" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("employee_name")} style={styles.sortableHeader}>
                  Registreeris {sortField === "employee_name" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("card_number")} style={styles.sortableHeader}>
                  Kaart {sortField === "card_number" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("department_name")} style={styles.sortableHeader}>
                  Osakond {sortField === "department_name" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("purpose")} style={styles.sortableHeader}>
                  Eesmärk {sortField === "purpose" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("arrival_time")} style={styles.sortableHeader}>
                  Saabumine {sortField === "arrival_time" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("leaving_time")} style={styles.sortableHeader}>
                  Lahkumine {sortField === "leaving_time" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th onClick={() => handleSort("status")} style={styles.sortableHeader}>
                  Staatus {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </th>
                <th>Tegevus</th>
              </tr>
            </thead>

            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan="10">Külastusi ei ole</td>
                </tr>
              ) : (
                sortedVisits.map((visit) => (
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
                      <div style={styles.actions}>
                        {visit.status === "active" && (
                          <button
                            onClick={() => handleFinish(visit.id)}
                            style={styles.actionBtn}
                          >
                            Lõpeta
                          </button>
                        )}

                        {user?.role === "administraator" && (
                          <button
                            onClick={() => handleDelete(visit.id)}
                            style={styles.deleteBtn}
                          >
                            Kustuta
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
  },
  actions: {
    display: "flex",
    gap: "0.4rem",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtn: {
    padding: "0.4rem 0.6rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  deleteBtn: {
    padding: "0.4rem 0.6rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  error: {
    color: "red",
  },
  sortableHeader: {
  cursor: "pointer",
  userSelect: "none",
  },
};