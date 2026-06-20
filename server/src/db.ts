import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// DB_PATH lets the host point SQLite at a persistent disk (e.g. /data/invoiceflow.db on Render).
// Falls back to a local file for development.
const dbPath = process.env.DB_PATH || join(__dirname, "..", "invoiceflow.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT,
    address    TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    number     TEXT NOT NULL,
    client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    issue_date TEXT NOT NULL,
    due_date   TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'draft',
    notes      TEXT,
    tax_rate   REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS line_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id  INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity    REAL NOT NULL DEFAULT 1,
    unit_price  REAL NOT NULL DEFAULT 0
  );
`);

export default db;
