export const SHIPPING_CARRIERS = [
  { id: "tcs", label: "TCS", trackingUrl: "https://www.tcsexpress.com/track/{tracking}" },
  { id: "leopards", label: "Leopards Courier", trackingUrl: "https://leopardscourier.com/track/{tracking}" },
  { id: "mnp", label: "M&P Courier", trackingUrl: "https://www.mulphico.pk/track/{tracking}" },
  { id: "pakistan_post", label: "Pakistan Post", trackingUrl: "https://ep.gov.pk/track.asp?tracking={tracking}" },
  { id: "dhl", label: "DHL", trackingUrl: "https://www.dhl.com/pk-en/home/tracking.html?tracking-id={tracking}" },
  { id: "other", label: "Other", trackingUrl: "" },
] as const;

export type CarrierId = (typeof SHIPPING_CARRIERS)[number]["id"];

export function getCarrierLabel(carrierId: string | null | undefined): string {
  if (!carrierId) return "—";
  return SHIPPING_CARRIERS.find((c) => c.id === carrierId)?.label ?? carrierId;
}

export function buildCarrierTrackingUrl(
  carrierId: string | null | undefined,
  trackingNumber: string
): string | null {
  if (!carrierId || !trackingNumber) return null;
  const carrier = SHIPPING_CARRIERS.find((c) => c.id === carrierId);
  if (!carrier?.trackingUrl) return null;
  return carrier.trackingUrl.replace("{tracking}", encodeURIComponent(trackingNumber));
}
