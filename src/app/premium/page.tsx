
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Crown } from "lucide-react";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const plans = [
  {
    name: "Premium",
    price: "$7",
    priceDetails: "/ month, billed annually",
    discount: "SAVE 12%",
    features: [
        "Small reply boost",
        "Bookmark Folders",
        "Highlights Tab",
        "Edit Post",
        "Longer Posts (1,000 chars)",
        "Half the ads in For You and Following feeds",
        "Get paid to post",
        "Checkmark",
    ],
    planId: "premium",
  },
  {
    name: "Premium+",
    price: "$14",
    priceDetails: "/ month, billed annually",
    discount: "SAVE 16%",
    features: [
        "Everything in Premium, and...",
        "No ads in For You and Following feeds",
        "Largest reply boost",
        "Grok with increased limits",
        "X Pro, Analytics, Media Studio",
        "Creator Subscriptions",
        "Longer Posts (4,000 chars)",
    ],
    planId: "premium_plus",
  },
];


function PremiumPageContent() {
    const { appUser, refreshAppUser } = useAuth();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUpgrade = async (planId: 'premium' | 'premium_plus') => {
        if (!appUser) return;
        setIsProcessing(true);
        try {
            await updateUserPlan(appUser.id, planId);
            await refreshAppUser();
            toast({ title: "Congratulations!", description: `You are now a ${planId.charAt(0).toUpperCase() + planId.slice(1)} user.` });
        } catch (error) {
            console.error("Failed to upgrade plan:", error);
            toast({ title: "Upgrade failed.", description: "Could not update your plan.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    }


  return (
    <div className="p-4 md:p-6">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">Choose Your Premium Experience</h1>
            <p className="text-muted-foreground mt-2 text-lg">Unlock exclusive features and enhance your ChirpStream experience.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
                <Card key={plan.name} className="flex flex-col">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                           <Crown className={`h-6 w-6 ${plan.name === 'Premium+' ? 'text-purple-400' : 'text-amber-400'}`} />
                           <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        </div>
                        <CardDescription>
                            {plan.price}<span className="text-sm text-muted-foreground">{plan.priceDetails}</span>
                            <span className="ml-2 inline-block bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">{plan.discount}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col">
                       <ul className="space-y-3 text-sm flex-grow">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                       </ul>
                       <Button 
                        className="w-full mt-6"
                        disabled={isProcessing || appUser?.plan === plan.planId || (appUser?.plan === 'premium_plus' && plan.planId === 'premium')}
                        onClick={() => handleUpgrade(plan.planId as 'premium' | 'premium_plus')}
                       >
                           {appUser?.plan === plan.planId ? "Current Plan" : "Upgrade"}
                       </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}

export default function PremiumPage() {
    return (
        <ProtectedRoute>
            <PremiumPageContent />
        </ProtectedRoute>
    )
}
