import express from "express";
const router = express.Router();

// приклад простого ендпоінта
router.get("/", (req, res) => {
  res.send("Users route works!");
});

export default router;
