
import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import CalendarView from '@/components/CalendarView';
import StreakAnalytics from '@/components/StreakAnalytics';
import { Plus, CalendarPlus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onCreateOneTime?: () => void;
}

const mockHabits = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness meditation',
    category: 'mindfulness',
    streak: 12,
    priority: 'high' as const,
    isCompleted: true,
    isOneTime: false,
    completionDates: [new Date(), new Date(new Date().setDate(new Date().getDate() - 1))]
  },
  {
    id: '2',
    title: 'Read a Book',
    description: 'Read for at least 30 minutes',
    category: 'learning',
    streak: 5,
    priority: 'medium' as const,
    isCompleted: false,
    isOneTime: false,
    completionDates: [new Date(new Date().setDate(new Date().getDate() - 1))]
  },
  {
    id: '3',
    title: 'Exercise',
    description: '30 minutes workout',
    category: 'fitness',
    streak: 8,
    priority: 'high' as const,
    isCompleted: false,
    isOneTime: false,
    completionDates: []
  },
  {
    id: '4',
    title: 'Drink Water',
    description: '8 glasses of water',
    category: 'health',
    streak: 15,
    priority: 'medium' as const,
    isCompleted: false,
    isOneTime: false,
    completionDates: [new Date(new Date().setDate(new Date().getDate() - 2))]
  },
  {
    id: '5',
    title: 'Dentist Appointment',
    description: 'Check up and cleaning',
    category: 'health',
    priority: 'high' as const,
    isCompleted: false,
    isOneTime: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
    completionDates: []
  },
];

const mockEvents = [
  {
    date: new Date(),
    type: 'habit' as const,
    title: 'Morning Meditation',
    id: 'event-1',
    isCompleted: true
  },
  {
    date: new Date(),
    type: 'habit' as const,
    title: 'Read a Book',
    id: 'event-2',
    isCompleted: false
  },
  {
    date: new Date(),
    type: 'event' as const,
    title: 'Meeting',
    id: 'event-3',
    isCompleted: false
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: 'habit' as const,
    title: 'Exercise',
    id: 'event-4',
    isCompleted: false
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    type: 'event' as const,
    title: 'Dentist',
    id: 'event-5',
    isCompleted: false
  },
];

const mockStreaks = [
  {
    name: 'Morning Meditation',
    currentStreak: 12,
    longestStreak: 15,
    completion: 90,
  },
  {
    name: 'Read a Book',
    currentStreak: 5,
    longestStreak: 7,
    completion: 75,
  },
  {
    name: 'Exercise',
    currentStreak: 8,
    longestStreak: 12,
    completion: 80,
  },
];

