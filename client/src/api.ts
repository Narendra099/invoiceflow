export interface Client {
  id: number;
  name: string;
  email: string | null;
  address: string | null;
}

export interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Invoice {
  id: number;
  number: string;
  client_id: number;
  client: Client;
  issue_date: string;
  due_date: string;
  status: "draft" | "sent" | "paid";
  notes: string | null;
  tax_rate: number;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
}

async function http<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export const api = {
  listClients: () => http<Client[]>("/api/clients"),
  createClient: (data: Partial<Client>) =>
    http<Client>("/api/clients", { method: "POST", body: JSON.stringify(data) }),
  deleteClient: (id: number) => http<void>(`/api/clients/${id}`, { method: "DELETE" }),

  listInvoices: () => http<Invoice[]>("/api/invoices"),
  getInvoice: (id: number | string) => http<Invoice>(`/api/invoices/${id}`),
  createInvoice: (data: unknown) =>
    http<Invoice>("/api/invoices", { method: "POST", body: JSON.stringify(data) }),
  setStatus: (id: number, status: string) =>
    http<Invoice>(`/api/invoices/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteInvoice: (id: number) => http<void>(`/api/invoices/${id}`, { method: "DELETE" }),
};

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
