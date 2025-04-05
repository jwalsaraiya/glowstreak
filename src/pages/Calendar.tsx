import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

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
    startDate: new Date(2023, 3, 10, 8, 0),
    endDate: new Date(2023, 3, 10, 8, 30),
    category: 'mindfulness',
  },
  {
    id: '2',
    title: 'Team Meeting',
    type: 'event',
    startDate: new Date(2023, 3, 10, 10, 0),
    endDate: new Date(2023, 3, 10, 11, 0),
    category: 'work',
  },
  {
    id: '3',
    title: 'Read a Book',
    type: 'habit',
    startDate: new Date(2023, 3, 10, 17, 0),
    endDate: new Date(2023, 3, 10, 18, 0),
    category: 'learning',
  },
  {
    id: '4',
    title: 'Exercise',
    type: 'habit',
    startDate: new Date(2023, 3, 11, 7, 0),
    endDate: new Date(2023, 3, 11, 8, 0),
    category: 'fitness',
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
  const [events] = useState(mockEvents);

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

  const weekStart = startOfWeek(selectedDate);
  const weekEnd = endOfWeek(selectedDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const eventsForDay = (day: Date) => {
    return events.filter(event => 
      format(event.startDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
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
              {events
                .filter(event => {
                  const eventHour = event.startDate.getHours();
                  return format(event.startDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') && eventHour === hour;
                })
                .map(event => (
                  <div 
                    key={event.id} 
                    className={`absolute left-0 right-4 px-3 py-1 rounded-md ${
                      event.type === 'habit' ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'bg-secondary border-l-4 border-muted-foreground'
                    }`}
                    style={{
                      top: `${(event.startDate.getMinutes() / 60) * 100}%`,
                      height: '80%',
                    }}
                  >
                    <div className="font-medium text-sm">{event.title}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(event.startDate, 'h:mm a')} - {format(event.endDate, 'h:mm a')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-4">
      {daysInWeek.map((day, i) => (
        <div key={i} className="space-y-2">
          <div className={`text-center p-2 rounded-md ${
            format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary/50'
          }`}>
            <div className="text-xs font-medium">{format(day, 'E')}</div>
            <div className="text-lg font-bold">{format(day, 'd')}</div>
          </div>

          <div className="space-y-2 min-h-[200px]">
            {eventsForDay(day).map(event => (
              <div 
                key={event.id}
                className={`p-2 rounded-md text-sm ${
                  event.type === 'habit' 
                    ? 'bg-primary/10 border-l-2 border-primary' 
                    : 'bg-secondary border-l-2 border-muted-foreground'
                }`}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(event.startDate, 'h:mm a')}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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
    />
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your habits and events
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="flex items-center space-x-4">
              <CalendarDays className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-semibold">
                  {view === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  {view === 'week' && `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
                  {view === 'month' && format(selectedDate, 'MMMM yyyy')}
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

          <div className="flex justify-between items-center mb-6">
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

            <Button className="gap-1" onClick={handleAddEvent}>
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </div>

          <div className="mt-4">
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarPage;
