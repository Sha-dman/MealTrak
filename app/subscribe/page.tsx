"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { availablePlans } from "@/lib/plans"; // adjust import path if needed
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast,{Toaster} from "react-hot-toast"

type subscribeResponse={
  url: string
}
type subscribeError={
  error: string
}
async function subscribeToPlan(
  planType:string,
  userId:string,
  email:string
):Promise<subscribeResponse> {
  const response= await fetch("/api/checkout",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",

    },
    body:JSON.stringify({
      planType,
      userId,
      email,
    })
  })
  if(!response.ok){
    const errorData: subscribeError=await response.json()
    throw new Error(errorData.error || "Something went wrong")
  }
  const data : subscribeResponse = await response.json()
  return data
}
export default function Subscribe() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollProgress(scrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
    const {user} = useUser()
    const router = useRouter()
    const userId= user?.id
    const email = user?.emailAddresses[0].emailAddress||""
    const {mutate, isPending} = useMutation<subscribeResponse,Error,{planType:string}>({
      mutationFn: async({planType}) =>{
        if(!userId){throw new Error("User not signed in")}
        return subscribeToPlan(planType,userId,email)
      },
      onMutate: ()=>{
        toast.loading("Processing your subscription")
      },
      onSuccess: (data)=>{
        window.location.href = data.url
      },
      onError: (error)=>{
        toast.error("Something went wrong")
      },
    })

  function handleSubscribe(planType:string){
    if (!userId){
      router.push("/sign-up")
      return
    }

    mutate({planType})
  }
  return (
    <div className="relative font-mono bg-gradient-to-b from-white to-gray-50 min-h-screen">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <motion.div
          style={{ scaleX: scrollProgress / 100 }}
          className="origin-left h-1 bg-emerald-500"
        />
      </div>

      {/* Content */}
      <div className="px-6 py-16 md:px-16 lg:px-32 lg:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Subscribe & Save Time
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Pick a plan that fits your lifestyle and let AI handle the rest.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid gap-10 md:grid-cols-3">
          {availablePlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className={`bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-8 flex flex-col justify-between text-center ${
                plan.isPopular ? "ring-2 ring-emerald-400" : ""
              }`}
            >
              <div>
                <div className="h-2 w-16 mx-auto bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mb-6"></div>
                <h1 className="text-2xl font-bold text-gray-900">{plan.name}</h1>
                <p className="text-gray-500 mt-1 mb-4">{plan.description}</p>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">
                  ${plan.amount}
                  <span className="text-base font-medium text-gray-600">
                    /{plan.interval}
                  </span>
                </h1>

                <ul className="text-gray-700 space-y-2 text-center">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                {plan.isPopular && (
                  <p className="mt-4 text-emerald-600 font-semibold">
                    ⭐ Most Popular
                  </p>
                )}
              </div>

              
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-8 w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md"
                  onClick={() => handleSubscribe(plan.interval)}
                  disabled={isPending}
                >
                  {isPending ? "Please wait..." : `Subscribe ${plan.name}`}
                </motion.button>
              
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-20 text-gray-600"
        >
          <p>
            Need help choosing?{" "}
            <Link
              href="/contact"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Contact our team
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
