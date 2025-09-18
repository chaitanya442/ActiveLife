
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously } from "firebase/auth";
import { googleProvider, getAuth } from "@/lib/firebase";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { placeholderImages } from "@/lib/placeholder-images";
import Logo from "@/components/logo";

const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.022,35.244,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
  </svg>
);

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loginImage = placeholderImages.find(p => p.id === 'login-background');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });
  
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const auth = getAuth();
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Success!", description: "You've been signed in." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not sign in with Google. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsSubmitting(true);
    const auth = getAuth();
    try {
      await signInAnonymously(auth);
      toast({ title: "Welcome, Guest!", description: "You're signed in anonymously." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Anonymous sign-in error:", error);
      toast({
        variant: "destructive",
        title: "Guest Sign-in Failed",
        description: "Could not sign in as a guest. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const auth = getAuth();
    const { email, password } = values;

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Account Created!", description: "You've been successfully signed up." });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Signed In!", description: "Welcome back." });
      }
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Authentication error:", error);
      let description = "An unexpected error occurred.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        description = "Invalid email or password. Please try again or sign up.";
      } else if (error.code === 'auth/email-already-in-use') {
        description = "An account with this email already exists. Please sign in.";
      } else {
        description = error.message;
      }
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const textVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.3 } },
  };

  if (loading || user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="relative hidden h-full flex-col bg-muted text-white lg:flex">
        {loginImage && (
            <Image
                src={loginImage.imageUrl}
                alt="Login background"
                fill
                objectFit="cover"
                data-ai-hint={loginImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-zinc-900/60" />
        <div className="relative z-20 flex items-center p-8">
            <Logo className="text-white" />
        </div>
        <div className="relative z-20 mt-auto p-8">
          <div className="space-y-2 text-lg">
            <p className="font-semibold">"The only bad workout is the one that didn't happen."</p>
            <footer className="text-base font-medium text-zinc-300">- Anonymous</footer>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center min-h-[80px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? "signup" : "login"}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <h1 className="text-3xl font-bold font-headline">
                  {isSignUp ? "Create an account" : "Welcome back"}
                </h1>
                <p className="text-balance text-muted-foreground mt-2">
                  {isSignUp ? "Enter your details to get started" : "Enter your credentials to access your account"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                        <FormLabel>Password</FormLabel>
                        {!isSignUp && (
                            <Link
                                href="#"
                                className="ml-auto inline-block text-sm underline"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="animate-spin" /> : (isSignUp ? "Sign Up" : "Login")}
              </Button>
            </form>
          </Form>
           <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSubmitting}>
            <GoogleIcon />
              {isSignUp ? "Sign up with Google" : "Login with Google"}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleGuestSignIn} disabled={isSubmitting}>
             <User className="mr-2 h-4 w-4" />
             Continue as Guest
          </Button>

          <div className="mt-4 text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button onClick={() => {
                setIsSignUp(!isSignUp);
                form.reset();
                }} className="underline">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
