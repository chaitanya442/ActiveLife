
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StoredPlan, WorkoutLog } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const logSchema = z.object({
  date: z.date({
    required_error: 'A date for the workout is required.',
  }),
  workoutFocus: z.string().min(1, 'Please select a workout focus.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  notes: z.string().optional(),
});

type LogFormData = z.infer<typeof logSchema>;

interface LogWorkoutDialogProps {
  plan: StoredPlan | undefined;
  children: React.ReactNode;
  onLogSaved: (log: WorkoutLog) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogWorkoutDialog({
  plan,
  children,
  onLogSaved,
  open,
  onOpenChange,
}: LogWorkoutDialogProps) {
  const { toast } = useToast();

  const form = useForm<LogFormData>({
    resolver: zodResolver(logSchema),
    defaultValues: {
      date: new Date(),
      workoutFocus: '',
      duration: 0,
      notes: '',
    },
  });

  const onSubmit = (data: LogFormData) => {
    if (!plan) return;

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      planId: plan.id,
      date: data.date.toISOString(),
      workoutFocus: data.workoutFocus,
      duration: data.duration,
      notes: data.notes || '',
    };

    onLogSaved(newLog);
    toast({
      title: 'Workout Logged!',
      description: 'Your progress has been updated.',
    });
    form.reset({ date: new Date(), workoutFocus: '', duration: 0, notes: '' });
    onOpenChange(false);
  };

  const workoutOptions = Array.isArray(plan?.plan.exercisePlan)
    ? [...new Set(plan.plan.exercisePlan.map((day) => day.focus))]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log a New Workout</DialogTitle>
          <DialogDescription>
            Record your activity to keep track of your progress.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="workoutFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout Focus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a workout focus from your plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {workoutOptions.map((focus) => (
                        <SelectItem key={focus} value={focus}>
                          {focus}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Felt strong today, increased weight on squats.'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Log
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
