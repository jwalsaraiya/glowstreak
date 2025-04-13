
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import CalendarView from '@/components/CalendarView';
import { format, isSameDay } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

interface CalendarPageProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateHabit: () => void;
  onCreateOneTime: () => void;
  onCreateEvent: () => void;
}

const CalendarPage: React.FC<CalendarPageProps> = ({
  selectedDate,
  onDateSelect,
  onCreateHabit,
  onCreateOneTime,
  onCreateEvent
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<{firstDayOfWeek: "sunday" | "monday"}>({ firstDayOfWeek: "sunday" });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load user data from localStorage
      const userData = localStorage.getItem(`userData_${user.id}`);
      const userSettings = localStorage.getItem(`settings_${user.id}`);
      
      if (userData) {
        const parsedData = JSON.parse(userData);
        
        // Combine habits, events, and tasks
        const habits = parsedData.habits || [];
        const tasks = parsedData.tasks || [];
        const eventsData = parsedData.events || [];
        
        const combinedEvents = [
          ...habits.map((habit: any) => ({ ...habit, type: 'habit' })),
          ...tasks.map((task: any) => ({ ...task, type: 'task' })),
          ...eventsData.map((event: any) => ({ ...event, type: 'event' }))
        ];
        
        setEvents(combinedEvents);
      }
      
      if (userSettings) {
        const parsedSettings = JSON.parse(userSettings);
        setSettings({
          firstDayOfWeek: parsedSettings.firstDayOfWeek || "sunday"
        });
      }
    }
  }, [user]);

  const toggleEventCompletion = (eventId: string) => {
    if (!user) return;

    const userData = localStorage.getItem(`userData_${user.id}`);
    if (!userData) return;
    
    const parsedData = JSON.parse(userData);
    const today = new Date();
    
    // Check which array contains the event
    let updated = false;
    
    if (parsedData.habits) {
      const habitIndex = parsedData.habits.findIndex((h: any) => h.id === eventId);
      if (habitIndex >= 0) {
        const habit = parsedData.habits[habitIndex];
        const completionDates = habit.completionDates || [];
        
        const todayStr = today.toISOString();
        const alreadyCompleted = completionDates.some((dateStr: string) => 
          isSameDay(new Date(dateStr), today)
        );
        
        if (alreadyCompleted) {
          // Remove today's date from completionDates
          parsedData.habits[habitIndex].completionDates = completionDates.filter(
            (dateStr: string) => !isSameDay(new Date(dateStr), today)
          );
          parsedData.habits[habitIndex].isCompleted = false;
          if (parsedData.habits[habitIndex].streak > 0) {
            parsedData.habits[habitIndex].streak -= 1;
          }
        } else {
          // Add today's date to completionDates
          completionDates.push(todayStr);
          parsedData.habits[habitIndex].completionDates = completionDates;
          parsedData.habits[habitIndex].isCompleted = true;
          parsedData.habits[habitIndex].streak = (habit.streak || 0) + 1;
        }
        
        updated = true;
      }
    }
    
    if (!updated && parsedData.tasks) {
      const taskIndex = parsedData.tasks.findIndex((t: any) => t.id === eventId);
      if (taskIndex >= 0) {
        parsedData.tasks[taskIndex].isCompleted = !parsedData.tasks[taskIndex].isCompleted;
        updated = true;
      }
    }
    
    if (updated) {
      localStorage.setItem(`userData_${user.id}`, JSON.stringify(parsedData));
      
      // Reload events after update
      const habits = parsedData.habits || [];
      const tasks = parsedData.tasks || [];
      const eventsData = parsedData.events || [];
      
      const combinedEvents = [
        ...habits.map((habit: any) => ({ ...habit, type: 'habit' })),
        ...tasks.map((task: any) => ({ ...task, type: 'task' })),
        ...eventsData.map((event: any) => ({ ...event, type: 'event' }))
      ];
      
      setEvents(combinedEvents);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage your habits, tasks and events</p>
      </div>

      <div className="w-full overflow-hidden">
        <ScrollArea className="w-full h-[calc(100vh-200px)]">
          <div className="pr-4 pb-4 min-w-[320px]">
            <CalendarView
              events={events}
              onDateSelect={onDateSelect}
              onEventClick={toggleEventCompletion}
              onAddEvent={onCreateEvent}
              selectedDate={selectedDate}
              firstDayOfWeek={settings.firstDayOfWeek}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CalendarPage;
