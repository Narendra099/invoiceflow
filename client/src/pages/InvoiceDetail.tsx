import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, money, Invoice } from "../api";

export default function InvoiceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [inv, setInv] = useState<Invoice | null>(null);

  const load = () => api.getInvoice(id!).then(setInv);
  useEffect(() => {
    load();
  }, [id]);

  if (!inv) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="detail-actions no-print">
        <button className="btn-ghost" onClick={() => nav(-1)}>
          ← Back
        </button>
        <div className="spacer" />
        {inv.status !== "paid" && (
          <button
            className="btn-primary"
            onClick={async () => {
              await api.setStatus(inv.id, "paid");
              load();
            }}
          >
            Mark as paid
          </button>
        )}
        <button className="btn-ghost" onClick={() => window.print()}>
          Download PDF / Print
        </button>
        <button
          className="btn-ghost danger"
          onClick={async () => {
            if (confirm("Delete this invoice?")) {
              await api.deleteInvoice(inv.id);
              nav("/");
            }
          }}
        >
          Delete
        </button>
      </div>

      <div className="invoice-sheet">
        <div className="invoice-head">
          <div>
            <h1 className="invoice-title">INVOICE</h1>
            <p className="muted">{inv.number}</p>
            <p>
              <span className={`badge ${inv.status}`}>{inv.status}</span>
            </p>
          </div>
          <div className="brand-block">
            Invoice<span>Flow</span>
          </div>
        </div>

        <div className="invoice-meta">
          <div>
            <h4>Bill to</h4>
            <strong>{inv.client?.name}</strong>
            {inv.client?.email && <div>{inv.client.email}</div>}
            {inv.client?.address && <div className="muted">{inv.client.address}</div>}
          </div>
          <div className="right">
            <div>
              <span className="muted">Issue date</span> {inv.issue_date}
            </div>
            <div>
              <span className="muted">Due date</span> {inv.due_date}
            </div>
          </div>
        </div>

        <table className="invoice-items">
          <thead>
            <tr>
              <th>Description</th>
              <th className="right">Qty</th>
              <th className="right">Unit price</th>
              <th className="right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i}>
                <td>{it.description}</td>
                <td className="right">{it.quantity}</td>
                <td className="right">{money(it.unit_price)}</td>
                <td className="right">{money(it.quantity * it.unit_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <div>
            <span>Subtotal</span>
            <span>{money(inv.subtotal)}</span>
          </div>
          <div>
            <span>Tax ({inv.tax_rate}%)</span>
            <span>{money(inv.tax)}</span>
          </div>
          <div className="grand">
            <span>Total due</span>
            <span>{money(inv.total)}</span>
          </div>
        </div>

        {inv.notes && (
          <div className="invoice-notes">
            <h4>Notes</h4>
            <p>{inv.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
