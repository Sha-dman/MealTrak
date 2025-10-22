"use client";

import { useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/spinner";
import { Toaster, toast } from "react-hot-toast";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
import { motion } from "framer-motion";
import { useState } from "react";

async function fetchSubscription() {
  const response = await fetch("/api/profile/subscription-status");
  return response.json();
}

async function unsubscribe() {
  const response = await fetch("/api/profile/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return response.json();
}

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    data: subscription,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscription,
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const currentPlan = availablePlans.find(
    (plan) =>
      plan.interval.toLowerCase() ===
      subscription?.subscription?.subscriptionTier?.toLowerCase()
  );

  const { mutate: unsubscribeMutate, isPending: isUnsubscribing } = useMutation({
    mutationFn: unsubscribe,
    onSuccess: (data) => {
      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success("Subscription canceled successfully!");
      }
    },
    onError: () => {
      toast.error("Failed to cancel subscription. Please try again.");
    },
  });

  function handleUnsubscribe() {
    if (!isConfirming) {
      setIsConfirming(true);
      setTimeout(() => setIsConfirming(false), 5000);
      return;
    }
    unsubscribeMutate();
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner /> <span className="ml-2 text-gray-700">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700">
        <p>Please sign in!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen w-full bg-gray-50 flex flex-col items-center px-4 py-8 font-mono"
    >
      <Toaster position="top-center" />

      {/* Profile Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6 flex flex-col items-center">
        {user?.imageUrl && (
          <Image
            src={user.imageUrl}
            alt="Profile picture"
            width={120}
            height={120}
            className="rounded-full"
          />
        )}
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-gray-600">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>

      {/* Subscription Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Subscription Details
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            <Spinner /> <span>Loading Details...</span>
          </div>
        ) : isError ? (
          <p className="text-red-500 text-center">{error.message}</p>
        ) : subscription ? (
          currentPlan ? (
            <div className="space-y-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {currentPlan.name.toUpperCase()} PLAN
              </p>
              <p className="text-lg font-semibold text-emerald-600">
                ${currentPlan.amount} {currentPlan.currency}
              </p>
              <p className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                ACTIVE
              </p>
              <p className="mt-2 text-gray-600">{currentPlan.description}</p>
            </div>
          ) : (
            <p className="text-gray-700 text-center">Plan not found</p>
          )
        ) : (
          <p className="text-gray-700 text-center">Not Subscribed</p>
        )}

        {/* Unsubscribe Section */}
        {currentPlan && (
          <div className="mt-8 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Cancel Subscription
            </h3>

            <button
              onClick={handleUnsubscribe}
              disabled={isUnsubscribing}
              className={`mt-4 ${
                isConfirming
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gray-800 hover:bg-gray-900"
              } text-white px-5 py-2 rounded-lg font-semibold transition disabled:opacity-60`}
            >
              {isUnsubscribing
                ? "Unsubscribing..."
                : isConfirming
                ? "Click again to confirm"
                : "Unsubscribe"}
            </button>

            {isUnsubscribing && (
              <div className="flex justify-center mt-3 text-gray-600">
                <Spinner /> <span className="ml-2">Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
