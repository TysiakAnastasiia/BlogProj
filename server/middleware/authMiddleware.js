import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    // ⚠️ Використай свій ключ або змінну середовища
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    req.user = decoded; // додає { id, username } до req
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
