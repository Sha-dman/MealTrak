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
    const subscriptionId= profile.stripeSubscriptionId

    const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);
    const subscriptionItemId = subscription.items.data[0]?.id;
    if (!subscriptionItemId) {
      return NextResponse.json({ error: "Subscription item not found" }, { status: 400 });
    }
    const cancelledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
  
  
    // ✅ Update your database
    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive:false
      },
    });

    return NextResponse.json({ subscription: cancelledSubscription });
  } catch (error: any) {
    console.error("Subscription update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
