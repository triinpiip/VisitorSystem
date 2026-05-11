import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


import createAuthRouter from "./routes/authRoutes.js";
import { authMiddleware, roleMiddleware } from "./middleware/authMiddleware.js";

const { PrismaClient } = pkg;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API töötab");
});

app.use("/api/auth", createAuthRouter(prisma));

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get("/api/me", authMiddleware, async (req, res) => {
  try {
    const users = await prisma.$queryRaw`
      SELECT
        k.kasutaja_id AS id,
        k.kasutaja_id AS employee_id,
        k.kasutajanimi AS username,
        k.kasutajanimi AS first_name,
        '' AS last_name,
        k.email,
        k.roll_id,
        r.nimetus AS role,
        r.nimetus AS role_name
      FROM kasutaja k
      JOIN roll r ON k.roll_id = r.roll_id
      WHERE k.kasutaja_id = ${Number(req.user.id)}
      LIMIT 1
    `;

    if (!users.length) {
      return res.status(404).json({ message: "Kasutajat ei leitud" });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Profiili laadimine ebaõnnestus", error: error.message });
  }
});

app.get("/api/admin-only", authMiddleware, roleMiddleware("administraator"), (req, res) => {
  res.json({ message: "Tere, administraator!", user: req.user });
});

/* GUESTS */

app.get("/api/guests", authMiddleware, async (req, res) => {
  try {
    const guests = await prisma.$queryRaw`
      SELECT
        kulaline_id AS id,
        nimi,
        split_part(nimi, ' ', 1) AS first_name,
        CASE
          WHEN position(' ' IN nimi) > 0
          THEN substring(nimi FROM position(' ' IN nimi) + 1)
          ELSE ''
        END AS last_name,
        isikukood AS personal_id,
        NULL AS document_no,
        NULL AS phone,
        NULL AS email,
        ettevote AS company
      FROM kulaline
      ORDER BY kulaline_id ASC
    `;

    res.json(guests);
  } catch (error) {
    console.error("Guests error:", error);
    res.status(500).json({ message: "Viga guestide laadimisel", error: error.message });
  }
});

app.post("/api/guests", authMiddleware, async (req, res) => {
  try {
    const { first_name, last_name, personal_id, company } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ message: "Eesnimi ja perenimi on kohustuslikud" });
    }

    const nimi = `${first_name} ${last_name}`;

    const guest = await prisma.$queryRaw`
      INSERT INTO kulaline (nimi, isikukood, ettevote)
      VALUES (${nimi}, ${personal_id ?? null}, ${company ?? null})
      RETURNING
        kulaline_id AS id,
        nimi,
        split_part(nimi, ' ', 1) AS first_name,
        CASE
          WHEN position(' ' IN nimi) > 0
          THEN substring(nimi FROM position(' ' IN nimi) + 1)
          ELSE ''
        END AS last_name,
        isikukood AS personal_id,
        ettevote AS company
    `;

    res.status(201).json(guest[0]);
  } catch (error) {
    console.error("Create guest error:", error);
    res.status(500).json({ message: "Külalise lisamine ebaõnnestus", error: error.message });
  }
});

