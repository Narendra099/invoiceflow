import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewInvoice from "./pages/NewInvoice";
import InvoiceDetail from "./pages/InvoiceDetail";
import Clients from "./pages/Clients";
import "./styles.css";

function Shell() {
  return (
    <div className="app">
      <header className="topbar no-print">
        <Link to="/" className="brand">
          Invoice<span>Flow</span>
        </Link>
        <nav>
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/clients">Clients</NavLink>
          <NavLink to="/new" className="btn-primary nav-cta">
            + New Invoice
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/new" element={<NewInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
        </Routes>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  </React.StrictMode>
);
