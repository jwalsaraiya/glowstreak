
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  format, 
  addDays, 
  subDays, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  date: Date;
  type: 'habit' | 'event' | 'task';
  title: string;
  id: string;
  isCompleted?: boolean;
  startDate?: Date; // Used for recurrence and filtering
  priority?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate?: Date;
  firstDayOfWeek?: "sunday" | "monday";
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  selectedDate: propSelectedDate,
  firstDayOfWeek = "sunday"
}) => {
  const today = new Date();
  const isMobile = useIsMobile();
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate || today);
  const [viewDate, setViewDate] = useState<Date>(propSelectedDate || today);
  const weekStartsOn = firstDayOfWeek === "monday" ? 1 : 0;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (onDateSelect) onDateSelect(date);
    }
  };

  const handleEventClick = (eventId: string) => {
    if (onEventClick) onEventClick(eventId);
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setViewDate(prevDate => 
      direction === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1)
    );
  };

  const getDaysOfWeek = () => {
    const days = firstDayOfWeek === "monday" 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      const startDate = event.startDate ? new Date(event.startDate) : eventDate;
      startDate.setHours(0, 0, 0, 0);
      
      if (isBefore(date, startDate)) {
        return false;
      }
      
      return isSameDay(eventDate, date);
    });
  };

  const isEventLocked = (event: CalendarEvent) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    return isBefore(today, eventDate);
  };

  const organizeDaysIntoWeeks = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDay = monthStart.getDay();
    const adjustedFirstDay = (firstDay - (weekStartsOn === 1 ? 1 : 0) + 7) % 7;
    
    const daysWithEmptySpaces = [];
    
    for (let i = 0; i < adjustedFirstDay; i++) {
      daysWithEmptySpaces.push(null);
    }
    
    monthDays.forEach(day => {
      daysWithEmptySpaces.push(day);
    });
    
    while (daysWithEmptySpaces.length % 7 !== 0) {
      daysWithEmptySpaces.push(null);
    }
    
    const weeks = [];
    for (let i = 0; i < daysWithEmptySpaces.length; i += 7) {
      weeks.push(daysWithEmptySpaces.slice(i, i + 7));
    }
    
    return weeks;
  };

  const sortEvents = (events: CalendarEvent[]) => {
    return [...events].sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (a.type !== 'event' && b.type === 'event') return 1;
      if (a.type === 'task' && b.type === 'habit') return -1;
      if (a.type === 'habit' && b.type === 'task') return 1;
      
      return 0;
    });
  };

  const weeks = organizeDaysIntoWeeks();
  const daysOfWeek = getDaysOfWeek();
  
  const selectedDateEvents = sortEvents(getEventsForDate(selectedDate));

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
        <div className="mt-0">
          <div className="flex justify-between items-center px-4 pt-2">
            <Button variant="ghost" size="icon" onClick={() => changeMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center">
              <h3 className="text-sm font-medium">
                {format(viewDate, 'MMMM yyyy')}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => handleDateSelect(new Date())}
              >
                Today
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={() => changeMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-medium">
            {daysOfWeek.map(day => (
              <div key={day} className="font-medium">{day}</div>
            ))}
          </div>
          <div className="px-4 pb-4 grid grid-cols-7 gap-1 text-center">
            {weeks.map((week, weekIdx) => (
              <React.Fragment key={weekIdx}>
                {week.map((date, dayIdx) => {
                  if (!date) {
                    return <div key={`empty-${weekIdx}-${dayIdx}`} className="p-2"></div>;
                  }

                  const dateEvents = getEventsForDate(date);
                  const isCurrentDay = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, selectedDate);
                  const isInFuture = isBefore(new Date(), date);

                  return (
                    <div 
                      key={`day-${weekIdx}-${dayIdx}`}
                      className="flex flex-col"
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className={cn(
                        "mb-1 h-7 w-7 rounded-full flex items-center justify-center mx-auto cursor-pointer transition-colors",
                        isSelected ? 'bg-primary text-primary-foreground' : 
                        isCurrentDay ? 'bg-muted text-foreground' : ''
                      )}>
                        {date.getDate()}
                      </div>
                      <div className="flex flex-col gap-1 max-h-[80px] overflow-y-auto">
                        {dateEvents.slice(0, 3).map((event, idx) => (
                          <Badge 
                            key={idx}
                            variant={event.type === 'event' ? 'secondary' : 'outline'}
                            className={cn(
                              "truncate text-xs py-1 cursor-pointer",
                              event.isCompleted ? "opacity-70 line-through" : "",
                              isEventLocked(event) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90",
                              event.priority === 'high' ? "border-l-2 border-destructive" : "",
                              event.type === 'task' ? "border-l-2 border-yellow-400" : "",
                              event.type === 'habit' ? "border-l-2 border-primary" : "",
                              event.type === 'event' ? "border-l-2 border-blue-400" : ""
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isEventLocked(event)) {
                                handleEventClick(event.id);
                              }
                            }}
                          >
                            {event.title}
                          </Badge>
                        ))}
                        {dateEvents.length > 3 && (
                          <span className="text-[9px] calendar-more-text bg-secondary/70 px-1 py-0.5 rounded text-foreground font-medium">
                            +{dateEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 px-4 pb-4">
            <h3 className="text-lg font-semibold mb-3">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-md",
                      event.type === 'event' ? "bg-secondary border-l-2 border-blue-400" : 
                      event.type === 'task' && event.priority === 'high' ? "bg-destructive/10 border-l-2 border-destructive" :
                      event.type === 'task' ? "bg-yellow-100 border-l-2 border-yellow-400" : 
                      "bg-primary/10 border-l-2 border-primary",
                      event.isCompleted ? 'line-through opacity-70' : '',
                      isEventLocked(event) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                    )}
                    onClick={() => {
                      if (!isEventLocked(event)) {
                        handleEventClick(event.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{event.title}</span>
                      <div className="flex gap-1">
                        {event.priority === 'high' && (
                          <Badge variant="destructive">High</Badge>
                        )}
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    </div>
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
      </CardContent>
    </Card>
  );
};

export default CalendarView;
