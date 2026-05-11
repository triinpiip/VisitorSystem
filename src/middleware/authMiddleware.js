import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token puudub" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token puudub" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    next();
  } catch (error) {
    return res.status(401).json({ message: "Vigane või aegunud token" });
  }
}

export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({ message: "Roll puudub" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Ligipääs keelatud" });
    }

    next();
  };
}