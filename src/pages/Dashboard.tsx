
import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import WeeklyDateBar from '@/components/WeeklyDateBar';
import { CalendarPlus, Plus } from 'lucide-react';
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
  tasks: any[];
}

interface DashboardProps {
  onAddHabit: () => void;
  onAddTask: () => void;
  onAddEvent: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onAddHabit,
  onAddTask,
  onAddEvent,
  onDateSelect,
  selectedDate
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'habit' | 'event' | 'task'} | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData: UserData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const userData: UserData = {
        habits,
        events,
        tasks
      };
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(userData));
    }
  }, [habits, events, tasks, user]);

  // Filter items for the selected date
  const filteredItems = [
    ...habits.map(habit => ({ ...habit, itemType: 'habit' as const })),
    ...events
      .filter(event => event.date && isSameDay(new Date(event.date), selectedDate))
      .map(event => ({ ...event, itemType: 'event' as const })),
    ...tasks
      .filter(task => task.date && isSameDay(new Date(task.date), selectedDate))
      .map(task => ({ ...task, itemType: 'task' as const }))
  ];

  const itemsWithCompletionStatus = filteredItems.map(item => {
    const isCompletedOnSelectedDate = item.completionDates?.some((dateStr: string) => 
      isSameDay(new Date(dateStr), selectedDate)
    ) || false;

    return {
      ...item,
      isCompleted: isCompletedOnSelectedDate
    };
  });

  const toggleItemCompletion = (id: string, type: 'habit' | 'event' | 'task') => {
    if (type === 'habit') {
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
    } else if (type === 'event') {
      setEvents(events.map(event => {
        if (event.id === id) {
          return { ...event, isCompleted: !event.isCompleted };
        }
        return event;
      }));
    } else {
      setTasks(tasks.map(task => {
        if (task.id === id) {
          return { ...task, isCompleted: !task.isCompleted };
        }
        return task;
      }));
    }
    
    toast({
      title: "Status Updated",
      description: "Your completion status has been updated.",
    });
  };

  const handleDeleteItem = () => {
    if (itemToDelete) {
      const { id, type } = itemToDelete;
      
      if (type === 'habit') {
        setHabits(habits.filter(habit => habit.id !== id));
      } else if (type === 'event') {
        setEvents(events.filter(event => event.id !== id));
      } else {
        setTasks(tasks.filter(task => task.id !== id));
      }
      
      toast({
        title: "Item Deleted",
        description: `The ${type} has been removed.`,
      });
      setItemToDelete(null);
    }
  };

  const handleDateSelection = (date: Date) => {
    onDateSelect(date);
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
              onClick={onAddTask}
              className="gap-1"
            >
              <CalendarPlus className="h-4 w-4" />
              {!isMobile && "One-time Task"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={onAddEvent}
              className="gap-1"
            >
              <CalendarPlus className="h-4 w-4" />
              {!isMobile && "New Event"}
            </Button>
            <Button
              size="sm"
              onClick={onAddHabit}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              {!isMobile && "New Habit"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 habit-grid">
          {itemsWithCompletionStatus.map((item) => (
            <HabitCard
              key={`${item.itemType}-${item.id}`}
              title={item.title}
              description={item.description}
              category={item.category}
              streak={item.streak || 0}
              priority={item.priority}
              isCompleted={item.isCompleted}
              isOneTime={item.itemType !== 'habit'}
              onClick={() => toggleItemCompletion(item.id, item.itemType)}
              onDelete={() => setItemToDelete({ id: item.id, type: item.itemType })}
            />
          ))}
          <div 
            className="placeholder-card flex items-center justify-center h-full min-h-[140px] border-2"
            onClick={onAddHabit}
          >
            <Plus className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-muted-foreground font-medium">Add New Habit</span>
          </div>
        </div>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
