
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

// Define form types
export type ItemType = 'habit' | 'event' | 'task';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  priority: z.enum(['low', 'medium', 'high']),
  startDate: z.date(),
  recurrence: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'none']),
  estimatedMinutes: z.coerce.number().min(1).optional(),
  itemType: z.enum(['habit', 'event', 'task']),
});

// Define the type for form values
export type HabitFormValues = z.infer<typeof formSchema>;

// Update the interface to include defaultValues
interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HabitFormValues) => void;
  defaultValues?: {
    itemType?: ItemType;
    date?: Date;
  };
  title?: string;
}

const HabitForm: React.FC<HabitFormProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit,
  defaultValues,
  title
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
      itemType: 'habit',
    },
  });

  // Update form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.itemType) {
        form.setValue('itemType', defaultValues.itemType);
        
        // If it's a task or event, set recurrence to none
        if (defaultValues.itemType === 'task') {
          form.setValue('recurrence', 'none');
        }
      }
      
      if (defaultValues.date) {
        form.setValue('startDate', defaultValues.date);
      }
    }
  }, [defaultValues, form]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = (values: HabitFormValues) => {
    onSubmit(values);
    form.reset();
    onOpenChange(false);
  };

  const itemType = form.watch('itemType');
  
  // Get the form title based on item type
  const getFormTitle = () => {
    if (title) return title;
    
    switch(itemType) {
      case 'habit':
        return 'Create New Habit';
      case 'event':
        return 'Create New Event';
      case 'task':
        return 'Create New Task';
      default:
        return 'Create New Item';
    }
  };

  // Get the form description based on item type
  const getFormDescription = () => {
    switch(itemType) {
      case 'habit':
        return 'Add a new habit to track consistently.';
      case 'event':
        return 'Add an event to your calendar.';
      case 'task':
        return 'Add a task to your schedule.';
      default:
        return 'Fill in the details below.';
    }
  };

  // Generate recurrence options based on item type
  const getRecurrenceOptions = () => {
    if (itemType === 'habit') {
      return (
        <>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </>
      );
    } else {
      return (
        <>
          <SelectItem value="none">One-time</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getFormTitle()}</DialogTitle>
          <DialogDescription>
            {getFormDescription()}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{itemType === 'habit' ? 'Habit Name' : itemType === 'event' ? 'Event Name' : 'Task Name'}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={
                        itemType === 'habit' ? "Read a book" : 
                        itemType === 'event' ? "Team Meeting" : "Buy groceries"
                      } 
                      {...field} 
                    />
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
                      placeholder={
                        itemType === 'habit' ? "Read for at least 30 minutes before bed" : 
                        itemType === 'event' ? "Weekly team sync meeting" : "Get milk, eggs, and bread"
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
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
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
                    <FormLabel>{itemType === 'habit' ? 'Start Date' : 'Date'}</FormLabel>
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
                        {getRecurrenceOptions()}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                    How long you expect this {
                      itemType === 'habit' ? 'habit' : 
                      itemType === 'event' ? 'event' : 'task'
                    } to take (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden input for itemType */}
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <input 
                  type="hidden" 
                  value={field.value} 
                  onChange={(e) => {
                    field.onChange(e.target.value as ItemType);
                  }}
                />
              )}
            />

            <DialogFooter>
              <Button type="submit">
                {itemType === 'habit' ? 'Create Habit' : 
                 itemType === 'event' ? 'Create Event' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HabitForm;