app.delete("/api/guests/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.$queryRaw`
      DELETE FROM kulaline
      WHERE kulaline_id = ${Number(req.params.id)}
    `;

    res.json({ message: "Külaline kustutatud" });
  } catch (error) {
    console.error("Delete guest error:", error);
    res.status(500).json({ message: "Külalise kustutamine ebaõnnestus", error: error.message });
  }
});

/* EMPLOYEES = KASUTAJA */

app.get("/api/employees", authMiddleware, async (req, res) => {
  try {
    const employees = await prisma.$queryRaw`
      SELECT
        k.kasutaja_id AS id,
        k.kasutaja_id AS employee_id,
        k.kasutajanimi AS username,
        k.kasutajanimi AS first_name,
        '' AS last_name,
        k.email,
        k.roll_id,
        r.nimetus AS role,
        r.nimetus AS role_name
      FROM kasutaja k
      JOIN roll r ON k.roll_id = r.roll_id
      ORDER BY k.kasutaja_id ASC
    `;

    res.json(employees);
  } catch (error) {
    console.error("Employees error:", error);
    res.status(500).json({ message: "Töötajate laadimine ebaõnnestus", error: error.message });
  }
});

/* DEPARTMENTS */

app.get("/api/departments", authMiddleware, async (req, res) => {
  try {
    const departments = await prisma.$queryRaw`
      SELECT
        osakond_id AS id,
        nimetus AS name,
        hoone AS building,
        korrus AS floor
      FROM osakond
      ORDER BY osakond_id ASC
    `;

    res.json(departments);
  } catch (error) {
    console.error("Departments error:", error);
    res.status(500).json({ message: "Osakondade laadimine ebaõnnestus", error: error.message });
  }
});

/* CARDS */

app.get("/api/cards", authMiddleware, async (req, res) => {
  try {
    const cards = await prisma.$queryRaw`
      SELECT
        uk.kaart_id AS id,
        uk.kaardi_nr AS card_number,
        uk.loogiline_nimi AS logical_name,
        uk.staatus AS status,
        CASE WHEN uk.staatus = 'valjastatud' THEN g.kulaline_id ELSE NULL END AS guest_id,
        CASE WHEN uk.staatus = 'valjastatud' THEN g.nimi ELSE NULL END AS guest_name
      FROM uksekaart uk
      LEFT JOIN kulastus ku
        ON uk.kaart_id = ku.kaart_id
        AND ku.lahkumise_aeg IS NULL
      LEFT JOIN kulaline g
        ON ku.kulaline_id = g.kulaline_id
      ORDER BY uk.kaart_id ASC
    `;

    res.json(cards);
  } catch (error) {
    console.error("Cards error:", error);
    res.status(500).json({ message: "Kaartide laadimine ebaõnnestus", error: error.message });
  }
});

app.put("/api/cards/:id/assign-guest", authMiddleware, roleMiddleware("administraator"), async (req, res) => {
  try {
    const { guest_id, purpose } = req.body;
    const cardId = Number(req.params.id);

    if (!guest_id) {
      return res.status(400).json({ message: "guest_id puudub" });
    }

    // lõpeta vana aktiivne külastus (kui oli)
    await prisma.$queryRaw`
      UPDATE kulastus
      SET lahkumise_aeg = CURRENT_TIMESTAMP
      WHERE kaart_id = ${cardId}
        AND lahkumise_aeg IS NULL
    `;

    // loo uus külastus (kaart -> külaline)
    await prisma.$queryRaw`
      INSERT INTO kulastus (
        saabumise_aeg,
        lahkumise_aeg,
        markus,
        kulaline_id,
        kaart_id,
        kasutaja_id,
        osakond_id,
        eesmark
      )
      VALUES (
        CURRENT_TIMESTAMP,
        NULL,
        'Kaart määratud külalisele',
        ${Number(guest_id)},
        ${cardId},
        ${Number(req.user.id)},
        1,
        ${purpose || "Uksekaart"}
      )
    `;

    // uuenda kaardi staatus
    await prisma.$queryRaw`
      UPDATE uksekaart
      SET staatus = 'valjastatud'
      WHERE kaart_id = ${cardId}
    `;

    res.json({ message: "OK" });
  } catch (error) {
    console.error("assign-guest error:", error);
    res.status(500).json({ message: "Viga", error: error.message });
  }
});

app.put("/api/cards/:id/free", authMiddleware, roleMiddleware("administraator"), async (req, res) => {
  try {
    const cardId = Number(req.params.id);

    await prisma.$queryRaw`
      UPDATE kulastus
      SET lahkumise_aeg = CURRENT_TIMESTAMP
      WHERE kaart_id = ${cardId}
        AND lahkumise_aeg IS NULL
    `;

    const card = await prisma.$queryRaw`
      UPDATE uksekaart
      SET staatus = 'vaba'
      WHERE kaart_id = ${cardId}
      RETURNING kaart_id AS id, kaardi_nr AS card_number, loogiline_nimi AS logical_name, staatus AS status
    `;

    res.json(card[0]);
  } catch (error) {
    console.error("Free card error:", error);
    res.status(500).json({ message: "Kaardi vabastamine ebaõnnestus", error: error.message });
  }
});

/* VISITS */

app.get("/api/visits", authMiddleware, async (req, res) => {
  try {
    const visits = await prisma.$queryRaw`
      SELECT
        v.kulastus_id AS id,
        v.kulaline_id AS guest_id,
        v.kasutaja_id AS employee_id,
        v.kaart_id AS access_card_id,
        v.osakond_id AS department_id,
        v.eesmark AS purpose,
        v.markus AS note,
        v.saabumise_aeg AS arrival_time,
        v.lahkumise_aeg AS leaving_time,
        CASE
          WHEN v.lahkumise_aeg IS NULL THEN 'active'
          ELSE 'finished'
        END AS status,
        g.nimi AS guest_name,
        split_part(g.nimi, ' ', 1) AS guest_first_name,
        CASE
          WHEN position(' ' IN g.nimi) > 0
          THEN substring(g.nimi FROM position(' ' IN g.nimi) + 1)
          ELSE ''
        END AS guest_last_name,
        k.kasutajanimi AS employee_first_name,
        '' AS employee_last_name,
        o.nimetus AS department_name,
        u.kaardi_nr AS card_number
      FROM kulastus v
      JOIN kulaline g ON v.kulaline_id = g.kulaline_id
      JOIN kasutaja k ON v.kasutaja_id = k.kasutaja_id
      JOIN osakond o ON v.osakond_id = o.osakond_id
      JOIN uksekaart u ON v.kaart_id = u.kaart_id
      ORDER BY v.kulastus_id DESC
    `;

    res.json(visits);
  } catch (error) {
    console.error("Visits error:", error);
    res.status(500).json({ message: "Külastuste laadimine ebaõnnestus", error: error.message });
  }
});

app.get("/api/my-visits", authMiddleware, async (req, res) => {
  try {
    const visits = await prisma.$queryRaw`
      SELECT
        v.kulastus_id AS id,
        v.kulaline_id AS guest_id,
        v.kasutaja_id AS employee_id,
        v.kaart_id AS access_card_id,
        v.osakond_id AS department_id,
        v.eesmark AS purpose,
        v.markus AS note,
        v.saabumise_aeg AS arrival_time,
        v.lahkumise_aeg AS leaving_time,
        CASE
          WHEN v.lahkumise_aeg IS NULL THEN 'active'
          ELSE 'finished'
        END AS status,
        g.nimi AS guest_name,
        split_part(g.nimi, ' ', 1) AS guest_first_name,
        CASE
          WHEN position(' ' IN g.nimi) > 0
          THEN substring(g.nimi FROM position(' ' IN g.nimi) + 1)
          ELSE ''
        END AS guest_last_name,
        u.kaardi_nr AS card_number
      FROM kulastus v
      JOIN kulaline g ON v.kulaline_id = g.kulaline_id
      JOIN uksekaart u ON v.kaart_id = u.kaart_id
      WHERE v.kasutaja_id = ${Number(req.user.id)}
      ORDER BY v.kulastus_id DESC
    `;

    res.json(visits);
  } catch (error) {
    console.error("My visits error:", error);
    res.status(500).json({ message: "Minu külastuste laadimine ebaõnnestus", error: error.message });
  }
});

app.post("/api/visits", authMiddleware, async (req, res) => {
  try {
    const {
      guest_id,
      employee_id,
      access_card_id,
      department_id,
      purpose,
      note,
    } = req.body;

    if (!guest_id || !employee_id || !access_card_id || !department_id || !purpose) {
      return res.status(400).json({
        message: "guest_id, employee_id, access_card_id, department_id ja purpose on kohustuslikud",
      });
    }

    const visit = await prisma.$queryRaw`
      INSERT INTO kulastus (
        saabumise_aeg,
        lahkumise_aeg,
        markus,
        kulaline_id,
        kaart_id,
        kasutaja_id,
        osakond_id,
        eesmark
      )
      VALUES (
        CURRENT_TIMESTAMP,
        NULL,
        ${note ?? null},
        ${Number(guest_id)},
        ${Number(access_card_id)},
        ${Number(employee_id)},
        ${Number(department_id)},
        ${purpose}
      )
      RETURNING
        kulastus_id AS id,
        kulaline_id AS guest_id,
        kasutaja_id AS employee_id,
        kaart_id AS access_card_id,
        osakond_id AS department_id,
        eesmark AS purpose,
        saabumise_aeg AS arrival_time,
        lahkumise_aeg AS leaving_time
    `;

    await prisma.$queryRaw`
      UPDATE uksekaart
      SET staatus = 'valjastatud'
      WHERE kaart_id = ${Number(access_card_id)}
    `;

    res.status(201).json(visit[0]);
  } catch (error) {
    console.error("Create visit error:", error);
    res.status(500).json({ message: "Külastuse lisamine ebaõnnestus", error: error.message });
  }
});

app.put("/api/visits/:id/finish", authMiddleware, async (req, res) => {
  try {
    const visit = await prisma.$queryRaw`
      UPDATE kulastus
      SET lahkumise_aeg = CURRENT_TIMESTAMP
      WHERE kulastus_id = ${Number(req.params.id)}
        AND lahkumise_aeg IS NULL
      RETURNING
        kulastus_id AS id,
        kaart_id AS access_card_id,
        lahkumise_aeg AS leaving_time
    `;

    if (!visit.length) {
      return res.status(404).json({ message: "Aktiivset külastust ei leitud" });
    }

    res.json(visit[0]);
  } catch (error) {
    console.error("Finish visit error:", error);
    res.status(500).json({ message: "Külastuse lõpetamine ebaõnnestus", error: error.message });
  }
});

app.delete("/api/visits/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.$queryRaw`
      DELETE FROM kulastus
      WHERE kulastus_id = ${Number(req.params.id)}
    `;

    res.json({ message: "Külastus kustutatud" });
  } catch (error) {
    console.error("Delete visit error:", error);
    res.status(500).json({ message: "Külastuse kustutamine ebaõnnestus", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server töötab: http://localhost:${PORT}`);
});