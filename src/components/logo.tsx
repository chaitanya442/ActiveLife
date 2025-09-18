import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-xl font-bold font-headline text-foreground",
        className
      )}
    >
      <Dumbbell className="h-6 w-6 text-primary" />
      <span>ActiveLife</span>
    </Link>
  );
}
