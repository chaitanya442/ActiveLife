
'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Dumbbell,
  HeartPulse,
  BrainCircuit,
  CheckCircle2,
  Telescope,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { placeholderImages } from '@/lib/placeholder-images';
import Logo from '@/components/logo';
import { useAuth } from '@/components/providers/auth-provider';

export default function Home() {
  const { user, loading } = useAuth();
  const heroImage = placeholderImages.find((img) => img.id === 'hero-1');

  const FADE_IN_ANIMATION_SETTINGS = {
    initial: { opacity: 0, y: 10 },
    animate: 'enter',
    exit: { opacity: 0, y: 10 },
    variants: {
      enter: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 0.5,
          ease: 'easeOut',
        },
      }),
    },
  };

  const getStartedLink = loading ? '#' : user ? '/dashboard' : '/onboarding';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm">
        <Logo />
        <nav className="ml-auto flex gap-4 sm:gap-6">
          {loading ? null : user ? (
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/onboarding">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <motion.div
                  initial="initial"
                  whileInView="enter"
                  viewport={{ once: true }}
                  variants={{
                    enter: {
                      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
                    },
                  }}
                  className="space-y-4"
                >
                  <motion.h1
                    variants={FADE_IN_ANIMATION_SETTINGS}
                    className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline"
                  >
                    Your Personal AI Fitness Partner
                  </motion.h1>
                  <motion.p
                    variants={FADE_IN_ANIMATION_SETTINGS}
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                  >
                    ActiveLife creates truly personalized workout plans based on
                    your unique physiology, goals, and medical history.
                  </motion.p>
                </motion.div>
                <motion.div
                    variants={FADE_IN_ANIMATION_SETTINGS}
                    className="flex flex-col gap-4 min-[400px]:flex-row"
                >
                  <div className='flex flex-col gap-2'>
                    <p className='text-sm text-muted-foreground'>Stop following generic workout routines. ActiveLife's AI analyzes your unique data to build a safe and effective plan that's tailored just for you.</p>
                    <Button size="lg" asChild>
                      <Link href={getStartedLink}>
                        Generate Your Free Plan
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              </div>
              {heroImage && (
                <motion.div variants={FADE_IN_ANIMATION_SETTINGS}>
                  <Image
                    src={heroImage.imageUrl}
                    width={600}
                    height={400}
                    alt="Hero"
                    data-ai-hint={heroImage.imageHint}
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
                  />
                </motion.div>
              )}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">
                  The ActiveLife System
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">
                  Personalized Exercise Prescription
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our core mission is to build a tool that generates tailored workout programs based on medical history, ensuring a safe and effective fitness journey for every user.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 lg:max-w-none mt-12">
                <FeatureCard
                  icon={<Telescope className="h-8 w-8 text-primary" />}
                  title="Risk Stratification"
                  description="We use a combination of rules and machine learning models to analyze your medical history and assess potential risks, ensuring your plan is safe."
                />
                <FeatureCard
                  icon={<Activity className="h-8 w-8 text-primary" />}
                  title="Dynamic Adjustments"
                  description="Your plan isn't static. It evolves with you. We dynamically adjust intensity and duration based on your feedback and progress."
                />
                <FeatureCard
                  icon={<BrainCircuit className="h-8 w-8 text-primary" />}
                  title="Performance Monitoring"
                  description="Integrate with your favorite wearables to automatically track performance, giving our AI the data it needs to optimize your routine."
                />
                <FeatureCard
                  icon={<ShieldAlert className="h-8 w-8 text-primary" />}
                  title="Progress Tracking & Safety Alerts"
                  description="Stay motivated with clear progress visualizations and receive timely alerts if any activity might conflict with your health profile."
                />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} ActiveLife. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="grid gap-2">
    <div className="flex items-center gap-4">
      {icon}
      <h3 className="text-xl font-bold font-headline">{title}</h3>
    </div>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