interface CalendarEvent {
  id: string;
  date: Date;
  type: 'habit' | 'event';
  title: string;
  isCompleted?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  selectedDate: propSelectedDate, 
  onDateSelect, 
  onCreateOneTime 
}) => {
  const [habits, setHabits] = useState(mockHabits);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOneTimeTask, setIsOneTimeTask] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(mockEvents);

  // Filter habits based on the selected date
  const filteredHabits = habits.filter(habit => {
    if (habit.isOneTime) {
      // For one-time tasks, check if the due date matches
      return habit.dueDate && isSameDay(habit.dueDate, selectedDate);
    } else {
      // For recurring habits, they should appear every day
      // Show as completed only if completed on the selected date
      return true;
    }
  });

  // Update habit completion status based on the selected date
  const habitsWithDateStatus = filteredHabits.map(habit => {
    const isCompletedOnSelectedDate = habit.completionDates?.some(date => 
      isSameDay(date, selectedDate)
    ) || false;

    return {
      ...habit,
      isCompleted: isCompletedOnSelectedDate
    };
  });

  const handleCreateHabit = (values: any) => {
    const newHabit = {
      id: (habits.length + 1).toString(),
      title: values.title,
      description: values.description || '',
      category: values.category,
      streak: 0,
      priority: values.priority,
      isCompleted: false,
      isOneTime: isOneTimeTask,
      completionDates: [] as Date[],
      ...(isOneTimeTask ? { dueDate: values.date || new Date() } : {})
    };

    setHabits([...habits, newHabit]);
    
    // Add to calendar events
    const newEvent = {
      id: `event-${calendarEvents.length + 1}`,
      date: isOneTimeTask ? (values.date || new Date()) : new Date(),
      type: 'habit' as const,
      title: values.title,
      isCompleted: false
    };
    
    setCalendarEvents([...calendarEvents, newEvent]);
    
    toast({
      title: isOneTimeTask ? "Task Created" : "Habit Created",
      description: `${values.title} has been added to your ${isOneTimeTask ? 'tasks' : 'habits'}.`,
    });
    setIsOneTimeTask(false);
  };

  const toggleHabitCompletion = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = !habit.completionDates?.some(date => isSameDay(date, selectedDate));
        
        return { 
          ...habit, 
          completionDates: isCompleted ? 
            [...(habit.completionDates || []), new Date(selectedDate)] : 
            (habit.completionDates || []).filter(date => !isSameDay(date, selectedDate))
        };
      }
      return habit;
    }));
    
    // Update calendar events
    setCalendarEvents(calendarEvents.map(event => {
      const relatedHabit = habits.find(h => h.title === event.title);
      if (relatedHabit && relatedHabit.id === id && isSameDay(event.date, selectedDate)) {
        return {
          ...event,
          isCompleted: !event.isCompleted
        };
      }
      return event;
    }));
  };

  const handleDeleteHabit = () => {
    if (habitToDelete) {
      const habitToRemove = habits.find(h => h.id === habitToDelete);
      setHabits(habits.filter(habit => habit.id !== habitToDelete));
      
      // Remove from calendar events
      setCalendarEvents(calendarEvents.filter(event => 
        event.title !== habitToRemove?.title
      ));
      
      toast({
        title: habitToRemove?.isOneTime ? "Task Deleted" : "Habit Deleted",
        description: `${habitToRemove?.title} has been removed.`,
      });
      setHabitToDelete(null);
    }
  };

  const openTaskForm = (isOneTime: boolean) => {
    if (isOneTime && onCreateOneTime) {
      onCreateOneTime();
    } else {
      setIsOneTimeTask(isOneTime);
      setIsFormOpen(true);
    }
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-4 md:mb-8 flex items-center justify-between flex-wrap gap-3 dashboard-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <p className="text-muted-foreground">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </div>
        
        {!isSameDay(selectedDate, new Date()) && (
          <Badge variant="outline" className="cursor-pointer" onClick={() => handleDateSelection(new Date())}>
            View Today
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">
              {isSameDay(selectedDate, new Date()) ? "Today's Activities" : `Activities for ${format(selectedDate, 'MMM d')}`}
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openTaskForm(true)}
                className="gap-1"
              >
                <CalendarPlus className="h-4 w-4" />
                {!isMobile && "One-time Task"}
              </Button>
              <Button
                size="sm"
                onClick={() => openTaskForm(false)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                {!isMobile && "New Habit"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 habit-grid">
            {habitsWithDateStatus.map((habit) => (
              <HabitCard
                key={habit.id}
                title={habit.title}
                description={habit.description}
                category={habit.category}
                streak={habit.streak || 0}
                priority={habit.priority}
                isCompleted={habit.isCompleted}
                isOneTime={habit.isOneTime}
                onClick={() => toggleHabitCompletion(habit.id)}
                onDelete={() => setHabitToDelete(habit.id)}
              />
            ))}
            <div 
              className="placeholder-card flex items-center justify-center h-full min-h-[140px]"
              onClick={() => openTaskForm(false)}
            >
              <Plus className="h-6 w-6 text-muted-foreground mb-2" />
              <span className="text-muted-foreground font-medium">Add New Habit</span>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
          <StreakAnalytics streaks={mockStreaks} />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
        <CalendarView 
          events={calendarEvents} 
          onDateSelect={handleDateSelection}
          selectedDate={selectedDate}
        />
      </div>

      <AlertDialog open={!!habitToDelete} onOpenChange={() => setHabitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHabit} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
