import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, money, Client, LineItem } from "../api";

const blankItem = (): LineItem => ({ description: "", quantity: 1, unit_price: 0 });

export default function NewInvoice() {
  const nav = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<number | "">("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([blankItem()]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listClients().then(setClients);
  }, []);

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  function updateItem(idx: number, patch: Partial<LineItem>) {
    setItems(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!clientId) return setError("Please select a client.");
    const valid = items.filter((it) => it.description.trim());
    if (valid.length === 0) return setError("Add at least one line item.");
    try {
      const inv = await api.createInvoice({
        client_id: clientId,
        issue_date: issueDate,
        due_date: dueDate,
        tax_rate: taxRate,
        notes,
        items: valid,
      });
      nav(`/invoices/${inv.id}`);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div>
      <h1>New Invoice</h1>
      <form onSubmit={submit}>
        <div className="card">
          <div className="form-row">
            <label>
              Client *
              {clients.length === 0 ? (
                <p className="muted small">Add a client first on the Clients page.</p>
              ) : (
                <select
                  value={clientId}
                  onChange={(e) => setClientId(Number(e.target.value))}
                  required
                >
                  <option value="">Select…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </label>
            <label>
              Issue date
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </label>
            <label>
              Due date
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          </div>
        </div>

        <div className="card">
          <h2>Line items</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ width: 90 }}>Qty</th>
                <th style={{ width: 130 }}>Unit price</th>
                <th className="right" style={{ width: 110 }}>
                  Amount
                </th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <input
                      value={it.description}
                      onChange={(e) => updateItem(i, { description: e.target.value })}
                      placeholder="Design work"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={it.quantity}
                      onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={it.unit_price}
                      onChange={(e) => updateItem(i, { unit_price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="right">{money(it.quantity * it.unit_price)}</td>
                  <td>
                    {items.length > 1 && (
                      <button
                        type="button"
                        className="btn-ghost danger"
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn-ghost" onClick={() => setItems([...items, blankItem()])}>
            + Add line
          </button>

          <div className="totals">
            <div>
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div>
              <span>
                Tax
                <input
                  type="number"
                  className="tax-input"
                  min="0"
                  step="any"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                />
                %
              </span>
              <span>{money(tax)}</span>
            </div>
            <div className="grand">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <label>
            Notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, thank-you note, etc."
            />
          </label>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn-primary" type="submit">
          Create invoice
        </button>
      </form>
    </div>
  );
}
