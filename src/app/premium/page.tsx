
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { updateUserPlan } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PremiumLayout } from "@/components/layout/premium-layout";

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

type Plan = 'premium' | 'premium_plus';

function PaymentForm({ onPaymentSuccess, planName, planPrice }: { onPaymentSuccess: () => void, planName: string, planPrice: string }) {
    const [isPaying, setIsPaying] = useState(false);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPaying(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsPaying(false);
        onPaymentSuccess();
    }

    return (
        <form onSubmit={handlePayment}>
            <DialogHeader>
                <DialogTitle>Upgrade to {planName}</DialogTitle>
                <DialogDescription>
                    You are about to be charged {planPrice}. Enter your card details below to complete the purchase.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
                <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input id="card-number" placeholder="1234 5678 9101 1121" defaultValue="4242 4242 4242 4242" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" defaultValue="12/28" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" defaultValue="123" />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" className="w-full" disabled={isPaying}>
                    {isPaying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPaying ? "Processing..." : `Pay ${planPrice}`}
                </Button>
            </DialogFooter>
        </form>
    )
}

function PremiumPageContent() {
    const { appUser, refreshAppUser } = useAuth();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleUpgrade = async () => {
        if (!appUser || !selectedPlan) return;
        setIsProcessing(true);
        try {
            await updateUserPlan(appUser.id, selectedPlan);
            await refreshAppUser();
            toast({ title: "Congratulations!", description: `You are now a ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} user.` });
        } catch (error) {
            console.error("Failed to upgrade plan:", error);
            toast({ title: "Upgrade failed.", description: "Could not update your plan.", variant: "destructive" });
        } finally {
            setIsProcessing(false);
            setSelectedPlan(null);
        }
    }

  return (
    <>
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
                           <Crown className="h-6 w-6 text-primary" />
                           <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        </div>
                        <CardDescription>
                            {plan.price}<span className="text-sm text-muted-foreground">{plan.priceDetails}</span>
                            <span className="ml-2 inline-block bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-semibold">{plan.discount}</span>
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
                        onClick={() => setSelectedPlan(plan.planId as Plan)}
                       >
                           {appUser?.plan === plan.planId ? "Current Plan" : "Upgrade"}
                       </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
    <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
           {selectedPlan && (
                <PaymentForm 
                    onPaymentSuccess={handleUpgrade}
                    planName={plans.find(p => p.planId === selectedPlan)?.name ?? ""}
                    planPrice={plans.find(p => p.planId === selectedPlan)?.price ?? ""}
                />
           )}
        </DialogContent>
    </Dialog>
    </>
  );
}

export default function PremiumPage() {
    return (
        <PremiumLayout>
            <PremiumPageContent />
        </PremiumLayout>
    )
}
