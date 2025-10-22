import { getPriceIDFromType } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request:NextRequest) {
    try{
    const {planType,userId, email} = await request.json()

    if (!planType||!userId||!email){
        return NextResponse.json(
            {error:"Plantype, userID, and email are required"},
            {status:400}
            )
    }
    const allowedPlan  =['week','month','year']

    if(!allowedPlan.includes(planType)){
        return NextResponse.json(
            {error:"invalid plan type"},
            {status:400}
            )
    }
    const priceID  = getPriceIDFromType(planType)
    if (!priceID){
        return NextResponse.json(
            {error:"invalid priceID"},
            {status:400}
            )

    }
    const session = await stripe.checkout.sessions.create(
        {
            payment_method_types:["card"],
            line_items:[
                {
                    price:priceID,
                    quantity:1,

                }
            ],
            customer_email:email,
            mode:"subscription",
            metadata:{
                clerkUserId:userId,planType
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,            
        }
    )
    return NextResponse.json({url:session.url})
}catch(error:any){
    return NextResponse.json({error:"internal server error"}, {status:500})
}
}