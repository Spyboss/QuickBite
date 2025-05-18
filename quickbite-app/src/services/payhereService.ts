/**
 * PayHere Payment Service
 *
 * This service handles PayHere payment integration for the frontend.
 * It provides functions for initiating payments, handling responses,
 * and managing payment state.
 */

// PayHere credentials from environment variables
const MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID;
const APP_ID = import.meta.env.VITE_PAYHERE_APP_ID;

// PayHere API URLs
const SANDBOX_URL = 'https://sandbox.payhere.lk/pay/checkout';
const PRODUCTION_URL = 'https://www.payhere.lk/pay/checkout';

// Determine if we're in development mode
const isDevelopment = import.meta.env.MODE === 'development';

// Use sandbox URL in development, production URL otherwise
const PAYHERE_URL = isDevelopment ? SANDBOX_URL : PRODUCTION_URL;

// Backend API URL for hash generation
export const API_BASE_URL = isDevelopment
  ? 'http://localhost:3001'
  : 'https://quickbite-backend.vercel.app';

/**
 * Interface for PayHere payment data
 */
export interface PayHerePaymentData {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  currency: string;
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash?: string;
  sandbox?: string; // 'true' for sandbox mode
  [key: string]: string | undefined; // Index signature for other potential string properties
}

/**
 * Generate a secure hash for the payment request
 *
 * @param orderId - The order ID
 * @param amount - The payment amount
 * @param currency - The currency code (e.g., LKR)
 * @returns The generated hash
 */
export async function generatePaymentHash(
  orderId: string | number,
  amount: string | number,
  currency: string = 'LKR'
): Promise<string> {
  try {
    // Convert parameters to strings
    const orderIdStr = String(orderId);
    const amountStr = typeof amount === 'number' ? amount.toFixed(2) : String(amount);

    // Call backend API to generate hash
    const response = await fetch(`${API_BASE_URL}/generate-payment-hash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_id: orderIdStr,
        amount: amountStr,
        currency,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate payment hash: ${response.statusText}`);
    }

    const data = await response.json();
    return data.hash;
  } catch (error) {
    console.error('Error generating payment hash:', error);
    throw error;
  }
}

/**
 * Initiate a PayHere payment
 *
 * @param paymentData - Payment data for PayHere
 * @returns void
 */
export async function initiatePayment(paymentData: PayHerePaymentData): Promise<void> {
  try {
    console.log('=== Initiating PayHere Payment ===');
    console.log('Payment Data:', { ...paymentData, hash: paymentData.hash ? 'Set (not shown)' : 'Not set' });

    // Store order ID in localStorage for reference
    localStorage.setItem('pending_order_id', paymentData.order_id);
    localStorage.setItem('pending_order_timestamp', Date.now().toString());

    // Always add sandbox parameter in development mode
    if (isDevelopment) {
      console.log('Adding sandbox=true parameter for development mode');
      paymentData.sandbox = 'true';
    }

    // Generate a secure hash from the backend
    try {
      console.log('Generating secure hash for PayHere payment...');
      const hash = await generatePaymentHash(
        paymentData.order_id,
        paymentData.amount,
        paymentData.currency
      );

      if (hash) {
        console.log('Hash generated successfully');
        paymentData.hash = hash;
      } else {
        console.warn('Failed to generate hash, proceeding without it');
      }
    } catch (hashError) {
      console.error('Error generating hash:', hashError);
      // Continue without hash for testing, but log the error
    }

    // Create a form and submit it
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = PAYHERE_URL;

    // Don't use _blank as it can trigger popup blockers
    // form.target = '_blank';

    // Add a hidden field for the domain
    // This is to ensure PayHere recognizes the request is coming from an allowed domain
    const domainInput = document.createElement('input');
    domainInput.type = 'hidden';
    domainInput.name = 'domain';
    // Use hostname only (without protocol or port) for better compatibility with PayHere
    domainInput.value = window.location.hostname;
    console.log('Setting PayHere domain to:', window.location.hostname);
    form.appendChild(domainInput);

    // Log all form fields being added
    console.log('Adding form fields:');

    // Add form fields
    for (const key in paymentData) {
      if (paymentData[key] !== undefined) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData[key] as string;
        form.appendChild(input);

        // Log each field (except hash for security)
        if (key === 'hash') {
          console.log(`- ${key}: [HIDDEN FOR SECURITY]`);
        } else {
          console.log(`- ${key}: ${paymentData[key]}`);
        }
      }
    }

    // Append the form to the body
    document.body.appendChild(form);
    console.log('Form appended to document body, submitting...');

    // Submit the form
    form.submit();
    console.log('Form submitted');

    // Remove the form after submission
    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
        console.log('Form removed from document body');
      }
    }, 100);

    console.log('=== PayHere Payment Initiated ===');
  } catch (error) {
    console.error('Error initiating PayHere payment:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    throw error;
  }
}

/**
 * Check if a payment is pending
 *
 * @returns boolean indicating if there's a pending payment
 */
export function hasPendingPayment(): boolean {
  const pendingOrderId = localStorage.getItem('pending_order_id');
  const pendingOrderTimestamp = localStorage.getItem('pending_order_timestamp');

  if (!pendingOrderId || !pendingOrderTimestamp) {
    return false;
  }

  // Check if the pending order is less than 1 hour old
  const timestamp = parseInt(pendingOrderTimestamp, 10);
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  return now - timestamp < oneHour;
}

/**
 * Clear pending payment data
 */
export function clearPendingPayment(): void {
  localStorage.removeItem('pending_order_id');
  localStorage.removeItem('pending_order_timestamp');
}

export default {
  initiatePayment,
  generatePaymentHash,
  hasPendingPayment,
  clearPendingPayment,
  MERCHANT_ID,
  API_BASE_URL,
};
