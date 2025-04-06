import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus, CalendarCheck, CalendarClock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-is-mobile';

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

const CalendarPage: React.FC<CalendarPageProps> = ({
  selectedDate,
  onDateSelect,
  onCreateHabit,
  onCreateOneTime,
  onCreateEvent
}) => {
  const [view, setView] = useState<'day' | 'month'>('month');
  const [viewDate, setViewDate] = useState<Date>(selectedDate);
  const [habits, setHabits] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const fetchUserData = () => {
    if (user) {
      const userData = localStorage.getItem(`userData_${user.id}`);
      if (userData) {
        const parsedData: UserData = JSON.parse(userData);
        setHabits(parsedData.habits || []);
        setEvents(parsedData.events || []);
        setTasks(parsedData.tasks || []);
      }
    }
  };

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const allItems = [
    ...habits.flatMap(habit => 
      habit.completionDates?.map((dateStr: string) => ({
        date: new Date(dateStr),
        type: 'habit' as const,
        title: habit.title,
        id: `habit-${habit.id}-${dateStr}`,
        isCompleted: true,
        priority: habit.priority,
        category: habit.category,
      })) || []
    ),
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
    
    if (view === 'day') {
      newDate = direction === 'prev' ? subDays(viewDate, 1) : addDays(viewDate, 1);
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

  const weekStart = startOfWeek(viewDate);
  const weekEnd = endOfWeek(viewDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const itemsForDay = (day: Date) => {
    return allItems.filter(item => 
      isSameDay(item.date, day)
    );
  };

  const getItemTypeColor = (type: string, priority: string = 'medium') => {
    if (type === 'habit') {
      return 'bg-primary/10 border-l-2 border-primary';
    } else if (type === 'event') {
      return 'bg-secondary border-l-2 border-blue-400';
    } else {
      if (priority === 'high') {
        return 'bg-destructive/10 border-l-2 border-destructive';
      } else {
        return 'bg-yellow-100 border-l-2 border-yellow-400';
      }
    }
  };

  const renderDayView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2">
        {[...Array(24)].map((_, hour) => (
          <div key={hour} className="flex items-start h-20 border-t">
            <div className="w-16 text-xs text-muted-foreground pr-2 pt-1 text-right">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
            <div className="flex-1 relative min-h-[5rem]">
              {allItems
                .filter(item => {
                  const itemDate = new Date(item.date);
                  const itemHour = itemDate.getHours();
                  return isSameDay(itemDate, viewDate) && (itemHour === hour || hour === 9); // Default to 9AM if no time
                })
                .map((item, idx) => (
                  <div 
                    key={item.id} 
                    className={`absolute left-0 right-4 px-3 py-1 rounded-md ${
                      getItemTypeColor(item.type, item.priority)
                    } ${item.isCompleted ? 'opacity-60' : ''}`}
                    style={{
                      top: `${((idx * 20) % 80)}%`,
                      height: '80%',
                      maxHeight: '50px',
                    }}
                  >
                    <div className="font-medium text-sm truncate">{item.title}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(item.date, 'h:mm a')}
                      <Badge variant="outline" className="ml-1 h-4 text-[10px]">{item.type}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="space-y-4">
      <CalendarComponent
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="rounded-md border"
        modifiers={{
          booked: allItems.map(item => item.date),
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
            <p className="text-muted-foreground text-center py-4">
              No items scheduled for this day. 
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary" 
                onClick={onCreateOneTime}
              >
                Add one?
              </Button>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your habits and events
        </p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <CalendarDays className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-semibold">
                  {view === 'day' && format(viewDate, 'EEEE, MMMM d, yyyy')}
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
              onValueChange={(value) => setView(value as 'day' | 'month')}
              className="w-full max-w-xs"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
              <Button 
                variant="outline"
                className="gap-1" 
                onClick={onCreateOneTime}
              >
                <Plus className="h-4 w-4" />
                <span className="inline text-sm md:text-base">New Task</span>
              </Button>
              <Button 
                variant="secondary"
                className="gap-1" 
                onClick={onCreateEvent}
              >
                <Calendar className="h-4 w-4" />
                <span className="inline text-sm md:text-base">New Event</span>
              </Button>
              <Button 
                className="gap-1" 
                onClick={onCreateHabit}
              >
                <Plus className="h-4 w-4" />
                <span className="inline text-sm md:text-base">New Habit</span>
              </Button>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {view === 'day' && renderDayView()}
            {view === 'month' && renderMonthView()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
