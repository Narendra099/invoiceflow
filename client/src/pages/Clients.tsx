import { useEffect, useState } from "react";
import { api, Client } from "../api";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [error, setError] = useState("");

  const load = () => api.listClients().then(setClients);
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.createClient(form);
      setForm({ name: "", email: "", address: "" });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>Clients</h1>
      <div className="grid-2">
        <div className="card">
          <h2>Add client</h2>
          <form onSubmit={add} className="form">
            <label>
              Name *
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Acme Inc."
                required
              />
            </label>
            <label>
              Email
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="billing@acme.com"
              />
            </label>
            <label>
              Address
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St, City"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn-primary" type="submit">
              Add client
            </button>
          </form>
        </div>

        <div className="card">
          <h2>All clients</h2>
          {clients.length === 0 ? (
            <p className="muted">No clients yet.</p>
          ) : (
            <ul className="list">
              {clients.map((c) => (
                <li key={c.id}>
                  <div>
                    <strong>{c.name}</strong>
                    {c.email && <div className="muted small">{c.email}</div>}
                  </div>
                  <button
                    className="btn-ghost danger"
                    onClick={async () => {
                      await api.deleteClient(c.id);
                      load();
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
