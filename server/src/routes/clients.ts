import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (_req, res) => {
  const clients = db.prepare("SELECT * FROM clients ORDER BY name").all();
  res.json(clients);
});

router.post("/", (req, res) => {
  const { name, email, address } = req.body ?? {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "name is required" });
  }
  const info = db
    .prepare("INSERT INTO clients (name, email, address) VALUES (?, ?, ?)")
    .run(name, email ?? null, address ?? null);
  const client = db.prepare("SELECT * FROM clients WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(client);
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM clients WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
