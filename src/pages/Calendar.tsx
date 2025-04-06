
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isBefore
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const futureDate = addMonths(today, 3); // Process up to 3 months ahead
    
    const processedItems: any[] = [];
    
    items.forEach(item => {
      // Add the original item with its start date for reference
      const originalDate = new Date(item.date || item.startDate);
      const startDate = new Date(item.date || item.startDate);
      
      // Skip if it hasn't started yet
      if (!item.recurrence || item.recurrence === 'none') {
        processedItems.push({
          ...item,
          date: originalDate,
          startDate: startDate,
          type: itemType
        });
        return;
      }
      
      // For habits without one-time completion, generate recurring instances
      let currentDate = new Date(startDate);
      
      while (currentDate <= futureDate) {
        // Only add if the date is valid
        if (currentDate >= startDate) {
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
            currentDate = addDays(currentDate, 1);
            break;
          case 'weekly':
            currentDate = addWeeks(currentDate, 1);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'yearly':
            currentDate = addYears(currentDate, 1);
            break;
          default:
            // For none or unspecified, don't create recurrences
            currentDate = addYears(futureDate, 1); // Exit the loop
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
  const calendarItems = [
    ...processedEvents,
    ...processedTasks,
    ...processedHabits
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    setViewDate(prevDate => 
      direction === 'prev' ? subDays(prevDate, 7) : addDays(prevDate, 7)
    );
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setViewDate(date);
      onDateSelect(date);
    }
  };

  // Use firstDayOfWeek setting for proper week calculation
  const getWeekStart = (date: Date) => {
    const weekStartsOn = settings.firstDayOfWeek === "monday" ? 1 : 0;
    return startOfWeek(date, { weekStartsOn });
  };

  const weekStart = getWeekStart(viewDate);
  const weekEnd = endOfWeek(viewDate, { weekStartsOn: settings.firstDayOfWeek === "monday" ? 1 : 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Check if an item should be shown for a specific day
  const itemsForDay = (day: Date) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    return calendarItems.filter(item => {
      const itemDate = new Date(item.date);
      const startDate = item.startDate ? new Date(item.startDate) : itemDate;
      startDate.setHours(0, 0, 0, 0);
      
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
      return 'bg-secondary border-l-2 border-blue-400';
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

  const renderWeekView = () => {
    const weekDays = settings.firstDayOfWeek === "monday" 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div>
        <div className="p-4 grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-medium">
          {weekDays.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="px-4 pb-4 grid grid-cols-7 gap-1 text-center">
          {daysInWeek.map((date, i) => {
            const dayEvents = itemsForDay(date);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            const locked = isItemLocked(date);

            return (
              <div 
                key={i} 
                className="flex flex-col"
                onClick={() => handleDateSelect(date)}
              >
                <div className={`mb-1 h-8 w-8 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary text-primary-foreground' : 
                  isToday ? 'bg-muted text-foreground' : ''
                }`}>
                  {date.getDate()}
                </div>
                <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                  {dayEvents.map((event, idx) => (
                    <Badge 
                      key={idx}
                      variant={event.type === 'event' ? 'secondary' : 'outline'}
                      className={`truncate text-xs py-0.5 ${
                        event.isCompleted ? "opacity-70 line-through" : 
                        locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-primary/90"
                      }`}
                    >
                      {event.title}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
                  locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
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
                  {format(viewDate, 'MMMM yyyy')}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDateSelect(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {renderWeekView()}
            {renderSelectedDateItems()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
