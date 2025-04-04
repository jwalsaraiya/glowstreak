
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarPageProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onCreateHabit?: () => void;
  onCreateOneTime?: () => void;
}

const mockEvents = [
  {
    id: '1',
    title: 'Morning Meditation',
    type: 'habit',
    startDate: new Date(),
    endDate: new Date(new Date().setHours(new Date().getHours() + 1)),
    category: 'mindfulness',
    isCompleted: true
  },
  {
    id: '2',
    title: 'Team Meeting',
    type: 'event',
    startDate: new Date(new Date().setHours(new Date().getHours() + 2)),
    endDate: new Date(new Date().setHours(new Date().getHours() + 3)),
    category: 'work',
    isCompleted: false
  },
  {
    id: '3',
    title: 'Read a Book',
    type: 'habit',
    startDate: new Date(new Date().setHours(new Date().getHours() + 4)),
    endDate: new Date(new Date().setHours(new Date().getHours() + 5)),
    category: 'learning',
    isCompleted: false
  },
  {
    id: '4',
    title: 'Exercise',
    type: 'habit',
    startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    category: 'fitness',
    isCompleted: false
  },
];

const CalendarPage: React.FC<CalendarPageProps> = ({
  selectedDate: propSelectedDate,
  onDateSelect: propOnDateSelect,
  onCreateHabit,
  onCreateOneTime
}) => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || new Date());
  const [events, setEvents] = useState(mockEvents);
  const isMobile = useIsMobile();

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    if (view === 'day') {
      newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    } else if (view === 'week') {
      newDate = direction === 'prev' ? subDays(selectedDate, 7) : addDays(selectedDate, 7);
    } else {
      newDate = direction === 'prev' ? subDays(selectedDate, 30) : addDays(selectedDate, 30);
    }
    
    setSelectedDate(newDate);
    if (propOnDateSelect) {
      propOnDateSelect(newDate);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (propOnDateSelect) {
        propOnDateSelect(date);
      }
    }
  };

  const handleAddEvent = () => {
    if (onCreateOneTime) {
      onCreateOneTime();
    }
  };
  
  const toggleEventCompletion = (id: string) => {
    setEvents(
      events.map(event => 
        event.id === id 
          ? { ...event, isCompleted: !event.isCompleted } 
          : event
      )
    );
  };

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const eventsForDay = (day: Date) => {
    return events.filter(event => 
      format(event.startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  const renderDayView = () => (
    <div className="space-y-4 overflow-y-auto max-h-[60vh] pb-6">
      <div className="grid grid-cols-1 gap-2">
        {[...Array(24)].map((_, hour) => {
          const eventsForHour = events.filter(event => {
            const eventHour = event.startDate.getHours();
            return format(event.startDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && eventHour === hour;
          });
          
          return (
            <div key={hour} className="flex items-start h-20 border-t">
              <div className="w-16 text-xs text-muted-foreground pr-2 pt-1 text-right">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </div>
              <div className="flex-1 relative min-h-[5rem]">
                {eventsForHour.map(event => (
                  <div 
                    key={event.id} 
                    className={`absolute left-0 right-4 px-3 py-1 rounded-md cursor-pointer transition-all duration-200 hover:brightness-95 ${
                      event.isCompleted 
                        ? 'opacity-60' 
                        : ''
                    } ${
                      event.type === 'habit' 
                        ? 'bg-primary/10 text-foreground border-l-4 border-primary' 
                        : 'bg-secondary border-l-4 border-muted-foreground'
                    }`}
                    style={{
                      top: `${(event.startDate.getMinutes() / 60) * 100}%`,
                      height: '80%',
                    }}
                    onClick={() => toggleEventCompletion(event.id)}
                  >
                    <div className={`font-medium text-sm ${event.isCompleted ? 'line-through' : ''}`}>
                      {event.title}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-1 md:gap-4 overflow-x-auto pb-6">
      {daysInWeek.map((day, i) => {
        const isSelected = isSameDay(day, selectedDate);
        const isToday = isSameDay(day, new Date());
        const dayEvents = eventsForDay(day);
        
        return (
          <div key={i} className="space-y-2 min-w-[90px]">
            <div 
              className={`text-center p-2 rounded-md cursor-pointer ${
                isSelected 
                  ? 'bg-primary text-primary-foreground' 
                  : isToday 
                    ? 'bg-accent/20 text-foreground' 
                    : 'bg-secondary/50'
              }`}
              onClick={() => handleDateSelect(day)}
            >
              <div className="text-xs font-medium">{format(day, 'E')}</div>
              <div className="text-lg font-bold">{format(day, 'd')}</div>
            </div>

            <div className="space-y-2 min-h-[200px] overflow-y-auto">
              {dayEvents.length === 0 ? (
                <div className="text-xs text-center text-muted-foreground p-2">
                  No events
                </div>
              ) : (
                dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`p-2 rounded-md text-sm cursor-pointer ${
                      event.isCompleted ? 'opacity-60' : ''
                    } ${
                      event.type === 'habit' 
                        ? 'bg-primary/10 border-l-2 border-primary' 
                        : 'bg-secondary border-l-2 border-muted-foreground'
                    }`}
                    onClick={() => toggleEventCompletion(event.id)}
                  >
                    <div className={`font-medium truncate ${event.isCompleted ? 'line-through' : ''}`}>
                      {event.title}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.startDate, 'h:mm a')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMonthView = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="w-full rounded-md border"
      modifiers={{
        booked: events.map(event => event.startDate),
      }}
      modifiersStyles={{
        booked: {
          fontWeight: "bold",
          backgroundColor: "hsl(var(--primary) / 0.1)",
          color: "hsl(var(--primary))",
          borderRadius: "0.5rem",
        }
      }}
      classNames={{
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 calendar-date",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent/20 text-accent-foreground",
      }}
    />
  );

  useEffect(() => {
    // Set an appropriate default view based on screen size
    if (isMobile) {
      setView('day');
    }
  }, [isMobile]);

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 max-w-7xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your habits and events
        </p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <CalendarDays className="h-5 w-5 md:h-6 md:w-6" />
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  {view === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  {view === 'week' && `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
                  {view === 'month' && format(selectedDate, 'MMMM yyyy')}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
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
                className="text-xs md:text-sm"
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

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            <Tabs 
              defaultValue={view} 
              value={view} 
              onValueChange={(value) => setView(value as 'day' | 'week' | 'month')}
              className="w-full max-w-xs"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button className="gap-1 self-end sm:self-auto" onClick={handleAddEvent}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Event</span>
            </Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary/10 text-foreground border-l-4 border-primary hover:bg-primary/20">
                Habit
              </Badge>
              <Badge variant="outline" className="border-l-4 border-muted-foreground hover:bg-secondary/80">
                Event
              </Badge>
              <Badge variant="outline" className="opacity-60 line-through">
                Completed
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
