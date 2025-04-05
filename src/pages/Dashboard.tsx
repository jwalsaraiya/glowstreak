import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import CalendarView from '@/components/CalendarView';
import StreakAnalytics from '@/components/StreakAnalytics';
import { Plus, CalendarPlus } from 'lucide-react';
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
    completionDates: [
      new Date(),
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(new Date().setDate(new Date().getDate() - 2))
    ]
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
    completionDates: [
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(new Date().setDate(new Date().getDate() - 3))
    ]
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
    completionDates: [
      new Date(new Date().setDate(new Date().getDate() - 1)),
      new Date(new Date().setDate(new Date().getDate() - 2))
    ]
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
    completionDates: [
      new Date(new Date().setDate(new Date().getDate() - 1))
    ]
  },
];

const mockTasks = [
  {
    id: 't1',
    title: 'Buy groceries',
    description: 'Get items for the week',
    category: 'errands',
    priority: 'medium' as const,
    isCompleted: false,
    isOneTime: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1))
  },
  {
    id: 't2',
    title: 'Dentist appointment',
    description: 'Regular checkup',
    category: 'health',
    priority: 'high' as const,
    isCompleted: false,
    isOneTime: true,
    dueDate: new Date(new Date().setDate(new Date().getDate() + 3))
  }
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
  const [tasks, setTasks] = useState(mockTasks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOneTimeTask, setIsOneTimeTask] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());
  const [filteredHabits, setFilteredHabits] = useState(habits);
  const [filteredTasks, setFilteredTasks] = useState(tasks);

  useEffect(() => {
    const events: CalendarEvent[] = [];
    
    habits.forEach(habit => {
      events.push({
        id: habit.id,
        date: new Date(),
        type: 'habit',
        title: habit.title,
        isCompleted: habit.isCompleted
      });
      
      habit.completionDates?.forEach((date, index) => {
        events.push({
          id: `${habit.id}-${index}`,
          date,
          type: 'habit',
          title: habit.title,
          isCompleted: true
        });
      });
    });
    
    tasks.forEach(task => {
      events.push({
        id: task.id,
        date: task.dueDate,
        type: 'event',
        title: task.title,
        isCompleted: task.isCompleted
      });
    });
    
    setCalendarEvents(events);
  }, [habits, tasks]);

  useEffect(() => {
    const dateString = selectedDate.toDateString();
    
    const filteredHabits = habits.map(habit => {
      const isCompletedOnSelectedDate = habit.completionDates?.some(
        date => date.toDateString() === dateString
      );
      
      return {
        ...habit,
        isCompleted: isCompletedOnSelectedDate || false
      };
    });
    
    const filteredTasks = tasks.filter(task => 
      task.dueDate.toDateString() === dateString
    );
    
    setFilteredHabits(filteredHabits);
    setFilteredTasks(filteredTasks);
  }, [selectedDate, habits, tasks]);

  const handleCreateHabit = (values: any) => {
    if (values.isOneTime) {
      const newTask = {
        id: `t${tasks.length + 1}`,
        title: values.title,
        description: values.description || '',
        category: values.category,
        priority: values.priority,
        isCompleted: false,
        isOneTime: true,
        dueDate: values.date || new Date()
      };
      setTasks([...tasks, newTask]);
    } else {
      const newHabit = {
        id: (habits.length + 1).toString(),
        title: values.title,
        description: values.description || '',
        category: values.category,
        streak: 0,
        priority: values.priority,
        isCompleted: false,
        isOneTime: false,
        completionDates: []
      };
      setHabits([...habits, newHabit]);
    }
    
    toast({
      title: values.isOneTime ? "Task Created" : "Habit Created",
      description: `${values.title} has been added to your ${values.isOneTime ? 'tasks' : 'habits'}.`,
    });
  };

  const toggleHabitCompletion = (id: string) => {
    const today = new Date();
    
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const isCompleted = !habit.isCompleted;
        let completionDates = [...(habit.completionDates || [])];
        
        if (isCompleted) {
          if (!completionDates.some(date => date.toDateString() === today.toDateString())) {
            completionDates.push(today);
          }
        } else {
          completionDates = completionDates.filter(
            date => date.toDateString() !== today.toDateString()
          );
        }
        
        return { 
          ...habit, 
          isCompleted, 
          completionDates,
          streak: isCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    }));
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    ));
  };

  const handleDeleteHabit = () => {
    if (habitToDelete) {
      const habitToRemove = [...habits, ...tasks].find(h => h.id === habitToDelete);
      
      if (habitToRemove?.isOneTime) {
        setTasks(tasks.filter(task => task.id !== habitToDelete));
      } else {
        setHabits(habits.filter(habit => habit.id !== habitToDelete));
      }
      
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

  const handleCalendarEventClick = (eventId: string) => {
    const habit = habits.find(h => h.id === eventId);
    const task = tasks.find(t => t.id === eventId);
    
    if (habit) {
      toggleHabitCompletion(eventId);
    } else if (task) {
      toggleTaskCompletion(eventId);
    }
  };

  const getDisplayItems = () => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    
    if (isToday) {
      return [...filteredHabits, ...tasks.filter(task => 
        task.dueDate.toDateString() === selectedDate.toDateString()
      )];
    }
    
    return [
      ...filteredHabits,
      ...tasks.filter(task => task.dueDate.toDateString() === selectedDate.toDateString())
    ];
  };

  const displayItems = getDisplayItems();

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {selectedDate.toDateString() === new Date().toDateString() 
            ? format(new Date(), 'EEEE, MMMM d, yyyy')
            : format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">
              {selectedDate.toDateString() === new Date().toDateString() 
                ? "Today's Activities" 
                : format(selectedDate, "MMM d") + " Activities"}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayItems.map((item) => (
              <HabitCard
                key={item.id}
                title={item.title}
                description={item.description}
                category={item.category}
                streak={item.isOneTime ? 0 : (item.streak || 0)}
                priority={item.priority}
                isCompleted={item.isCompleted}
                isOneTime={item.isOneTime}
                onClick={() => item.isOneTime 
                  ? toggleTaskCompletion(item.id) 
                  : toggleHabitCompletion(item.id)
                }
                onDelete={() => setHabitToDelete(item.id)}
              />
            ))}
            
            {displayItems.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No activities for this date. Add a new habit or task!
              </div>
            )}
            
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
          onEventClick={handleCalendarEventClick}
          onAddEvent={() => openTaskForm(true)}
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
