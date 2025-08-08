import StripeCheckOutButton from "./Checkout";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-indigo-100 text-gray-800">
      <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 text-center max-w-lg mx-auto">
        <h1 className="text-5xl font-extrabold mb-6 text-indigo-700 leading-tight">
          Welcome to the Store!
        </h1>
        <p className="text-lg mb-8 text-gray-600">
          Click the button below to proceed to our secure checkout for your amazing products.
        </p>
        <StripeCheckOutButton />
      </div>
    </main>
  );
}