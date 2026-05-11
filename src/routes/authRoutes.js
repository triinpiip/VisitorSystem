import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default function createAuthRouter(prisma) {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    try {
      const { username, password, role, email } = req.body;

      if (!username || !password || !role) {
        return res.status(400).json({
          message: "Kasutajanimi, parool ja roll on kohustuslikud",
        });
      }

      const roleMap = {
        Admin: "administraator",
        admin: "administraator",
        administraator: "administraator",
        Registratuur: "registratuur",
        registratuur: "registratuur",
        Turva: "turva",
        turva: "turva",
      };

      const dbRole = roleMap[role] || role;

      const roles = await prisma.$queryRaw`
        SELECT roll_id, nimetus
        FROM roll
        WHERE nimetus = ${dbRole}
        LIMIT 1
      `;

      if (!roles.length) {
        return res.status(400).json({ message: `Rolli ei leitud: ${role}` });
      }

      const existing = await prisma.$queryRaw`
        SELECT kasutaja_id
        FROM kasutaja
        WHERE kasutajanimi = ${username}
      `;

      if (existing.length) {
        return res.status(409).json({ message: "Kasutajanimi on juba olemas" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const created = await prisma.$queryRaw`
        INSERT INTO kasutaja (
          kasutajanimi,
          email,
          password_hash,
          roll_id,
          is_active
        )
        VALUES (
          ${username},
          ${email ?? null},
          ${passwordHash},
          ${roles[0].roll_id},
          true
        )
        RETURNING
          kasutaja_id AS id,
          kasutaja_id AS employee_id,
          kasutajanimi AS username,
          email,
          roll_id AS role_id,
          is_active
      `;

      return res.status(201).json(created[0]);
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({
        message: "Registreerimine ebaõnnestus",
        error: error.message,
      });
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Kasutajanimi ja parool on kohustuslikud",
        });
      }

      const users = await prisma.$queryRaw`
        SELECT
          k.kasutaja_id AS id,
          k.kasutaja_id AS employee_id,
          k.kasutajanimi AS username,
          k.email,
          k.password_hash,
          k.roll_id,
          k.is_active,
          r.nimetus AS role
        FROM kasutaja k
        JOIN roll r ON k.roll_id = r.roll_id
        WHERE k.kasutajanimi = ${username}
        LIMIT 1
      `;

      if (!users.length) {
        return res.status(401).json({ message: "Vale kasutajanimi või parool" });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({ message: "Kasutaja ei ole aktiivne" });
      }

      const ok = await bcrypt.compare(password, user.password_hash ?? "");

      if (!ok) {
        return res.status(401).json({ message: "Vale kasutajanimi või parool" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          employee_id: user.employee_id,
          username: user.username,
          role: user.role,
          role_id: user.roll_id,
        },
        process.env.JWT_SECRET || "dev_secret",
        { expiresIn: "1d" }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          employee_id: user.employee_id,
          username: user.username,
          email: user.email,
          role: user.role,
          role_id: user.roll_id,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        message: "Sisselogimine ebaõnnestus",
        error: error.message,
      });
    }
  });

  return router;
}