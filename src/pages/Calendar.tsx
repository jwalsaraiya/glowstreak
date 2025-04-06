
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  format, 
  isSameDay, 
  isBefore, 
  isAfter,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';
import { CalendarDays, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import MonthlyDateBar from '@/components/MonthlyDateBar';

interface CalendarPageProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateHabit: () => void;
  onCreateOneTime: () => void;
  onCreateEvent: () => void;
}

interface UserData {
  habits: any[];
  events: any[];
  tasks: any[];
}

interface UserSettings {
  firstDayOfWeek: "sunday" | "monday";
}

const CalendarPage: React.FC<CalendarPageProps> = ({
  selectedDate,
  onDateSelect,
  onCreateHabit,
  onCreateOneTime,
  onCreateEvent
}) => {
  const [viewDate, setViewDate] = useState<Date>(selectedDate);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ firstDayOfWeek: "sunday" });
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

  // Process recurrence for all items
  const processRecurrence = (items: any[], itemType: 'event' | 'task' | 'habit') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    
    const processedItems: any[] = [];
    
    items.forEach(item => {
      // Add the original item with its start date for reference
      const originalDate = new Date(item.date || item.startDate);
      const startDate = new Date(item.date || item.startDate);
      
      // Don't show items that haven't started yet by checking against the original start date
      const clonedStartDate = new Date(startDate);
      clonedStartDate.setHours(0, 0, 0, 0);
            
      // Skip if it hasn't started yet or if no recurrence
      if (!item.recurrence || item.recurrence === 'none') {
        processedItems.push({
          ...item,
          date: originalDate,
          startDate: startDate,
          type: itemType
        });
        return;
      }
      
      // For recurring items, generate instances within this month's view
      let currentDate = new Date(startDate);
      
      while (isBefore(currentDate, monthEnd) || isSameDay(currentDate, monthEnd)) {
        // Only add if the date is valid (after or equal to start date and in current month)
        if ((isAfter(currentDate, clonedStartDate) || isSameDay(currentDate, clonedStartDate)) && 
            (isBefore(currentDate, monthEnd) || isSameDay(currentDate, monthEnd)) &&
            (isAfter(currentDate, monthStart) || isSameDay(currentDate, monthStart))) {
          
          processedItems.push({
            ...item,
            date: new Date(currentDate),
            startDate: startDate, // Keep original start date for reference
            type: itemType,
            // Check if the habit is completed on this day
            isCompleted: itemType === 'habit' ? 
              item.completionDates?.some((d: string) => isSameDay(new Date(d), currentDate)) : 
              item.isCompleted
          });
        }
        
        // Calculate next occurrence based on recurrence type
        switch (item.recurrence) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
          default:
            // For none or unspecified, don't create recurrences
            currentDate = new Date(monthEnd);
            currentDate.setDate(currentDate.getDate() + 1); // Exit the loop
        }
      }
    });
    
    return processedItems;
  };

  // Process all items with recurrence
  const processedEvents = processRecurrence(events, 'event');
  const processedTasks = processRecurrence(tasks, 'task');
  const processedHabits = processRecurrence(habits, 'habit');

  // All calendar items
  const allCalendarItems = [
    ...processedEvents,
    ...processedTasks,
    ...processedHabits
  ];
  
  // Filter out only high priority tasks and events for month view
  const calendarItems = allCalendarItems.filter(item => 
    // Show only high priority tasks and events in the month view, no habits
    (item.type === 'task' || item.type === 'event') && 
    item.priority === 'high'
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setViewDate(date);
      onDateSelect(date);
    }
  };

  // Check if an item should be shown for a specific day
  const itemsForDay = (day: Date) => {
    return allCalendarItems.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = item.startDate ? new Date(item.startDate) : itemDate;
      startDate.setHours(0, 0, 0, 0);
      day.setHours(0, 0, 0, 0);
      
      // Only show items that have started already
      if (isBefore(day, startDate)) {
        return false;
      }
      
      return isSameDay(itemDate, day);
    });
  };

  // Determine if an item should be locked (future date)
  const isItemLocked = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isAfter(date, today);
  };

  // Get item type styling
  const getItemTypeColor = (type: string, priority: string = 'medium') => {
    if (type === 'event') {
      return priority === 'high' ? 
        'bg-blue-200 border-l-2 border-blue-500' : 
        'bg-secondary border-l-2 border-blue-400';
    } else if (type === 'task') {
      if (priority === 'high') {
        return 'bg-destructive/10 border-l-2 border-destructive';
      } else {
        return 'bg-yellow-100 border-l-2 border-yellow-400';
      }
    } else {
      return 'bg-primary/10 border-l-2 border-primary';
    }
  };

  // Display details for selected date
  const renderSelectedDateItems = () => {
    const items = itemsForDay(selectedDate);
    const locked = isItemLocked(selectedDate);

    return (
      <div className="mt-6 px-4">
        <h3 className="text-lg font-semibold mb-3">
          Items for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="space-y-2">
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-md ${getItemTypeColor(item.type, item.priority)} ${
                  item.isCompleted ? 'line-through opacity-70' : 
                  locked ? 'opacity-50' : 'cursor-pointer'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.title}</span>
                  <Badge variant="outline">{item.type}</Badge>
                </div>
                {item.category && (
                  <span className="text-xs text-muted-foreground block mt-1">
                    Category: {item.category}
                  </span>
                )}
                {item.type === 'habit' && !item.isOneTime && (
                  <div className="text-xs flex items-center mt-1 text-muted-foreground">
                    <Flame className="h-3 w-3 mr-1" />
                    Streak: {item.streak || 0}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-lg font-medium">You are Free Today!</p>
              <p className="text-muted-foreground">Maybe you can write a review.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your events and tasks
        </p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <CalendarDays className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-semibold">
                  Calendar
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handleDateSelect(new Date())}
              >
                Today
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <MonthlyDateBar 
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              firstDayOfWeek={settings.firstDayOfWeek}
              events={calendarItems}
            />
            {renderSelectedDateItems()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
