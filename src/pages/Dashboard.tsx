import React, { useState, useEffect } from 'react';
import { format, isSameDay, isBefore } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import MonthlyDateBar from '@/components/WeeklyDateBar';
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
import { Separator } from '@/components/ui/separator';

interface UserData {
  habits: any[];
  events: any[];
  tasks: any[];
}

interface UserSettings {
  firstDayOfWeek: "sunday" | "monday";
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
  const [settings, setSettings] = useState<UserSettings>({ firstDayOfWeek: "sunday" });
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'habit' | 'event' | 'task'} | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchUserData = () => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      const userSettings = localStorage.getItem(`settings_${user.id}`);
      
      if (userData) {
        const parsedData: UserData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
      }
      
      if (userSettings) {
        const parsedSettings = JSON.parse(userSettings);
        setSettings({
          firstDayOfWeek: parsedSettings.firstDayOfWeek || "sunday"
        });
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 2000);
    return () => clearInterval(interval);
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

  const filterItems = (items: any[], selectedDate: Date, itemType: 'habit' | 'event' | 'task') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items
      .filter(item => {
        if (itemType === 'habit') {
          return true;
        } else {
          return item.date && isSameDay(new Date(item.date), selectedDate);
        }
      })
      .filter(item => {
        const itemStartDate = new Date(item.startDate || item.date);
        itemStartDate.setHours(0, 0, 0, 0);
        return !isBefore(selectedDate, itemStartDate);
      })
      .map(item => ({ 
        ...item, 
        itemType,
        isCompleted: itemType === 'habit' 
          ? item.completionDates?.some((dateStr: string) => 
              isSameDay(new Date(dateStr), selectedDate)
            ) || false
          : item.isCompleted || false,
        isLocked: isBefore(today, selectedDate)
      }));
  };
  
  const filteredHabits = filterItems(habits, selectedDate, 'habit');
  const filteredEvents = filterItems(events, selectedDate, 'event');
  const filteredTasks = filterItems(tasks, selectedDate, 'task');

  const toggleItemCompletion = (id: string, type: 'habit' | 'event' | 'task') => {
    const isItemLocked = (
      (type === 'habit' && filteredHabits.find(h => h.id === id)?.isLocked) ||
      (type === 'event' && filteredEvents.find(e => e.id === id)?.isLocked) ||
      (type === 'task' && filteredTasks.find(t => t.id === id)?.isLocked)
    );
    
    if (isItemLocked) {
      toast({
        title: "Cannot complete future items",
        description: "You cannot mark items as completed before their scheduled date.",
        variant: "destructive"
      });
      return;
    }
    
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

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg text-center">
      <p className="text-lg font-medium mb-2">You are Free Today!</p>
      <p className="text-muted-foreground">Maybe you can write a review.</p>
    </div>
  );

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
        <MonthlyDateBar 
          selectedDate={selectedDate} 
          onDateSelect={handleDateSelection}
          firstDayOfWeek={settings.firstDayOfWeek}
        />
      </div>

      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSameDay(selectedDate, new Date()) ? "Today's Habits" : `Habits for ${format(selectedDate, 'MMM d')}`}
          </h2>
        </div>

        {filteredHabits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHabits.map((item) => (
              <HabitCard
                key={`${item.itemType}-${item.id}`}
                title={item.title}
                description={item.description}
                category={item.category}
                streak={item.streak || 0}
                priority={item.priority}
                isCompleted={item.isCompleted}
                isOneTime={false}
                onClick={() => toggleItemCompletion(item.id, item.itemType)}
                onDelete={() => setItemToDelete({ id: item.id, type: item.itemType })}
                disabled={item.isLocked}
              />
            ))}
          </div>
        ) : renderEmptyState()}
      </div>

      <Separator className="my-8" />

      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSameDay(selectedDate, new Date()) ? "Today's Tasks" : `Tasks for ${format(selectedDate, 'MMM d')}`}
          </h2>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((item) => (
              <HabitCard
                key={`${item.itemType}-${item.id}`}
                title={item.title}
                description={item.description}
                category={item.category}
                streak={0}
                priority={item.priority}
                isCompleted={item.isCompleted}
                isOneTime={true}
                onClick={() => toggleItemCompletion(item.id, item.itemType)}
                onDelete={() => setItemToDelete({ id: item.id, type: item.itemType })}
                disabled={item.isLocked}
              />
            ))}
          </div>
        ) : renderEmptyState()}
      </div>

      <Separator className="my-8" />

      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isSameDay(selectedDate, new Date()) ? "Today's Events" : `Events for ${format(selectedDate, 'MMM d')}`}
          </h2>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((item) => (
              <HabitCard
                key={`${item.itemType}-${item.id}`}
                title={item.title}
                description={item.description}
                category={item.category}
                streak={0}
                priority={item.priority}
                isCompleted={item.isCompleted}
                isOneTime={true}
                onClick={() => toggleItemCompletion(item.id, item.itemType)}
                onDelete={() => setItemToDelete({ id: item.id, type: item.itemType })}
                disabled={item.isLocked}
              />
            ))}
          </div>
        ) : renderEmptyState()}
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
