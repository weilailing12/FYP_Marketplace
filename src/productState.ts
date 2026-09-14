export function getMerchInventory(stockInput: string) {
  const stock = Number(stockInput);
  if (!stockInput.trim() || !Number.isSafeInteger(stock) || stock < 0) {
    throw new Error("Available quantity must be a whole number of zero or more.");
  }
  return { stock_quantity: stock, availability: stock > 0 ? "available" : "sold" };
}

export function getBuyerOrderState(productType: string, orders: { status: string }[]) {
  const activeOrder = orders.find(order => order.status === "pending" || order.status === "accepted");
  const completed = orders.some(order => order.status === "completed");
  return {
    orderStatus: activeOrder?.status ?? (productType !== "clubmerch" && completed ? "completed" : null),
    hasCompletedPreviousOrder: productType === "clubmerch" && !activeOrder && completed,
  };
}
