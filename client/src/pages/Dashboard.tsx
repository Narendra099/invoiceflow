import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, money, Invoice } from "../api";

export default function Dashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listInvoices().then((d) => {
      setInvoices(d);
      setLoading(false);
    });
  }, []);

  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + i.total, 0);

  if (loading) return <p className="muted">Loading…</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats">
        <div className="stat">
          <span className="stat-label">Total invoices</span>
          <span className="stat-value">{invoices.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Outstanding</span>
          <span className="stat-value amber">{money(outstanding)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Paid</span>
          <span className="stat-value green">{money(paid)}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <h2>Invoices</h2>
          <Link to="/new" className="btn-primary">
            + New Invoice
          </Link>
        </div>
        {invoices.length === 0 ? (
          <p className="muted">No invoices yet. Create your first one.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Number</th>
                <th>Client</th>
                <th>Due</th>
                <th>Status</th>
                <th className="right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <Link to={`/invoices/${inv.id}`}>{inv.number}</Link>
                  </td>
                  <td>{inv.client?.name}</td>
                  <td>{inv.due_date}</td>
                  <td>
                    <span className={`badge ${inv.status}`}>{inv.status}</span>
                  </td>
                  <td className="right">{money(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
