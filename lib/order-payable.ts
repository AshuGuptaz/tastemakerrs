/** Only an unpaid/failed, still-open order may start a payment (see create-order / create-checkout). */
export function canStartPayment(order: { paymentStatus: string; status?: string }): boolean {
  return ["unpaid", "failed"].includes(order.paymentStatus) && order.status !== "cancelled";
}
