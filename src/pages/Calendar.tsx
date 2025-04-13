import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import CalendarView from '@/components/CalendarView';
import { format, isSameDay, isSameMonth, isSameWeek, isSameYear, isBefore } from 'date-fns';
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
        
        // Filter events based on recurrence pattern
        const processedEvents = applyRecurrenceRules(combinedEvents);
        setEvents(processedEvents);
      }
      
      if (userSettings) {
        const parsedSettings = JSON.parse(userSettings);
        setSettings({
          firstDayOfWeek: parsedSettings.firstDayOfWeek || "sunday"
        });
      }
    }
  }, [user]);

  // Function to apply recurrence rules
  const shouldItemBeDisplayed = (item: any, date: Date) => {
    // Get the start date of the item
    const itemStartDate = new Date(item.startDate || item.date);
    itemStartDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    // If the date is before the item start date, don't display it
    if (isBefore(date, itemStartDate)) {
      return false;
    }
    
    // One-time items: only show on the exact date
    if (item.recurrence === 'none') {
      return isSameDay(itemStartDate, date);
    }
    
    // Daily items: show every day after start date
    if (item.recurrence === 'daily') {
      return true;
    }
    
    // Weekly items: show on the same day of week
    if (item.recurrence === 'weekly') {
      return itemStartDate.getDay() === date.getDay();
    }
    
    // Monthly items: show on the same day of month
    if (item.recurrence === 'monthly') {
      return itemStartDate.getDate() === date.getDate();
    }
    
    // Yearly items: show on the same month and day
    if (item.recurrence === 'yearly') {
      return itemStartDate.getDate() === date.getDate() && 
             itemStartDate.getMonth() === date.getMonth();
    }
    
    return false;
  };

  // Apply recurrence rules to generate virtual events
  const applyRecurrenceRules = (items: any[]) => {
    return items.map(item => {
      // Make sure we have the required properties
      return {
        ...item,
        // Make sure each item has a recurrence property
        recurrence: item.recurrence || 'none'
      };
    });
  };

  const toggleEventCompletion = (eventId: string) => {
    // This function is no longer used for calendar view
    // but kept for potential future use
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">View and manage your habits, tasks and events</p>
      </div>

      <div className="flex-grow h-[calc(100vh-200px)]">
        <CalendarView
          events={events}
          onDateSelect={onDateSelect}
          onEventClick={() => {}} // Disable toggling completion
          showAddButton={false}
          selectedDate={selectedDate}
          firstDayOfWeek={settings.firstDayOfWeek}
          readOnly={true}
        />
      </div>
    </div>
  );
};

export default CalendarPage;
