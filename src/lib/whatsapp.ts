export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

/** 10+ digit WhatsApp, or undefined. */
export function validWhatsApp(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const n = digitsOnly(phone);
  return n.length >= 10 ? n : undefined;
}

/** Same person even if one number is stored with 91 and the other is not. */
export function sameWhatsApp(a?: string | null, b?: string | null): boolean {
  const x = validWhatsApp(a);
  const y = validWhatsApp(b);
  if (!x || !y) return false;
  return x === y || x.slice(-10) === y.slice(-10);
}

/** wa.me to the other party only. Never opens your own chat. */
export function peerWhatsAppHref(peer?: string | null, own?: string | null, text = ""): string | null {
  const p = validWhatsApp(peer);
  if (!p || sameWhatsApp(p, own)) return null;
  return whatsappHref(p, text);
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
