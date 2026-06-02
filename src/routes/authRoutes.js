import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body } from "express-validator";

import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const allowedRoles = ["administraator", "kasutaja"];
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function createAuthRouter(prisma) {
  const router = express.Router();

  router.post(
    "/register",
    [
      body("username")
        .trim()
        .notEmpty()
        .withMessage("Kasutajanimi on kohustuslik")
        .isLength({ min: 3, max: 50 })
        .withMessage("Kasutajanimi peab olema 3–50 märki pikk"),

      body("email")
        .optional({ nullable: true, checkFalsy: true })
        .trim()
        .isEmail()
        .withMessage("Email peab olema korrektne"),

      body("role")
        .trim()
        .notEmpty()
        .withMessage("Roll on kohustuslik")
        .isIn(allowedRoles)
        .withMessage("Lubatud rollid on ainult administraator ja kasutaja"),

      body("password")
        .notEmpty()
        .withMessage("Parool on kohustuslik")
        .matches(passwordRegex)
        .withMessage(
          "Parool peab olema vähemalt 8 märki ning sisaldama suurt tähte, väikest tähte ja numbrit"
        ),

      body("confirmPassword")
        .notEmpty()
        .withMessage("Parooli kordus on kohustuslik")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Paroolid ei ühti");
          }

          return true;
        }),
    ],
    validate,
    asyncHandler(async (req, res) => {
      const { username, password, role, email } = req.body;

      const roles = await prisma.$queryRaw`
        SELECT roll_id, nimetus
        FROM roll
        WHERE nimetus = ${role}
        LIMIT 1
      `;

      if (!roles.length) {
        const error = new Error(`Rolli ei leitud: ${role}`);
        error.statusCode = 400;
        throw error;
      }

      const existing = await prisma.$queryRaw`
        SELECT kasutaja_id
        FROM kasutaja
        WHERE kasutajanimi = ${username}
        LIMIT 1
      `;

      if (existing.length) {
        const error = new Error("Kasutajanimi on juba olemas");
        error.statusCode = 409;
        throw error;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const created = await prisma.$queryRaw`
        INSERT INTO kasutaja (
          kasutajanimi,
          email,
          password_hash,
          roll_id,
          is_active
        ) VALUES (
          ${username},
          ${email || null},
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

      res.status(201).json(created[0]);
    })
  );

  router.post(
    "/login",
    [
      body("username")
        .trim()
        .notEmpty()
        .withMessage("Kasutajanimi on kohustuslik"),

      body("password")
        .notEmpty()
        .withMessage("Parool on kohustuslik"),
    ],
    validate,
    asyncHandler(async (req, res) => {
      const { username, password } = req.body;

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
        const error = new Error("Vale kasutajanimi või parool");
        error.statusCode = 401;
        throw error;
      }

      const user = users[0];

      if (!user.is_active) {
        const error = new Error("Kasutaja ei ole aktiivne");
        error.statusCode = 403;
        throw error;
      }

      const passwordIsValid = await bcrypt.compare(password, user.password_hash ?? "");

      if (!passwordIsValid) {
        const error = new Error("Vale kasutajanimi või parool");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          id: user.id,
          employee_id: user.employee_id,
          username: user.username,
          role: user.role,
          role_id: user.roll_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({
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
    })
  );

  return router;
}