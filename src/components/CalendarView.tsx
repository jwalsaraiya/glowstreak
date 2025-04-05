
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  date: Date;
  type: 'habit' | 'event';
  title: string;
  id: string;
  isCompleted?: boolean;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  selectedDate: propSelectedDate
}) => {
  const today = new Date();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || today);
  const [viewDate, setViewDate] = useState<Date>(propSelectedDate || today);

  // Transform events into a map for easier lookup
  const eventsByDate = events.reduce((acc, event) => {
    const dateStr = event.date.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (onDateSelect) onDateSelect(date);
    }
  };

  const handleEventClick = (eventId: string) => {
    if (onEventClick) onEventClick(eventId);
  };

  const changeWeek = (direction: 'prev' | 'next') => {
    setViewDate(prevDate => 
      direction === 'prev' ? subDays(prevDate, 7) : addDays(prevDate, 7)
    );
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
    
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  return (
    <Card className="h-full border shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div className="flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Calendar
          </div>
          {onAddEvent && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-2" 
              onClick={() => onAddEvent(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue={isMobile ? "week" : "month"}>
          <div className="px-4 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="month" className="mt-0 space-y-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="p-4"
              modifiers={{
                booked: Object.keys(eventsByDate).map(dateStr => new Date(dateStr)),
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
              }}
            />
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <div className="flex justify-between items-center px-4 pt-2">
              <Button variant="ghost" size="icon" onClick={() => changeWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm font-medium">
                {format(getWeekDays()[0], 'MMM d')} - {format(getWeekDays()[6], 'MMM d, yyyy')}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => changeWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-medium">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="px-4 pb-4 grid grid-cols-7 gap-1 text-center">
              {getWeekDays().map((date, i) => {
                const dateStr = date.toDateString();
                const dayEvents = eventsByDate[dateStr] || [];
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selectedDate);

                return (
                  <div 
                    key={i} 
                    className="flex flex-col"
                    onClick={() => handleDateSelect(date)}
                  >
                    <div className={cn(
                      "mb-1 h-8 w-8 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-colors",
                      isSelected ? 'bg-primary text-primary-foreground' : 
                      isToday ? 'bg-muted text-foreground' : ''
                    )}>
                      {date.getDate()}
                    </div>
                    <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                      {dayEvents.map((event, idx) => (
                        <Badge 
                          key={idx}
                          variant={event.type === 'habit' ? 'default' : 'outline'}
                          className={cn(
                            "truncate text-xs py-0.5 cursor-pointer",
                            event.isCompleted ? "opacity-70 line-through" : "hover:bg-primary/90"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event.id);
                          }}
                        >
                          {event.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
