import React, { useState, useEffect } from 'react';
import { format, isSameDay, isBefore, differenceInDays, differenceInCalendarDays, addDays, isSameMonth, isSameWeek, isSameYear } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import WeeklyDateBar from '@/components/WeeklyDateBar';
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

  const calculateStreak = (completionDates: string[], itemType: string, recurrence: string = 'none', startDateStr: string | undefined = undefined) => {
    if (itemType !== 'habit' || !completionDates || completionDates.length === 0) return 0;
    
    const sortedDates = [...completionDates].map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = startDateStr ? new Date(startDateStr) : sortedDates[0];
    const mostRecentDate = new Date(sortedDates[sortedDates.length - 1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if today or yesterday has a completion
    const todayHasCompletion = sortedDates.some(d => isSameDay(d, today));
    const yesterdayHasCompletion = sortedDates.some(d => isSameDay(d, addDays(today, -1)));
    
    // If neither today nor yesterday has a completion, streak is broken
    if (!todayHasCompletion && !yesterdayHasCompletion) {
      return 0;
    }
    
    // For daily habits, check for consecutive days
    if (recurrence === 'daily') {
      let streak = 1;
      let checkDate = todayHasCompletion ? today : addDays(today, -1);
      
      for (let i = 1; i < 1000; i++) {
        const prevDate = addDays(checkDate, -1);
        
        // Check if the previous day has a completion
        const hasCompletion = sortedDates.some(d => isSameDay(d, prevDate));
        if (hasCompletion) {
          streak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
      
      return streak;
    }
    
    // For weekly habits (check same day of week)
    else if (recurrence === 'weekly') {
      let streak = 1;
      let checkDate = todayHasCompletion ? today : addDays(today, -1);
      let currentWeek = format(checkDate, 'yyyy-ww');
      let weekCount = 1;
      
      // Go back through sorted dates and count consecutive weeks
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const dateWeek = format(sortedDates[i], 'yyyy-ww');
        
        // If it's an older week and it has the same weekday
        if (dateWeek !== currentWeek && sortedDates[i].getDay() === checkDate.getDay()) {
          const weekDiff = differenceInDays(checkDate, sortedDates[i]) / 7;
          // If weeks are consecutive
          if (Math.round(weekDiff) === weekCount) {
            streak++;
            weekCount++;
            currentWeek = dateWeek;
            checkDate = sortedDates[i];
          } else {
            break;
          }
        }
      }
      
      return streak;
    }
    
    // For monthly habits (check same day of month)
    else if (recurrence === 'monthly') {
      let streak = 1;
      let checkDate = todayHasCompletion ? today : addDays(today, -1);
      let currentMonth = format(checkDate, 'yyyy-MM');
      let monthCount = 1;
      
      // Go back through sorted dates and count consecutive months
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const dateMonth = format(sortedDates[i], 'yyyy-MM');
        
        // If it's an older month and it has the same day of the month
        if (dateMonth !== currentMonth && sortedDates[i].getDate() === checkDate.getDate()) {
          const monthDiff = (checkDate.getMonth() - sortedDates[i].getMonth()) + 
                           (12 * (checkDate.getFullYear() - sortedDates[i].getFullYear()));
          // If months are consecutive
          if (monthDiff === monthCount) {
            streak++;
            monthCount++;
            currentMonth = dateMonth;
            checkDate = sortedDates[i];
          } else {
            break;
          }
        }
      }
      
      return streak;
    }
    
    // For yearly habits (check same day and month)
    else if (recurrence === 'yearly') {
      let streak = 1;
      let checkDate = todayHasCompletion ? today : addDays(today, -1);
      let currentYear = checkDate.getFullYear();
      let yearCount = 1;
      
      // Go back through sorted dates and count consecutive years
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const dateYear = sortedDates[i].getFullYear();
        
        // If it's an older year and it has the same day and month
        if (dateYear !== currentYear && 
            sortedDates[i].getDate() === checkDate.getDate() && 
            sortedDates[i].getMonth() === checkDate.getMonth()) {
          // If years are consecutive
          if (currentYear - dateYear === yearCount) {
            streak++;
            yearCount++;
            currentYear = dateYear;
            checkDate = sortedDates[i];
          } else {
            break;
          }
        }
      }
      
      return streak;
    }
    
    // For one-time habits, streak is just 1 if completed
    return todayHasCompletion || yesterdayHasCompletion ? 1 : 0;
  };

  const shouldItemBeDisplayed = (item: any, selectedDate: Date) => {
    const itemStartDate = new Date(item.startDate || item.date);
    itemStartDate.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (isBefore(selectedDate, itemStartDate)) {
      return false;
    }
    
    if (item.recurrence === 'none') {
      return isSameDay(itemStartDate, selectedDate);
    }
    
    if (item.recurrence === 'daily') {
      return true;
    }
    
    if (item.recurrence === 'weekly') {
      return itemStartDate.getDay() === selectedDate.getDay();
    }
    
    if (item.recurrence === 'monthly') {
      return itemStartDate.getDate() === selectedDate.getDate();
    }
    
    if (item.recurrence === 'yearly') {
      return itemStartDate.getDate() === selectedDate.getDate() && 
             itemStartDate.getMonth() === selectedDate.getMonth();
    }
    
    return false;
  };

  const filterItems = (items: any[], selectedDate: Date, itemType: 'habit' | 'event' | 'task') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items
      .filter(item => {
        return shouldItemBeDisplayed(item, selectedDate);
      })
      .map(item => {
        let isCompleted = false;
        
        if (itemType === 'habit') {
          isCompleted = item.completionDates?.some((dateStr: string) => 
            isSameDay(new Date(dateStr), selectedDate)
          ) || false;
        } else {
          isCompleted = item.completedDates?.some((dateStr: string) => 
            isSameDay(new Date(dateStr), selectedDate)
          ) || false;
        }
          
        const streak = calculateStreak(item.completionDates, itemType, item.recurrence, item.startDate);
          
        return { 
          ...item, 
          itemType,
          isCompleted,
          isLocked: isBefore(today, selectedDate),
          streak: streak
        };
      });
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
          const isCompleted = habit.completionDates?.some((d: string) => 
            isSameDay(new Date(d), selectedDate)
          );
          
          return { 
            ...habit, 
            completionDates: isCompleted ? 
              (habit.completionDates || []).filter((d: string) => !isSameDay(new Date(d), selectedDate)) : 
              [...(habit.completionDates || []), dateStr]
          };
        }
        return habit;
      }));
    } else if (type === 'event') {
      setEvents(events.map(event => {
        if (event.id === id) {
          const dateStr = selectedDate.toISOString();
          const isCompleted = event.completedDates?.some((d: string) => 
            isSameDay(new Date(d), selectedDate)
          );
          
          return { 
            ...event, 
            completedDates: isCompleted ? 
              (event.completedDates || []).filter((d: string) => !isSameDay(new Date(d), selectedDate)) : 
              [...(event.completedDates || []), dateStr]
          };
        }
        return event;
      }));
    } else {
      setTasks(tasks.map(task => {
        if (task.id === id) {
          const dateStr = selectedDate.toISOString();
          const isCompleted = task.completedDates?.some((d: string) => 
            isSameDay(new Date(d), selectedDate)
          );
          
          return { 
            ...task, 
            completedDates: isCompleted ? 
              (task.completedDates || []).filter((d: string) => !isSameDay(new Date(d), selectedDate)) : 
              [...(task.completedDates || []), dateStr]
          };
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
        description: `Your ${type} has been deleted.`,
      });
      
      setItemToDelete(null);
    }
  };

  const confirmDelete = (id: string, type: 'habit' | 'event' | 'task') => {
    setItemToDelete({ id, type });
  };

  const handleDateSelection = (date: Date) => {
    onDateSelect(date);
  };

  const getItemSection = (title: string, items: any[], itemType: 'habit' | 'event' | 'task') => {
    if (items.length === 0) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{title}</h3>
            <Button 
              variant="outline" 
              size="sm"
              className="dashboard-add-button"
              onClick={() => {
                if (itemType === 'habit') onAddHabit();
                if (itemType === 'event') onAddEvent();
                if (itemType === 'task') onAddTask();
              }}
            >
              Add {itemType}
            </Button>
          </div>
          <div className="text-center py-8 space-y-2 border rounded-lg border-dashed">
            <p className="text-lg font-medium">You are Free!</p>
            <p className="text-muted-foreground">Maybe you can write a review.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">{title}</h3>
          <Button 
            variant="outline" 
            size="sm"
            className="dashboard-add-button"
            onClick={() => {
              if (itemType === 'habit') onAddHabit();
              if (itemType === 'event') onAddEvent();
              if (itemType === 'task') onAddTask();
            }}
          >
            Add {itemType}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 habit-grid">
          {items.map((item) => (
            <HabitCard
              key={item.id}
              title={item.title}
              description={item.description}
              category={item.category}
              streak={itemType === 'habit' ? item.streak : 0}
              priority={item.priority || 'medium'}
              isCompleted={item.isCompleted}
              isOneTime={false} // Always false so we show priority instead of "one time"
              disabled={item.isLocked}
              onClick={() => toggleItemCompletion(item.id, itemType)}
              onDelete={() => confirmDelete(item.id, itemType)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Track your habits, events, and tasks</p>
      </div>
      
      <div className="mb-6">
        <WeeklyDateBar 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelection}
          firstDayOfWeek={settings.firstDayOfWeek}
        />
      </div>
      
      <div className="space-y-10">
        {getItemSection('Today\'s Habits', filteredHabits, 'habit')}
        {getItemSection('Today\'s Tasks', filteredTasks, 'task')}
        {getItemSection('Today\'s Events', filteredEvents, 'event')}
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
