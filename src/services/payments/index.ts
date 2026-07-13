export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  redirectUrl?: string;
  errorMessage?: string;
  status: "pending" | "success" | "failed";
}

export interface PaymentProvider {
  name: string;
  initiatePayment(bookingId: string, amount: number, currency: string, customerDetails: { name: string; email: string }): Promise<PaymentResponse>;
  verifyPayment(transactionId: string): Promise<{ success: boolean; status: "success" | "failed" | "pending" }>;
}

class MPesaPaymentProvider implements PaymentProvider {
  name = "M-Pesa Express";
  async initiatePayment(bookingId: string, amount: number, currency: string): Promise<PaymentResponse> {
    console.log(`[Vistana Payment] M-Pesa STK Push initiated for booking ${bookingId}, amount KES ${amount * 130}`);
    // Future integration steps:
    // 1. Authenticate with Safaricom Daraja API
    // 2. Send STK Push request to https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest
    // 3. Return checkout request ID
    return {
      success: true,
      transactionId: "MPESA_TX_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "pending",
      errorMessage: "M-Pesa STK Push sent. Please check your phone to enter PIN."
    };
  }
  async verifyPayment(transactionId: string) {
    return { success: true, status: "success" as const };
  }
}

class StripePaymentProvider implements PaymentProvider {
  name = "Stripe Card";
  async initiatePayment(bookingId: string, amount: number, currency: string, customerDetails: { name: string; email: string }): Promise<PaymentResponse> {
    console.log(`[Vistana Payment] Stripe session initiated for booking ${bookingId}, amount USD ${amount}`);
    // Future integration steps:
    // 1. Initialize stripe client: const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // 2. Create session: const session = await stripe.checkout.sessions.create({...})
    // 3. Return session.url
    return {
      success: true,
      transactionId: "STRIPE_CS_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      redirectUrl: `/tours/booking-success?bookingId=${bookingId}&provider=stripe`,
      status: "pending"
    };
  }
  async verifyPayment(transactionId: string) {
    return { success: true, status: "success" as const };
  }
}

class BankTransferPaymentProvider implements PaymentProvider {
  name = "Bank Transfer";
  async initiatePayment(bookingId: string, amount: number): Promise<PaymentResponse> {
    console.log(`[Vistana Payment] Bank Transfer instructions displayed for booking ${bookingId}`);
    return {
      success: true,
      transactionId: "BANK_TX_" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      status: "pending",
      errorMessage: "Please wire transfer funds to Vistana Tours KCB Bank Account. Send receipt to payments@vistanatours.com."
    };
  }
  async verifyPayment(transactionId: string) {
    return { success: false, status: "pending" as const };
  }
}

export const paymentProviders: Record<string, PaymentProvider> = {
  mpesa: new MPesaPaymentProvider(),
  stripe: new StripePaymentProvider(),
  bank: new BankTransferPaymentProvider(),
};

export async function initiatePayment(providerKey: string, bookingId: string, amount: number, currency = "USD", customerDetails = { name: "Guest", email: "guest@example.com" }): Promise<PaymentResponse> {
  const provider = paymentProviders[providerKey];
  if (!provider) {
    return {
      success: false,
      status: "failed",
      errorMessage: `Payment provider '${providerKey}' is not supported.`
    };
  }
  return provider.initiatePayment(bookingId, amount, currency, customerDetails);
}
