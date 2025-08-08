"use client";
import { useState, useMemo } from "react"; // Import useState and useMemo
import getStripePromise from "./lib/stripe"; // Assuming this path is correct
import toast, { Toaster } from "react-hot-toast"; // Import toast and Toaster
import { v4 as uuidv4 } from "uuid"; // Import uuid

const products = [
  {
    product: 1,
    name: "Shoes",
    price: 2000,
    quantity: 2,
  },
  {
    product: 2,
    name: "shirts",
    price: 1000,
    quantity: 3,
  },
  {
    product: 3,
    name: "Jeans",
    price: 6000,
    quantity: 3,
  },
];

const StripeCheckOutButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const idempotencyKey = useMemo(() => uuidv4(), []);

  const handleCheckout = async () => {
    setIsLoading(true);
    const loadingToastId = toast.loading("Initiating checkout...");

    try {
      const stripe = await getStripePromise();

      if (!stripe) {
        toast.error("Stripe failed to load. Please try again.", {
          id: loadingToastId,
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/stripe-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": idempotencyKey,
        },
        cache: "no-cache",
        body: JSON.stringify(products),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.sessionId) {
          toast.success("Redirecting to checkout...", { id: loadingToastId });
          stripe.redirectToCheckout({ sessionId: data.sessionId });
        } else {
          toast.error("Checkout session ID not received.", {
            id: loadingToastId,
          });
        }
      } else {
        const errorMessage =
          data.message || "Failed to initiate checkout. Please try again.";
        toast.error(errorMessage, { id: loadingToastId });
      }
    } catch (error: any) {
      toast.error(
        `An unexpected error occurred: ${
          error.message || "Please check your connection."
        }`,
        { id: loadingToastId }
      );
      console.error("Frontend checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-8 bg-gray-50 min-h-[200px]">
      {" "}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg
                   transition duration-300 ease-in-out transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
            Processing...
          </span>
        ) : (
          "Proceed to Checkout"
        )}
      </button>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default StripeCheckOutButton;
