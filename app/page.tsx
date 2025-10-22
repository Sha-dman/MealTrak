"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
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

  const steps = [
    {
      title: "Create Your Account",
      desc: "Sign up and access your personalized meal plans.",
      img: "/acc.jpg",
    },
    {
      title: "Set Your Goals",
      desc: "Tell us your preferences and goals to tailor your plans.",
      img: "/pers.jpg",
    },
    {
      title: "Receive Your Meal Plan",
      desc: "Get your meal plans delivered to your account weekly.",
      img: "/check.jpg",
    },
  ];

  return (
    <div className="relative font-mono">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-50 bg-gray-200">
        <motion.div
          style={{ scaleX: scrollProgress / 100 }}
          className="origin-left h-1 bg-emerald-500"
        />
      </div>

      <div className="px-6 py-12 md:px-16 lg:px-32 lg:py-20 bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-gray-900">
            Curated Mealplans, All Made by AI
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Let our AI do the heavy lifting for your goals and needs. Focus on
            the cooking — we’ll handle the planning!
          </p>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md"
            >
              Get Started
            </motion.button>
          </Link>
        </motion.div>

        {/* Section Header */}
        <motion.h2
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold mt-20 mb-10 border-b-2 border-gray-200 pb-3 text-gray-800 "
        >
          How it Works
        </motion.h2>

        {/* Steps in F-Layout */}
        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="flex flex-col sm:flex-row sm:items-center gap-6"
            >
              <motion.div whileHover={{ rotate: 6, scale: 1.1 }} className="relative">
                <Image
                  src={step.img}
                  alt={step.title}
                  width={70}
                  height={70}
                  className="rounded-full shadow-lg ring-2 ring-emerald-200"
                />
                <span className="absolute -top-2 -left-2 bg-emerald-500 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full shadow">
                  {i + 1}
                </span>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600 mt-1">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
