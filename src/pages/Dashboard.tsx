
import React, { useState } from 'react';
import { format } from 'date-fns';
import HabitCard from '@/components/HabitCard';
import CalendarView from '@/components/CalendarView';
import StreakAnalytics from '@/components/StreakAnalytics';
import HabitForm from '@/components/HabitForm';
import { Plus, CalendarPlus, Trash2 } from 'lucide-react';
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

// Mock data for habits and streaks
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
  },
];

const mockEvents = [
  {
    date: new Date(),
    type: 'habit' as const,
    title: 'Morning Meditation',
  },
  {
    date: new Date(),
    type: 'habit' as const,
    title: 'Read a Book',
  },
  {
    date: new Date(),
    type: 'event' as const,
    title: 'Meeting',
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 1)),
    type: 'habit' as const,
    title: 'Exercise',
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 2)),
    type: 'event' as const,
    title: 'Dentist',
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

const Dashboard: React.FC = () => {
  const [habits, setHabits] = useState(mockHabits);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isOneTimeTask, setIsOneTimeTask] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    };

    setHabits([...habits, newHabit]);
    toast({
      title: isOneTimeTask ? "Task Created" : "Habit Created",
      description: `${values.title} has been added to your ${isOneTimeTask ? 'tasks' : 'habits'}.`,
    });
    setIsOneTimeTask(false);
  };

  const toggleHabitCompletion = (id: string) => {
    setHabits(habits.map(habit => 
      habit.id === id ? { ...habit, isCompleted: !habit.isCompleted } : habit
    ));
  };

  const handleDeleteHabit = () => {
    if (habitToDelete) {
      const habitToRemove = habits.find(h => h.id === habitToDelete);
      setHabits(habits.filter(habit => habit.id !== habitToDelete));
      toast({
        title: habitToRemove?.isOneTime ? "Task Deleted" : "Habit Deleted",
        description: `${habitToRemove?.title} has been removed.`,
      });
      setHabitToDelete(null);
    }
  };

  const openTaskForm = (isOneTime: boolean) => {
    setIsOneTimeTask(isOneTime);
    setIsFormOpen(true);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-semibold">Today's Activities</h2>
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
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                title={habit.title}
                description={habit.description}
                category={habit.category}
                streak={habit.streak}
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
        <CalendarView events={mockEvents} />
      </div>

      <HabitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateHabit}
      />

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
