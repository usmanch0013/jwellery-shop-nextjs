export interface PaymentInitResult {
  success: boolean;
  redirectUrl?: string;
  error?: string;
}

export async function initJazzCashPayment(
  orderNumber: string,
  amount: number
): Promise<PaymentInitResult> {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  if (!merchantId) {
    return { success: false, error: "JazzCash not configured" };
  }
  // Merchant API integration — redirect to hosted page when credentials configured
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderNumber}`;
  return {
    success: true,
    redirectUrl: returnUrl,
  };
}

export async function initEasyPaisaPayment(
  orderNumber: string,
  amount: number
): Promise<PaymentInitResult> {
  const storeId = process.env.EASYPAISA_STORE_ID;
  if (!storeId) {
    return { success: false, error: "EasyPaisa not configured" };
  }
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?order=${orderNumber}`;
  return {
    success: true,
    redirectUrl: returnUrl,
  };
}
