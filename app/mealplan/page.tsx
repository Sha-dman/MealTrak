"use client";

import React from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/spinner";

interface MealPlanInput {
  dietType: string;
  calories: number;
  allergies: string;
  cuisine: string;
  snacks: string;
  days?: number;
}

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
  mealPlan?: WeeklyMealPlan;
  error?: string;
}

async function generatePlan(payload: MealPlanInput) {
  const response = await fetch("/api/generate-mealplan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
}

export default function MealTracDash() {
  const { mutate, isPending, data } = useMutation<
    MealPlanResponse,
    Error,
    MealPlanInput
  >({
    mutationFn: generatePlan,
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload: MealPlanInput = {
      dietType: formData.get("dietType")?.toString() || "",
      calories: Number(formData.get("calories")) || 2000,
      allergies: formData.get("allergies")?.toString() || "",
      cuisine: formData.get("cuisine")?.toString() || "",
      snacks: formData.get("snacks") ? "Yes" : "No",
      days: 7,
    };

    mutate(payload);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center font-mono px-4"
    >
      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-md border border-gray-200 p-8"
      >
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold mb-6 text-center text-gray-800"
        >
          🍽️ AI Meal Generator
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              id: "dietType",
              label: "Diet Type",
              placeholder: "e.g. Vegetarian, Vegan, Keto, Carnivore",
              type: "text",
            },
            {
              id: "calories",
              label: "Daily Calorie Goal",
              placeholder: "e.g. 2000",
              type: "number",
            },
            {
              id: "allergies",
              label: "Allergies",
              placeholder: "e.g. Nuts, Dairy, Seed, or None",
              type: "text",
            },
            {
              id: "cuisine",
              label: "Cuisine Preferences",
              placeholder: "e.g. Mediterranean, Asian, Mexican",
              type: "text",
            },
          ].map((field) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label
                htmlFor={field.id}
                className="block text-sm font-semibold text-gray-700 mb-1"
              >
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                required
                placeholder={field.placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:outline-none placeholder-gray-600 text-gray-900"
              />
            </motion.div>
          ))}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="snacks"
              name="snacks"
              className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-400"
            />
            <label htmlFor="snacks" className="text-sm text-gray-700">
              Include Snacks?
            </label>
          </div>

          <motion.div className="pt-4">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 0px 10px rgba(16, 185, 129, 0.5)",
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200 }}
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg transition duration-200 shadow-sm disabled:opacity-70 flex items-center justify-center"
            >
              {isPending ? (
                <>
                  Generating...
                  <Spinner />
                </>
              ) : (
                "Generate Meals"
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: data ? 1 : 0, y: data ? 0 : 10 }}
        transition={{ duration: 0.6 }}
        className={`w-full max-w-lg mt-10 space-y-4 ${
          data ? "visible" : "invisible"
        }`}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
          Weekly Meal Plan
        </h2>

        {data?.error && (
          <p className="text-red-500 text-sm text-center">{data.error}</p>
        )}

        {data?.mealPlan ? (
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(data.mealPlan).map(([day, meals]) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-emerald-700 mb-3">{day}</h3>
                <div className="flex flex-col space-y-1 text-sm">
                  {Object.entries(meals).map(([mealType, meal]) => {
                    let colorClass = "";
                    switch (mealType) {
                      case "Breakfast":
                        colorClass = "text-yellow-600";
                        break;
                      case "Lunch":
                        colorClass = "text-blue-600";
                        break;
                      case "Dinner":
                        colorClass = "text-red-600";
                        break;
                      case "Snacks":
                        colorClass = "text-green-600";
                        break;
                      default:
                        colorClass = "text-gray-900";
                    }

                    return (
                      <div
                        key={mealType}
                        className="flex justify-between items-center border-b border-gray-200 pb-1"
                      >
                        <span className={`font-medium ${colorClass}`}>{mealType}:</span>
                        <span className="text-gray-800 text-right">{meal || "—"}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center">
            Your personalized meal plan will appear here after generation.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
