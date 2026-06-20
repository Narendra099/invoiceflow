import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, resolve, join } from "path";
import { existsSync } from "fs";
import clients from "./routes/clients.js";
import invoices from "./routes/invoices.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/clients", clients);
app.use("/api/invoices", invoices);

// In production, serve the built React app from the same server (single-service deploy).
// server/dist/index.js -> ../../client/dist
const clientDist = resolve(__dirname, "..", "..", "client", "dist");
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback: send index.html for any non-API route so client-side routing works.
  app.get("*", (_req, res) => res.sendFile(join(clientDist, "index.html")));
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`InvoiceFlow running on http://localhost:${PORT}`);
});
