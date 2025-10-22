"use client"
import Image from "next/image"
import Link from "next/link"
import { SignedIn,SignedOut, useUser , SignOutButton} from "@clerk/nextjs"
export default function NavBar(){
    const {isLoaded, isSignedIn, user} = useUser()
    return (<nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
                <div className=" max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href="/">
                        <Image className="text-xl font-bold text-emerald-700 cursor-pointer"
                        src="/logo.png" width={110} height={110} alt="Logo"/>
                    </Link>
                
                <div className="space-x-6 flex items-center font-mono">
                    {""}
                    <SignedIn>
                        <Link href="/mealplan" className="text-gray-700 hover:text-emerald-500 transition-colors">MealTrak</Link>
                        {user?.imageUrl ? (
                        <Link href="/profile"><Image src={user.imageUrl} alt="Profile Picture" height={40} width={40} className="rounded-full"/></Link>) 
                        :
                        (<div className="w-10 h-10 bg-gray-300 rounded-full"></div>) 
                    
                         }
                        <SignOutButton>
                            <button className="ml-4 px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition">
                                Sign Out
                            </button>
                        </SignOutButton>
                    </SignedIn>

                    <SignedOut>
                        <Link href="/" className="text-gray-700 hover:text-emerald-500 transition-colors">Home</Link>
                        <Link href={isSignedIn ? "/subscribe" : "/sign-up"} className="text-gray-700 hover:text-emerald-500 transition-colors">Subscribe</Link>
                        <Link href= "sign-up" className="px-4 py-2 text-emerald-600 rounded hover:bg-emerald-500 hover:text-white transition">Sign Up</Link>
                    </SignedOut>
                    </div>
                </div>
            </nav>
    )
}