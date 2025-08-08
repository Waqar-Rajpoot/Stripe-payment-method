// app/canceled/page.tsx
'use client'; // This is a Client Component for immediate client-side interactivity

import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-rose-50 to-red-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md mx-auto text-center border border-red-100">
        <div className="text-7xl mb-6 text-red-600">
          ❌
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">Payment Canceled</h1>
        <p className="text-lg text-red-600 mb-4">
          Your payment was canceled or did not complete successfully.
        </p>
        <p className="text-gray-600 mb-6">
          If this was unintentional, you can try checking out again.
        </p>

        <div className="flex justify-center flex-col mt-8 space-y-4 md:space-y-4">
          <Link
            href="/checkout" // Link back to your checkout page
            className="inline-block w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-full shadow-lg
                       hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Go to Checkout
          </Link>
          <Link
            href="/"
            className="inline-block w-full md:w-auto px-8 py-4 border-2 border-blue-600 text-blue-600 font-bold rounded-full shadow-md
                       hover:bg-blue-50 transition duration-300 transform hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}