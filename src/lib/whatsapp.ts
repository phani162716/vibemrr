export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buyerToSellerMessage(productName: string, amountInr: number, marketplace = "Vibers"): string {
  const amount = new Intl.NumberFormat("en-IN").format(Math.round(amountInr));
  return `Hi, I'm interested in buying ${productName}. My offer of ₹${amount} was accepted on ${marketplace}. I'd like to discuss payment and product handover.`;
}

export function sellerToBuyerMessage(productName: string, amountInr: number, marketplace = "Vibers"): string {
  const amount = new Intl.NumberFormat("en-IN").format(Math.round(amountInr));
  return `Hi, I accepted your offer of ₹${amount} for ${productName} on ${marketplace}. Let's discuss payment and product handover.`;
}

export function whatsappHref(phone: string, text: string): string | null {
  const n = digitsOnly(phone);
  if (n.length < 10) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export function dealWhatsAppMessage(productName: string, amountInr: number, marketplace = "Vibers"): string {
  return buyerToSellerMessage(productName, amountInr, marketplace);
}
