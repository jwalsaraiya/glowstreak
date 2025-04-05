
import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import CalendarView from '@/components/CalendarView';
import WeeklyDateBar from '@/components/WeeklyDateBar';
import { Plus, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
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

interface UserData {
  habits: any[];
  events: any[];
}

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOneTimeTask, setIsOneTimeTask] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData: UserData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
      }
    }
  }, [user]);

  // Save user data to localStorage whenever habits or events change
  useEffect(() => {
    if (user) {
      const userData: UserData = {
        habits,
        events
      };
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData));
    }
  }, [habits, events, user]);

  const filteredHabits = habits.filter(habit => {
    if (habit.isOneTime) {
      return habit.dueDate && isSameDay(new Date(habit.dueDate), selectedDate);
    } else {
      return true;
    }
  });

  const habitsWithDateStatus = filteredHabits.map(habit => {
    const isCompletedOnSelectedDate = habit.completionDates?.some((dateStr: string) => 
      isSameDay(new Date(dateStr), selectedDate)
    ) || false;

    return {
      ...habit,
      isCompleted: isCompletedOnSelectedDate
    };
  });

  const calendarEvents = [
    ...habits.flatMap(habit => 
      habit.completionDates?.map((dateStr: string) => ({
        date: new Date(dateStr),
        type: 'habit' as const,
        title: habit.title,
        id: `habit-${habit.id}-${dateStr}`,
        isCompleted: true
      })) || []
    ),
    ...habits.filter(habit => habit.isOneTime).map(habit => ({
      date: new Date(habit.dueDate),
      type: 'habit' as const,
      title: habit.title,
      id: `habit-${habit.id}`,
      isCompleted: habit.completionDates?.some((dateStr: string) => 
        isSameDay(new Date(dateStr), new Date(habit.dueDate))
      )
    })),
    ...events.map(event => ({
      date: new Date(event.date),
      type: 'event' as const,
      title: event.title,
      id: `event-${event.id}`,
      isCompleted: event.isCompleted
    }))
  ];

  const handleCreateHabit = (values: any) => {
    const newId = habits.length > 0 
      ? Math.max(...habits.map(h => parseInt(h.id))) + 1 
      : 1;
    
    const newHabit = {
      id: newId.toString(),
      title: values.title,
      description: values.description || '',
      category: values.category,
      streak: 0,
      priority: values.priority,
      isCompleted: false,
      isOneTime: values.isOneTime,
      completionDates: [] as string[],
      ...(values.isOneTime ? { dueDate: values.startDate.toISOString() } : {})
    };

    setHabits([...habits, newHabit]);
    
    toast({
      title: values.isOneTime ? "Task Created" : "Habit Created",
      description: `${values.title} has been added to your ${values.isOneTime ? 'tasks' : 'habits'}.`,
    });
  };

  const handleCreateEvent = (values: any) => {
    const newId = events.length > 0 
      ? Math.max(...events.map(e => parseInt(e.id))) + 1 
      : 1;
    
    const newEvent = {
      id: newId.toString(),
      title: values.title,
      description: values.description || '',
      date: values.startDate.toISOString(),
      isCompleted: false
    };

    setEvents([...events, newEvent]);
    
    toast({
      title: "Event Created",
      description: `${values.title} has been added to your calendar.`,
    });
  };

  const toggleHabitCompletion = (id: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const dateStr = selectedDate.toISOString();
        const isCompleted = !habit.completionDates?.some((d: string) => 
          isSameDay(new Date(d), selectedDate)
        );
        
        return { 
          ...habit, 
          completionDates: isCompleted ? 
            [...(habit.completionDates || []), dateStr] : 
            (habit.completionDates || []).filter((d: string) => !isSameDay(new Date(d), selectedDate))
        };
      }
      return habit;
    }));
    
    toast({
      title: "Status Updated",
      description: "Your habit completion status has been updated.",
    });
  };

  const handleDeleteHabit = () => {
    if (habitToDelete) {
      setHabits(habits.filter(habit => habit.id !== habitToDelete));
      
      toast({
        title: "Habit Deleted",
        description: "The habit has been removed.",
      });
      setHabitToDelete(null);
    }
  };

  const openTaskForm = (isOneTime: boolean) => {
    setIsOneTimeTask(isOneTime);
    setIsFormOpen(true);
  };

  const handleDateSelection = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-4 md:mb-8 flex items-center justify-between flex-wrap gap-3 dashboard-header">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {user ? `Welcome, ${user.username}` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Weekly date bar */}
      <div className="mb-6">
        <WeeklyDateBar 
          selectedDate={selectedDate} 
          onDateSelect={handleDateSelection} 
        />
      </div>

      <div className="mb-6 md:mb-8">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 habit-grid">
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
            className="placeholder-card flex items-center justify-center h-full min-h-[140px] border-2"
            onClick={() => openTaskForm(false)}
          >
            <Plus className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-muted-foreground font-medium">Add New Habit</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
        <CalendarView 
          events={calendarEvents} 
          onDateSelect={handleDateSelection}
          selectedDate={selectedDate}
          onEventClick={(eventId) => {
            // Handle event click
            const habitId = eventId.startsWith('habit-') 
              ? eventId.split('-')[1] 
              : null;
            
            if (habitId) {
              const habit = habits.find(h => h.id === habitId);
              if (habit) {
                toggleHabitCompletion(habitId);
              }
            }
          }}
          onAddEvent={(date) => {
            setSelectedDate(date);
            openTaskForm(true);
          }}
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
