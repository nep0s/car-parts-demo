export function formatCLP(amount: number): string {
  return amount.toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
}
