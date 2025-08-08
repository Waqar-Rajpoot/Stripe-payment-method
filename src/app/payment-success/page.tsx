import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import Link from 'next/link';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', 
});

async function PaymentDetailsFetcher({ sessionId }: { sessionId: string }) {
  let mainMessage: string = 'Verifying your payment...';
  let subMessage: string = 'Please wait while we confirm your transaction.';
  let statusColor: string = 'text-blue-600'; 
  let icon: string = '⏳';
  let displayAmount: string | null = null;
  let showRetryButton: boolean = false;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      mainMessage = 'Payment session not found.';
      subMessage = 'There might have been an issue. Please contact support or try again.';
      statusColor = 'text-red-600';
      icon = '❌';
      showRetryButton = true;
    } else {
      const amountInCents = session.amount_total;
      if (amountInCents !== null) {
        displayAmount = (amountInCents / 100).toFixed(2);
      }

      switch (session.payment_status) {
        case 'paid':
          mainMessage = 'Payment Successful! 🎉';
          subMessage = `Thank you for your purchase. Amount: PKR ${displayAmount || 'N/A'}`;
          statusColor = 'text-green-600';
          icon = '✅';

          // --- IMPORTANT: Idempotent Order Fulfillment ---
          // This is the CRITICAL place to update your database and fulfill the order.
          // You MUST ensure this logic is IDEMPOTENT (runs only once per session.id).
          // Example pseudo-code (replace with your actual database logic):
          // const orderId = session.metadata?.order_id || session.id; // Use your order ID from metadata
          // const currentOrderStatus = await db.getOrderStatus(orderId);
          // if (currentOrderStatus !== 'fulfilled' && currentOrderStatus !== 'paid') {
          //   await db.updateOrderStatus(orderId, 'paid');
          //   await db.sendOrderConfirmationEmail(orderId);
          //   console.log(`SERVER: Order ${orderId} marked as PAID and FULFILLED.`);
          // } else {
          //   console.log(`SERVER: Order ${orderId} was already processed.`);
          // }
          // --- End Order Fulfillment ---

          console.log(`SERVER: Checkout Session ${session.id} status: ${session.payment_status}. Order ID: ${session.metadata?.order_id || 'N/A'}`);
          break;
        case 'unpaid':
          mainMessage = 'Payment Pending / Unpaid';
          subMessage = `Your payment for PKR ${displayAmount || 'N/A'} is awaiting completion. Please check your payment method or try again.`;
          statusColor = 'text-yellow-600';
          icon = '⏳';
          showRetryButton = true;
          console.log(`SERVER: Checkout Session ${session.id} status: ${session.payment_status}.`);
          // TODO: Update order status to 'pending' in your DB
          break;
        default:
          mainMessage = 'Payment Status Unknown';
          subMessage = 'There was an issue processing your payment. Please contact support.';
          statusColor = 'text-gray-500';
          icon = '❓';
          showRetryButton = true;
          console.log(`SERVER: Checkout Session ${session.id} has unknown payment status: ${session.payment_status}.`);
          break;
      }
    }
  } catch (error: any) {
    console.error('SERVER: Error retrieving Stripe Checkout Session:', error);
    mainMessage = 'An error occurred during payment verification.';
    subMessage = `Error details: ${error.message}. Please contact support.`;
    statusColor = 'text-red-600';
    icon = '🚫';
    showRetryButton = true;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md mx-auto text-center border border-indigo-100">
        <div className={`text-7xl mb-6 transform transition-transform duration-500 ease-out ${statusColor}`}>
          {icon}
        </div>
        <h1 className="text-4xl font-extrabold mb-3 text-gray-900 leading-tight">{mainMessage}</h1>
        <p className={`text-lg mb-6 ${statusColor.replace('text-', 'text-opacity-90 text-')}`}>{subMessage}</p>

        {displayAmount && statusColor === 'text-green-600' && (
          <div className="bg-green-50 p-4 rounded-xl text-green-800 text-4xl font-bold mb-8 border border-green-200 shadow-inner">
            Total Paid: PKR {displayAmount}
          </div>
        )}

        <div className="mt-8 space-y-4 md:space-y-0 md:space-x-4">
          <Link
            href="/"
            className="flex items-center justify-center w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg
                       hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
          {showRetryButton && (
            <Link
              href="/checkout" 
              className="inline-block w-full md:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-full shadow-md
                         hover:bg-blue-50 transition duration-300 transform hover:scale-105 active:scale-95"
            >
              Try Payment Again
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function PaymentSuccessPage({ // *** ADDED 'async' HERE ***
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  if (!sessionId) {
    redirect('/'); 
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
          <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md mx-auto text-center border border-indigo-100">
            <div className="text-7xl mb-6 text-blue-600 animate-pulse">⏳</div>
            <h1 className="text-4xl font-extrabold text-gray-900">Verifying Payment...</h1>
            <p className="text-gray-600 mt-3 text-lg">Please do not close this window.</p>
          </div>
        </div>
      }
    >
      <PaymentDetailsFetcher sessionId={sessionId} />
    </Suspense>
  );
}