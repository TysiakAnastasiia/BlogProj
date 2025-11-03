import express from "express";
const router = express.Router();

// GET всі фільми
router.get("/", (req, res) => {
  res.json({ message: "GET all movies" });
});

// GET один фільм
router.get("/:id", (req, res) => {
  res.json({ message: `GET movie ${req.params.id}` });
});

// POST додати фільм
router.post("/", (req, res) => {
  res.json({ message: "POST add movie" });
});

// PUT редагувати фільм
router.put("/:id", (req, res) => {
  res.json({ message: `PUT update movie ${req.params.id}` });
});

// DELETE видалити фільм
router.delete("/:id", (req, res) => {
  res.json({ message: `DELETE movie ${req.params.id}` });
});

export default router;
