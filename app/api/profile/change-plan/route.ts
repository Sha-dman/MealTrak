import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getPriceIDFromType } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newPlan } = await request.json();
    if (!newPlan) {
      return NextResponse.json({ error: "New plan required!" }, { status: 400 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "No profile found" }, { status: 404 });
    }

    if (!profile.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    // ✅ Retrieve subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);

    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json({ error: "Subscription item not found" }, { status: 400 });
    }

    // ✅ Update the subscription with new plan
    const updatedSub = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscriptionItemId,
          price: getPriceIDFromType(newPlan),
        },
      ],
      proration_behavior: "create_prorations",
    });

    // ✅ Update your database
    const updatedProfile = await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updatedSub.id,
      },
    });

    return NextResponse.json({ subscription: updatedProfile });
  } catch (error: any) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
