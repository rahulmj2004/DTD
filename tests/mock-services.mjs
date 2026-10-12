// Minimal PostgREST + Razorpay mock for integration-testing the payment flow.
import http from "node:http";
const rows = []; let orders = 0;
const payments = {
  pay_good: (o) => ({ id: "pay_good", order_id: o, amount: 100000, currency: "INR", status: "captured" }),
  pay_auth: (o) => ({ id: "pay_auth", order_id: o, amount: 100000, currency: "INR", status: "authorized" }),
  pay_cheap: (o) => ({ id: "pay_cheap", order_id: o, amount: 100, currency: "INR", status: "captured" }),
  pay_other: () => ({ id: "pay_other", order_id: "order_someone_else", amount: 100000, currency: "INR", status: "captured" }),
  pay_failed: (o) => ({ id: "pay_failed", order_id: o, amount: 100000, currency: "INR", status: "failed" }),
};
let lastOrder = null;
const match = (row, q) => [...q.entries()].every(([k, v]) => {
  if (k === "select") return true;
  const [op, ...rest] = v.split("."); const val = rest.join(".");
  return op === "eq" ? String(row[k]) === val : op === "neq" ? String(row[k]) !== val : true;
});
http.createServer((req, res) => {
  let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
    const url = new URL(req.url, "http://x"); const send = (code, data) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(data)); };
    const single = (req.headers.accept || "").includes("vnd.pgrst.object");
    if (url.pathname === "/rest/v1/registrations") {
      if (req.method === "GET") return send(200, rows.filter((r) => match(r, url.searchParams)));
      if (req.method === "POST") {
        const row = JSON.parse(body);
        if (rows.some((r) => r.vehicle_number === row.vehicle_number)) return send(409, { code: "23505", message: "duplicate key" });
        Object.assign(row, { id: "id" + rows.length, razorpay_order_id: null, razorpay_payment_id: null, paid_at: null });
        rows.push(row); return send(201, single ? row : [row]);
      }
      if (req.method === "PATCH") {
        const hit = rows.filter((r) => match(r, url.searchParams)); hit.forEach((r) => Object.assign(r, JSON.parse(body)));
        if (!single) return send(200, hit);
        return hit.length === 1 ? send(200, hit[0]) : send(406, { code: "PGRST116", details: "The result contains 0 rows", message: "JSON object requested" });
      }
    }
    if (url.pathname === "/v1/orders" && req.method === "POST") { lastOrder = "order_" + ++orders; return send(200, { id: lastOrder, amount: 100000, currency: "INR", status: "created" }); }
    let m;
    if ((m = url.pathname.match(/^\/v1\/payments\/(\w+)$/))) return payments[m[1]] ? send(200, payments[m[1]](lastOrder)) : send(404, {});
    if ((m = url.pathname.match(/^\/v1\/orders\/(\w+)\/payments$/))) return send(200, { items: [] });
    if (url.pathname === "/_rows") return send(200, rows);
    send(404, { path: url.pathname });
  });
}).listen(3999);
