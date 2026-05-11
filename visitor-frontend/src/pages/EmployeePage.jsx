import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

export default function EmployeePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [visits, setVisits] = useState([]);
  const [cards, setCards] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "administraator";

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    department_id: "",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const requests = [
        apiFetch("/me"),
        apiFetch("/my-visits"),
        apiFetch("/departments"),
      ];

      if (isAdmin) {
        requests.push(apiFetch("/visits"));
        requests.push(apiFetch("/cards"));
      }

      const results = await Promise.all(requests);

      const profileData = results[0];
      const myVisitsData = results[1];
      const departmentsData = results[2];

      setProfile(profileData);
      setDepartments(departmentsData);

      if (isAdmin) {
        setVisits(results[3]);
        setCards(results[4]);
      } else {
        setVisits(myVisitsData);
      }

      setForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: profileData.email || "",
        department_id: profileData.department_id || "",
      });

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

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/me", {
        method: "PUT",
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          department_id: form.department_id || null,
        }),
      });

      alert("Profiil uuendatud");
      loadData();
    } catch (err) {
      alert(err.message || "Salvestamine ebaõnnestus");
    }
  };

  const latestLeftGuests = visits
    .filter((visit) => visit.leaving_time)
    .sort((a, b) => new Date(b.leaving_time) - new Date(a.leaving_time))
    .slice(0, 5);

  const latestAssignedCards = visits
    .filter((visit) => !visit.leaving_time && visit.card_number)
    .sort((a, b) => new Date(b.arrival_time) - new Date(a.arrival_time))
    .slice(0, 5);

  const freeCards = cards.filter((card) => card.status === "vaba");

  if (loading) {
    return <div style={styles.page}>Laen andmeid...</div>;
  }

  if (error) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <h1>{isAdmin ? "Admin ülevaade" : "Minu vaade"}</h1>
          <p>
            Sisselogitud: <strong>{user?.username}</strong> ({user?.role})
          </p>
        </div>

        <div style={styles.buttons}>
          {isAdmin && (
            <>
              <button onClick={() => navigate("/guests")} style={styles.navBtn}>
                Külalised
              </button>

              <button onClick={() => navigate("/visits")} style={styles.navBtn}>
                Külastused
              </button>

              <button onClick={() => navigate("/cards")} style={styles.navBtn}>
                Kaardid
              </button>
            </>
          )}

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logi välja
          </button>
        </div>
      </div>

      {isAdmin ? (
        <div style={styles.grid}>
          <div style={styles.section}>
            <h2>Viimati lahkunud külalised</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Külaline</th>
                  <th>Kaart</th>
                  <th>Lahkumine</th>
                </tr>
              </thead>

              <tbody>
                {latestLeftGuests.length === 0 ? (
                  <tr>
                    <td colSpan="3">Andmed puuduvad</td>
                  </tr>
                ) : (
                  latestLeftGuests.map((visit) => (
                    <tr key={visit.id}>
                      <td>
                        {visit.guest_name ||
                          `${visit.guest_first_name || ""} ${
                            visit.guest_last_name || ""
                          }`}
                      </td>
                      <td>{visit.card_number || "-"}</td>
                      <td>{new Date(visit.leaving_time).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h2>Viimati kaardi saanud külalised</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Külaline</th>
                  <th>Kaart</th>
                  <th>Saabumine</th>
                </tr>
              </thead>

              <tbody>
                {latestAssignedCards.length === 0 ? (
                  <tr>
                    <td colSpan="3">Andmed puuduvad</td>
                  </tr>
                ) : (
                  latestAssignedCards.map((visit) => (
                    <tr key={visit.id}>
                      <td>
                        {visit.guest_name ||
                          `${visit.guest_first_name || ""} ${
                            visit.guest_last_name || ""
                          }`}
                      </td>
                      <td>{visit.card_number || "-"}</td>
                      <td>{new Date(visit.arrival_time).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={styles.section}>
            <h2>Vabad kaardid</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kaardi nr</th>
                  <th>Nimi</th>
                </tr>
              </thead>

              <tbody>
                {freeCards.length === 0 ? (
                  <tr>
                    <td colSpan="3">Vabu kaarte ei ole</td>
                  </tr>
                ) : (
                  freeCards.map((card) => (
                    <tr key={card.id}>
                      <td>{card.id}</td>
                      <td>{card.card_number}</td>
                      <td>{card.logical_name || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.section}>
            <h2>Minu profiil</h2>

            <form onSubmit={handleSave} style={styles.form}>
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
                name="email"
                placeholder="E-post"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />

              <select
                name="department_id"
                value={form.department_id}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">Vali osakond</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>

              <button type="submit" style={styles.saveBtn}>
                Salvesta profiil
              </button>
            </form>
          </div>

          <div style={styles.section}>
            <h2>Minu juurde tulnud külastused</h2>

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Külaline</th>
                  <th>Eesmärk</th>
                  <th>Saabumine</th>
                  <th>Lahkumine</th>
                  <th>Staatus</th>
                </tr>
              </thead>

              <tbody>
                {visits.length === 0 ? (
                  <tr>
                    <td colSpan="6">Külastusi ei ole</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
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
  buttons: {
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1rem",
  },
  section: {
    marginBottom: "2rem",
    background: "#f7f7f7",
    padding: "1rem",
    borderRadius: "12px",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "0.75rem",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  saveBtn: {
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