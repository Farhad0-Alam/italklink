import { BusinessCard } from "@shared/schema";

/**
 * Generates vCard data from a business card
 * @param card - Business card data
 * @returns vCard string
 */
export function generateVCard(card: BusinessCard): string {
  return `BEGIN:VCARD
VERSION:3.0
FN:${card.fullName || "Contact"}
ORG:${card.company || ""}
TITLE:${card.title || ""}
TEL:${card.phone || ""}
EMAIL:${card.email || ""}
URL:${card.website || ""}
END:VCARD`;
}

/**
 * Downloads a vCard file for the business card
 * @param card - Business card data
 */
export function downloadVCard(card: BusinessCard): void {
  const vCard = generateVCard(card);
  const blob = new Blob([vCard], { type: "text/vcard" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${card.fullName || "contact"}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}