import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";
import Header from "../components/Header";

export default function EmployeePage() {

  const [visits, setVisits] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [visitsData, cardsData] = await Promise.all([
        apiFetch("/visits"),
        apiFetch("/cards"),
      ]);

      setVisits(visitsData);
      setCards(cardsData);
    } catch (err) {
      setError(err.message || "Andmete laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGuestName = (visit) => {
    if (visit.guest_name) return visit.guest_name;

    return [visit.guest_first_name, visit.guest_last_name]
      .filter(Boolean)
      .join(" ");
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
        <button onClick={loadData} style={styles.navBtn}>
          Proovi uuesti
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header title="Minu vaade" />

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
                    <td>{getGuestName(visit) || "-"}</td>
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
                    <td>{getGuestName(visit) || "-"}</td>
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
    </div>
  );
}

const styles = {
  page: {
    padding: "2rem",
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
  error: {
    color: "red",
    marginBottom: "1rem",
  },
};
