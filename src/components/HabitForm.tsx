
import React, { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Habit name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.date(),
  recurrence: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  estimatedMinutes: z.coerce.number().min(1).optional(),
  isOneTime: z.boolean().optional(),
});

// Define the type for form values
export type HabitFormValues = z.infer<typeof formSchema>;

// Update the interface to include defaultValues
interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HabitFormValues) => void;
  defaultValues?: {
    isOneTime?: boolean;
    date?: Date;
  };
}

const HabitForm: React.FC<HabitFormProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  defaultValues 
}) => {
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      startDate: new Date(),
      recurrence: 'daily',
      isOneTime: false,
    },
  });

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.isOneTime !== undefined) {
        form.setValue('isOneTime', defaultValues.isOneTime);
        // If it's a one-time task, set recurrence to custom
        if (defaultValues.isOneTime) {
          form.setValue('recurrence', 'custom');
        }
      }
      
      if (defaultValues.date) {
        form.setValue('startDate', defaultValues.date);
      }
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: HabitFormValues) => {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
  };

  const isOneTime = form.watch('isOneTime');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isOneTime ? 'Create One-time Task' : 'Create New Habit'}</DialogTitle>
          <DialogDescription>
            {isOneTime 
              ? 'Add a one-time task to your schedule.' 
              : 'Add a new habit to track. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isOneTime ? 'Task Name' : 'Habit Name'}</FormLabel>
                  <FormControl>
                    <Input placeholder={isOneTime ? "Buy groceries" : "Read a book"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={isOneTime 
                        ? "Get milk, eggs, and bread" 
                        : "Read for at least 30 minutes before bed"
                      }
                      className="resize-none h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="health">Health</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="learning">Learning</SelectItem>
                        <SelectItem value="productivity">Productivity</SelectItem>
                        <SelectItem value="mindfulness">Mindfulness</SelectItem>
                        <SelectItem value="creativity">Creativity</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{isOneTime ? 'Date' : 'Start Date'}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
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
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isOneTime && (
                <FormField
                  control={form.control}
                  name="recurrence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurrence</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="estimatedMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time (minutes)</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="w-20"
                        {...field}
                      />
                    </FormControl>
                    <Clock className="ml-2 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormDescription>
                    How long you expect this {isOneTime ? 'task' : 'habit'} to take (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fix for the TypeScript error - convert boolean to string */}
            <FormField
              control={form.control}
              name="isOneTime"
              render={({ field }) => (
                <input 
                  type="hidden" 
                  value={field.value ? "true" : "false"} 
                  onChange={(e) => {
                    field.onChange(e.target.value === "true");
                  }}
                />
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {isOneTime ? 'Create Task' : 'Create Habit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
