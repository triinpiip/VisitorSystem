import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/api";

export default function CardsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [cards, setCards] = useState([]);
  const [guests, setGuests] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [cardsData, guestsData] = await Promise.all([
        apiFetch("/cards"),
        apiFetch("/guests"),
      ]);

      setCards(cardsData);
      setGuests(guestsData);

      const initialDrafts = {};
      cardsData.forEach((card) => {
        initialDrafts[card.id] = {
          guest_id: card.guest_id || "",
          purpose: "",
        };
      });

      setDrafts(initialDrafts);
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

  const updateDraft = (cardId, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [cardId]: {
        ...(prev[cardId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSave = async (cardId) => {
    const draft = drafts[cardId] || {};
    const guestId = draft.guest_id;

    try {
      if (!guestId) {
        await apiFetch(`/cards/${cardId}/free`, {
          method: "PUT",
        });
      } else {
        await apiFetch(`/cards/${cardId}/assign-guest`, {
          method: "PUT",
          body: JSON.stringify({
            guest_id: Number(guestId),
            purpose: draft.purpose || "Uksekaart",
          }),
        });
      }

      await loadData();
    } catch (err) {
      alert(err.message || "Kaardi salvestamine ebaõnnestus");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div>
          <h1>Uksekaartide haldus</h1>
          <p>Siin saab administraator määrata uksekaardi külalisele.</p>
        </div>

        <div style={styles.navButtons}>
          <button onClick={() => navigate("/guests")} style={styles.navBtn}>
            Külalised
          </button>

          <button onClick={() => navigate("/visits")} style={styles.navBtn}>
            Külastused
          </button>

          <button onClick={() => navigate("/employee")} style={styles.navBtn}>
            Minu vaade
          </button>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logi välja
          </button>
        </div>
      </div>

      {loading && <p>Laen andmeid...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Kaardi nr</th>
              <th>Staatus</th>
              <th>Määratud külaline</th>
              <th>Muuda külalist</th>
              <th>Eesmärk</th>
              <th>Tegevus</th>
            </tr>
          </thead>

          <tbody>
            {cards.map((card) => (
              <tr key={card.id}>
                <td>{card.id}</td>
                <td>{card.card_number}</td>

                <td>
                  <span
                    style={{
                      ...styles.badge,
                      background:
                        card.status === "valjastatud"
                          ? "#dbeafe"
                          : card.status === "blokeeritud"
                          ? "#fee2e2"
                          : "#dcfce7",
                    }}
                  >
                    {card.status}
                  </span>
                </td>

                <td>{card.guest_name || "-"}</td>

                <td>
                  <select
                    value={drafts[card.id]?.guest_id || ""}
                    onChange={(e) =>
                      updateDraft(card.id, "guest_id", e.target.value)
                    }
                    style={styles.select}
                    disabled={card.status === "blokeeritud"}
                  >
                    <option value="">Vaba / külaliseta</option>

                    {guests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.nimi ||
                          `${guest.first_name || ""} ${guest.last_name || ""}`}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    value={drafts[card.id]?.purpose || ""}
                    onChange={(e) =>
                      updateDraft(card.id, "purpose", e.target.value)
                    }
                    placeholder="Eesmärk"
                    style={styles.input}
                    disabled={card.status === "blokeeritud"}
                  />
                </td>

                <td>
                  <button
                    onClick={() => handleSave(card.id)}
                    style={styles.saveBtn}
                    disabled={card.status === "blokeeritud"}
                  >
                    Salvesta
                  </button>
                </td>
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
  navButtons: {
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  select: {
    padding: "0.55rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  input: {
    padding: "0.55rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  saveBtn: {
    padding: "0.55rem 0.8rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  badge: {
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.85rem",
  },
  error: {
    color: "red",
  },
};