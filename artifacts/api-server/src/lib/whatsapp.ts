/**
 * Formats a phone number for WhatsApp wa.me links.
 * Specifically handles Nigerian numbers by converting leading 0 to 234.
 */
export function formatWhatsAppNumber(phone: string): string {
  // 1. Remove all non-numeric characters (handles dashes, spaces, +, etc.)
  let cleaned = phone.replace(/\D/g, "");

  // 2. Handle cases where country code is followed by a leading zero (e.g., 234080...)
  if (cleaned.startsWith("2340")) {
    cleaned = "234" + cleaned.substring(4);
  }
  // 3. Handle standard Nigerian leading zero (e.g., 080...)
  else if (cleaned.startsWith("0")) {
    cleaned = "234" + cleaned.substring(1);
  }
  // 4. Handle 10-digit numbers without country code or leading zero (e.g., 803...)
  else if (cleaned.length === 10 && !cleaned.startsWith("234")) {
    cleaned = "234" + cleaned;
  }

  return cleaned;
}
