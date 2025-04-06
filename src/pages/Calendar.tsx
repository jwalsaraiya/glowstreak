
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, CalendarCheck, CalendarClock } from 'lucide-react';
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
  const [view, setView] = useState<'week' | 'month'>('month');
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

  // Only include events and tasks for calendar
  const calendarItems = [
    ...events.map(event => ({
      date: new Date(event.date),
      type: 'event' as const,
      title: event.title,
      id: `event-${event.id}`,
      isCompleted: event.isCompleted,
      priority: event.priority,
      category: event.category,
    })),
    ...tasks.map(task => ({
      date: new Date(task.date),
      type: 'task' as const,
      title: task.title,
      id: `task-${task.id}`,
      isCompleted: task.isCompleted,
      priority: task.priority,
      category: task.category,
    }))
  ];

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    if (view === 'week') {
      newDate = direction === 'prev' ? subDays(viewDate, 7) : addDays(viewDate, 7);
    } else {
      newDate = direction === 'prev' ? subDays(viewDate, 30) : addDays(viewDate, 30);
    }
    
    setViewDate(newDate);
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

  const itemsForDay = (day: Date) => {
    return calendarItems.filter(item => 
      isSameDay(item.date, day)
    );
  };

  const getItemTypeColor = (type: string, priority: string = 'medium') => {
    if (type === 'event') {
      return 'bg-secondary border-l-2 border-blue-400';
    } else {
      if (priority === 'high') {
        return 'bg-destructive/10 border-l-2 border-destructive';
      } else {
        return 'bg-yellow-100 border-l-2 border-yellow-400';
      }
    }
  };

  const renderMonthView = () => (
    <div className="space-y-4">
      <CalendarComponent
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        modifiers={{
          booked: calendarItems.map(item => item.date),
        }}
        modifiersStyles={{
          booked: {
            fontWeight: "bold",
            backgroundColor: "hsl(var(--primary) / 0.1)",
            color: "hsl(var(--primary))",
            borderRadius: "0.5rem",
          }
        }}
      />

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">
          Items for {format(selectedDate, 'MMMM d, yyyy')}
        </h3>
        <div className="space-y-2">
          {itemsForDay(selectedDate).length > 0 ? (
            itemsForDay(selectedDate).map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-md ${getItemTypeColor(item.type, item.priority)} ${
                  item.isCompleted ? 'line-through opacity-70' : ''
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
    </div>
  );

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
            const dateStr = date.toDateString();
            const dayEvents = itemsForDay(date);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);

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
                      className={`truncate text-xs py-0.5 cursor-pointer ${
                        event.isCompleted ? "opacity-70 line-through" : "hover:bg-primary/90"
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
                  {view === 'week' && format(viewDate, 'MMMM yyyy')}
                  {view === 'month' && format(viewDate, 'MMMM yyyy')}
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

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <Tabs 
              defaultValue={view} 
              value={view} 
              onValueChange={(value) => setView(value as 'week' | 'month')}
              className="w-full max-w-xs"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="mt-4 overflow-x-auto">
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
