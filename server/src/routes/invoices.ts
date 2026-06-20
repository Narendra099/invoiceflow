import { Router } from "express";
import db from "../db.js";

const router = Router();

interface LineItemInput {
  description: string;
  quantity: number;
  unit_price: number;
}

// Assemble a full invoice: header + client + items + computed totals.
function hydrate(id: number | bigint) {
  const invoice = db.prepare("SELECT * FROM invoices WHERE id = ?").get(id) as any;
  if (!invoice) return null;
  invoice.client = db.prepare("SELECT * FROM clients WHERE id = ?").get(invoice.client_id);
  invoice.items = db.prepare("SELECT * FROM line_items WHERE invoice_id = ?").all(id) as any[];
  const subtotal = invoice.items.reduce(
    (sum: number, it: any) => sum + it.quantity * it.unit_price,
    0
  );
  const tax = subtotal * (invoice.tax_rate / 100);
  invoice.subtotal = subtotal;
  invoice.tax = tax;
  invoice.total = subtotal + tax;
  return invoice;
}

router.get("/", (_req, res) => {
  const ids = db.prepare("SELECT id FROM invoices ORDER BY created_at DESC").all() as {
    id: number;
  }[];
  res.json(ids.map((r) => hydrate(r.id)));
});

router.get("/:id", (req, res) => {
  const invoice = hydrate(Number(req.params.id));
  if (!invoice) return res.status(404).json({ error: "not found" });
  res.json(invoice);
});

router.post("/", (req, res) => {
  const { client_id, issue_date, due_date, notes, tax_rate, items } = req.body ?? {};
  if (!client_id) return res.status(400).json({ error: "client_id is required" });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "at least one line item is required" });
  }

  // Auto-generate a sequential invoice number like INV-0001.
  const count = (db.prepare("SELECT COUNT(*) AS c FROM invoices").get() as any).c;
  const number = `INV-${String(count + 1).padStart(4, "0")}`;
  const today = new Date().toISOString().slice(0, 10);

  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO invoices (number, client_id, issue_date, due_date, status, notes, tax_rate)
         VALUES (?, ?, ?, ?, 'draft', ?, ?)`
      )
      .run(number, client_id, issue_date ?? today, due_date ?? today, notes ?? null, tax_rate ?? 0);
    const insertItem = db.prepare(
      "INSERT INTO line_items (invoice_id, description, quantity, unit_price) VALUES (?, ?, ?, ?)"
    );
    for (const it of items as LineItemInput[]) {
      insertItem.run(info.lastInsertRowid, it.description, it.quantity || 1, it.unit_price || 0);
    }
    return info.lastInsertRowid;
  });

  res.status(201).json(hydrate(tx()));
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body ?? {};
  const allowed = ["draft", "sent", "paid"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${allowed.join(", ")}` });
  }
  db.prepare("UPDATE invoices SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json(hydrate(Number(req.params.id)));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM invoices WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
