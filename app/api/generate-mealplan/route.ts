import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openAI = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

interface DailyMealPlan {
  Breakfast?: string;
  Lunch?: string;
  Dinner?: string;
  Snacks?: string;
}

// --- Utility: Extract valid JSON block safely ---
function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/); // finds the first {...} block
  if (!match) throw new Error("No JSON found in AI response");
  return match[0];
}

export async function POST(request: NextRequest) {
  if (!process.env.OPEN_ROUTER_API_KEY) {
    console.error("❌ Missing OPEN_ROUTER_API_KEY");
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const { dietType, calories, allergies, snacks, days, cuisine } =
      await request.json();

    const prompt = `
You are a professional nutritionist. Create a ${days}-day meal plan for an individual following a ${dietType} diet and aiming for ${calories} calories per day.
Allergies or restrictions: ${allergies || "none"}.
Preferred cuisines: ${cuisine || "none"}.
Snacks included: ${snacks ? "yes" : "no"}.
Use simple ingredients and provide basic instructions with approximate calorie counts.

Return ONLY valid JSON like this:
{
  "Monday": {
    "Breakfast": "Oatmeal with fruits - 300 calories",
    "Lunch": "Grilled Chicken Salad - 500 calories",
    "Dinner": "Steamed vegetables with rice - 200 calories",
    "Snacks": "Greek Yogurt - 150 calories"
  }
}
    `;

    const response = await openAI.chat.completions.create({
      model: "mistralai/mistral-7b-instruct:free", // ✅ Still a free OpenRouter model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiContent =
      response.choices?.[0]?.message?.content?.trim() ||
      "No response content from model";

    let parsedMealPlan: Record<string, DailyMealPlan>;

    try {
      // 🧹 Clean + extract only the JSON part
      const cleanJSON = extractJSON(
        aiContent
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim()
      );

      parsedMealPlan = JSON.parse(cleanJSON);
    } catch (err) {
      console.error("❌ Parse error:", err, "\nRaw content:", aiContent);
      return NextResponse.json(
        { error: "Parse error while processing AI response", raw: aiContent },
        { status: 500 }
      );
    }

    if (
      !parsedMealPlan ||
      typeof parsedMealPlan !== "object" ||
      Array.isArray(parsedMealPlan)
    ) {
      return NextResponse.json(
        { error: "Invalid format returned by AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ mealPlan: parsedMealPlan });
  } catch (error) {
    console.error("❌ Internal error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
