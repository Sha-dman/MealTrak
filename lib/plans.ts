
export interface Plan{
    name:string
    amount: number
    currency:string
    interval:string
    isPopular?:boolean
    description:string
    features: string[]
}

export const availablePlans: Plan[]=[
    {
        name:"week",
        amount:9.99,
        currency:"USD",
        interval:"week",
        description:"Perfect for those who want basic AI meal planning",
        features:[
            "✓ Weekly AI meal plans",
            "✓ Basic nutrition breakdown"
        ]
    },
    {
        name:"month",
        amount:19.99,
        currency:"USD",
        isPopular:true,
        interval:"month",
        description:"Ideal for those who want smart, personalized nutrition.",
        features:[
            "✓ Everything in Starter",
            "✓ Custom calorie targets",
            "✓ Smart grocery lists"
        ]
    },
    {
        name:"year",
        amount:199.99,
        currency:"USD",
        interval:"year",
        description:"For fitness enthusiasts seeking total insight and control",
        features:[
            "✓ Everything in Pro",
            "✓ Advanced macro tracking",
            "✓ Weekly analytics"
        ]
    }
]
const priceIDMap: Record<string,string>={
    week:process.env.STRIPE_PRICE_WEEKLY!,
    month:process.env.STRIPE_PRICE_MONTHLY!,
    year:process.env.STRIPE_PRICE_YEARLY!
}
export const getPriceIDFromType= (planType:string) => priceIDMap[planType]