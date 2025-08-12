import { lmsrPrice } from "@/lib/lmsr";

async function getMarket(id: string) {
const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/markets/${id}`, { cache: "no-store" });
if (!res.ok) return null;
return res.json();
}

export default async function MarketPage({ params }: { params: { id: string }}) {
const m = await getMarket(params.id);
if (!m) return <main>Not found</main>;
const pYes = lmsrPrice(m.qYes, m.qNo, "YES", m.b);
const pNo = 1 - pYes;
return (

<main style={{ padding: 24 }}> <h2>{m.question}</h2> <div>Closes: {new Date(m.closeTime).toLocaleString()}</div> <div>Resolved: {String(m.resolved)} {m.resolution ?? ""}</div> <div style={{ marginTop: 12 }}> <strong>Prob YES:</strong> {(pYes * 100).toFixed(1)}% | <strong>Prob NO:</strong> {(pNo * 100).toFixed(1)}% </div> {!m.resolved && <TradeForm marketId={m.id} />} </main> );
}

function TradeForm({ marketId }: { marketId: string }) {
async function action(formData: FormData) {
"use server";
const outcome = formData.get("outcome") as "YES" | "NO";
const shares = Number(formData.get("shares"));
await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/trades`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ marketId, outcome, shares })
});
}
return (

<form action={action} style={{ marginTop: 16, display: "flex", gap: 8 }}> <select name="outcome"> <option value="YES">YES</option> <option value="NO">NO</option> </select> <input name="shares" type="number" min={1} defaultValue={50} /> <button type="submit">Buy</button> </form> );
}
