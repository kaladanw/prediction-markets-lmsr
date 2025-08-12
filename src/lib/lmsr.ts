export function lmsrCost(qYes: number, qNo: number, b: number): number {
    const a = qYes / b;
    const d = qNo / b;
    const m = Math.max(a, d);
    return b * Math.log(Math.exp(a - m) + Math.exp(d - m)) + b * m;
    }
    
    export function lmsrCostDelta(qYes: number, qNo: number, outcome: "YES" | "NO", deltaShares: number, b: number): number {
    const qy1 = outcome === "YES" ? qYes + deltaShares : qYes;
    const qn1 = outcome === "NO" ? qNo + deltaShares : qNo;
    return lmsrCost(qy1, qn1, b) - lmsrCost(qYes, qNo, b);
    }
    
    export function lmsrPrice(qYes: number, qNo: number, outcome: "YES" | "NO", b: number): number {
    const a = Math.exp(qYes / b);
    const d = Math.exp(qNo / b);
    const denom = a + d;
    return outcome === "YES" ? a / denom : d / denom;
    }