import Link from "next/link";
import AuthButton from "@/components/AuthButton";

async function getMarkets() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/markets`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
const markets = await getMarkets();
return (

<main style={{ padding: 24 }}> 
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
    <h1>Prediction Markets (Play Money)</h1> 
    <AuthButton />
  </div>
  <CreateMarketForm /> 
  <ul> 
    {markets.map((m: any) => ( 
      <li key={m.id} style={{ margin: "12px 0" }}> 
        <Link href={`/market/${m.id}`}>{m.question}</Link> 
        <div>Closes: {new Date(m.closeTime).toLocaleString()}</div> 
        <div>Resolved: {String(m.resolved)} {m.resolution ?? ""}</div> 
      </li> 
    ))} 
  </ul> 
</main> );
}

function CreateMarketForm() {
async function action(formData: FormData) {
"use server";
const question = formData.get("question") as string;
const closeTime = formData.get("closeTime") as string;
const b = Number(formData.get("b"));
await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/markets`, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ question, closeTime, b })
});
}
const defaultClose = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().slice(0,16);
return (

<form action={action} style={{ margin: "16px 0", display: "grid", gap: 8, maxWidth: 560 }}> <input name="question" placeholder="Will it rain tomorrow in NYC?" required /> <input type="datetime-local" name="closeTime" defaultValue={defaultClose} /> <input type="number" name="b" defaultValue={20000} min={5000} max={200000} /> <button type="submit">Create Market</button> </form> );
}