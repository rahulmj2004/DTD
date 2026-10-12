import { createHmac } from "node:crypto";
const B = "http://localhost:3418", SECRET = "test_secret", WH = "wh_secret";
const post = async (p, body, headers = {}) => { const r = await fetch(B + p, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }); const t = await r.text(); let j; try { j = JSON.parse(t); } catch { j = t; } return [r.status, j]; };
const sig = (o, p, s = SECRET) => createHmac("sha256", s).update(`${o}|${p}`).digest("hex");
const rows = async () => (await fetch("http://localhost:3999/_rows")).json();
const form = (over = {}) => ({ fullName: "Test Driver", phone: "9847012345", email: "t@example.com", organization: "", vehicleMake: "VW", vehicleModel: "Polo", manufacturingYear: "2019", engineCc: "1498", vehicleNumber: "KL08AB1234", acceptRules: true, ...over });
let pass = 0, fail = 0; const ok = (name, cond, extra = "") => { if (cond) pass++; else fail++; console.log(cond ? "PASS" : "FAIL", name, cond ? "" : JSON.stringify(extra)); };
const status = async () => (await rows())[0].status;

let [s, r] = await post("/api/register", form());
ok("register returns checkout with server order", s === 200 && r.state === "checkout" && r.orderId === "order_1" && r.amount === 100000 && !JSON.stringify(r).includes(SECRET), r);
const order = r.orderId, ref = r.reference;
[s, r] = await post("/api/register", form({ vehicleNumber: "kl-08 ab 1234" }));
ok("resubmit is idempotent: same reference + same order", r.reference === ref && r.orderId === order && (await rows()).length === 1, r);
[s, r] = await post("/api/register", form({ phone: "9000000001" }));
ok("same vehicle, different phone rejected", s === 409, r);

[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_good", razorpay_signature: "a".repeat(64) });
ok("forged signature rejected", s === 400 && (await status()) === "pending", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_good", razorpay_signature: sig(order, "pay_good", "wrong") });
ok("signature with wrong secret rejected", s === 400 && (await status()) === "pending", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: "order_999", razorpay_payment_id: "pay_good", razorpay_signature: sig("order_999", "pay_good") });
ok("valid signature, unknown order rejected", s === 404, r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_other", razorpay_signature: sig(order, "pay_other") });
ok("payment belonging to another order rejected", s === 402 && (await status()) === "pending", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_failed", razorpay_signature: sig(order, "pay_failed") });
ok("failed payment not confirmed", s === 402 && (await status()) === "pending", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_cheap", razorpay_signature: sig(order, "pay_cheap") });
ok("underpaid capture not confirmed", r.state === "processing" && (await status()) === "pending", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_auth", razorpay_signature: sig(order, "pay_auth") });
ok("authorized-only payment stays pending", s === 202 && r.state === "processing" && (await status()) === "pending", r);

[s, r] = await post("/api/payment/cancel", { reference: ref, orderId: order, outcome: "cancelled" });
ok("cancel recorded", s === 200 && (await status()) === "cancelled", r);
const whBody = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_good", order_id: order, amount: 100000, currency: "INR", status: "captured" } } } });
[s, r] = await post("/api/payment/webhook", whBody, { "x-razorpay-signature": "b".repeat(64) });
ok("webhook with bad signature rejected", s === 401 && (await status()) === "cancelled", r);
[s, r] = await post("/api/register", form());
ok("retry after cancel reuses order, back to pending", r.orderId === order && (await status()) === "pending", r);

[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_good", razorpay_signature: sig(order, "pay_good") });
ok("genuine captured payment confirms", s === 200 && r.state === "paid" && r.registration.reference === ref && (await status()) === "paid", r);
[s, r] = await post("/api/payment/verify", { razorpay_order_id: order, razorpay_payment_id: "pay_good", razorpay_signature: sig(order, "pay_good") });
ok("verify replay is idempotent", s === 200 && r.state === "paid" && (await rows()).length === 1, r);
[s, r] = await post("/api/payment/cancel", { reference: ref, orderId: order, outcome: "failed" });
ok("cancel cannot downgrade a paid row", (await status()) === "paid", r);
const whFail = JSON.stringify({ event: "payment.failed", payload: { payment: { entity: { id: "pay_x", order_id: order, amount: 100000, currency: "INR", status: "failed" } } } });
[s, r] = await post("/api/payment/webhook", whFail, { "x-razorpay-signature": createHmac("sha256", WH).update(whFail).digest("hex") });
ok("signed failure webhook cannot downgrade a paid row", s === 200 && (await status()) === "paid", r);
[s, r] = await post("/api/register", form());
ok("re-register paid vehicle: no new order", r.state === "paid" && !r.orderId, r);
[s, r] = await post("/api/register", form({ phone: "9000000001" }));
ok("paid vehicle hidden from other phone", s === 409 && !JSON.stringify(r).includes(ref), r);
const st = await (await fetch(`${B}/api/registration?ref=${ref}`)).json();
ok("status lookup: paid, no contact details", st.registration?.status === "paid" && !JSON.stringify(st).includes("9847012345") && !JSON.stringify(st).includes("example.com"), st);

// webhook-only confirmation for a second vehicle
[s, r] = await post("/api/register", form({ vehicleNumber: "KL07CD4321", phone: "9847099999" }));
const o2 = r.orderId; const wh2 = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_wh", order_id: o2, amount: 100000, currency: "INR", status: "captured" } } } });
[s, r] = await post("/api/payment/webhook", wh2, { "x-razorpay-signature": createHmac("sha256", WH).update(wh2).digest("hex") });
ok("signed capture webhook confirms", s === 200 && (await rows())[1].status === "paid" && (await rows())[1].razorpay_payment_id === "pay_wh", r);
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
