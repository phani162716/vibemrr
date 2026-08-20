export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function dealWhatsAppMessage(productName: string, amountInr: number, marketplace = "Vibers"): string {
  const amount = new Intl.NumberFormat("en-IN").format(Math.round(amountInr));
  return `Hi, I'm interested in buying ${productName}. My offer of ₹${amount} was accepted on ${marketplace}. I'd like to discuss payment and product handover.`;
}

export function whatsappHref(phone: string, text: string): string {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(text)}`;
}
