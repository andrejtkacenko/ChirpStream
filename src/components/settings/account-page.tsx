
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useState } from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Please confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;


function DeleteAccountDialog() {
    const { deleteCurrentUserAccount } = useAuth();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleDelete = async () => {
        if (!password) {
            toast({ title: "Password is required", variant: "destructive" });
            return;
        }
        setIsDeleting(true);
        try {
            await deleteCurrentUserAccount(password);
            toast({ title: "Account deleted", description: "Your account and all data have been permanently removed." });
            // The AuthContext will handle redirecting the user.
        } catch (error: any) {
             toast({
                title: "Error deleting account",
                description: error.message || "An unknown error occurred.",
                variant: "destructive",
            });
             setIsDeleting(false);
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account, posts, messages, and all associated data. To confirm, please enter your password.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                 <div className="py-2">
                    <Label htmlFor="delete-password">Password</Label>
                    <Input 
                        id="delete-password" 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setPassword("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete} 
                        disabled={isDeleting || !password}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function SettingsAccountPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
        mode: "onChange",
    });

    async function onSubmit(data: PasswordFormValues) {
        if (!user || !user.email) return;

        setIsSubmitting(true);

        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // Update password
            await updatePassword(user, data.newPassword);
            
            toast({
                title: "Password updated successfully!",
                description: "Your password has been changed.",
            });
            form.reset();
        } catch (error: any) {
            console.error("Password change error:", error);
            let errorMessage = "An unknown error occurred. Please try again.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = "The current password you entered is incorrect.";
                 form.setError("currentPassword", { type: "manual", message: errorMessage });
            } else if (error.code === 'auth/too-many-requests') {
                 errorMessage = "Too many attempts. Please try again later.";
            }
            
            toast({
                title: "Error changing password",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                        For your security, we recommend choosing a strong password that you don't use elsewhere.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                     <FormDescription>
                                        Must be at least 6 characters long.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Changing Password..." : "Change Password"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Delete Account</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all of your content. This action is not reversible.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DeleteAccountDialog />
                </CardContent>
            </Card>
        </div>
    )
}
