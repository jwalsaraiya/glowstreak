
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface CalendarEvent {
  date: Date;
  type: 'habit' | 'event' | 'task';
  title: string;
  id: string;
  isCompleted?: boolean;
  startDate?: Date;
  priority?: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  onEventClick?: (eventId: string) => void;
  onAddEvent?: (date: Date) => void;
  selectedDate?: Date;
  firstDayOfWeek?: "sunday" | "monday";
  showAddButton?: boolean;
  readOnly?: boolean; // Add the readOnly prop to the interface
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  events,
  onDateSelect,
  onEventClick,
  onAddEvent,
  selectedDate: propSelectedDate,
  firstDayOfWeek = "sunday",
  showAddButton = true,
  readOnly = false // Add default value
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
    // We're disabling event clicking for marking completion
    // but keeping the function in case we need it for other purposes like viewing details
    // if (onEventClick) onEventClick(eventId);
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

  // Updated function to check if an event should be displayed on a specific date
  const shouldEventBeDisplayed = (event: CalendarEvent, date: Date) => {
    // Get the start date of the event
    const eventStartDate = new Date(event.startDate || event.date);
    eventStartDate.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    // If the date is before the event start date, don't display it
    if (isBefore(checkDate, eventStartDate)) {
      return false;
    }
    
    // One-time events: only show on the exact date
    if (event.recurrence === 'none' || !event.recurrence) {
      return isSameDay(eventStartDate, checkDate);
    }
    
    // Daily events: show every day after start date
    if (event.recurrence === 'daily') {
      return true;
    }
    
    // Weekly events: show on the same day of week
    if (event.recurrence === 'weekly') {
      return eventStartDate.getDay() === checkDate.getDay();
    }
    
    // Monthly events: show on the same day of month
    if (event.recurrence === 'monthly') {
      return eventStartDate.getDate() === checkDate.getDate();
    }
    
    // Yearly events: show on the same month and day
    if (event.recurrence === 'yearly') {
      return eventStartDate.getDate() === checkDate.getDate() && 
             eventStartDate.getMonth() === checkDate.getMonth();
    }
    
    return false;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => shouldEventBeDisplayed(event, date));
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

  // Get background and text colors based on event type
  const getEventColors = (event: CalendarEvent) => {
    switch (event.type) {
      case 'habit':
        return {
          bg: 'bg-primary/10',
          border: 'border-primary',
          text: 'text-foreground'
        };
      case 'task':
        return event.priority === 'high' 
          ? {
              bg: 'bg-destructive/10',
              border: 'border-destructive',
              text: 'text-foreground'
            }
          : {
              bg: 'bg-yellow-100 dark:bg-yellow-900/30',
              border: 'border-yellow-400',
              text: 'text-foreground'
            };
      case 'event':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          border: 'border-blue-400',
          text: 'text-foreground'
        };
      default:
        return {
          bg: 'bg-secondary',
          border: 'border-secondary',
          text: 'text-foreground'
        };
    }
  };

  const weeks = organizeDaysIntoWeeks();
  const daysOfWeek = getDaysOfWeek();
  
  const selectedDateEvents = sortEvents(getEventsForDate(selectedDate));

  return (
    <ScrollArea className="h-full w-full">
      <Card className="border shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Calendar
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
                          {dateEvents.slice(0, 3).map((event, idx) => {
                            const colors = getEventColors(event);
                            return (
                              <Badge 
                                key={idx}
                                variant={event.type === 'event' ? 'secondary' : 'outline'}
                                className={cn(
                                  "truncate text-xs py-1 cursor-pointer",
                                  colors.text,
                                  event.isCompleted ? "opacity-70 line-through" : "",
                                  isEventLocked(event) ? "opacity-50" : "",
                                  `border-l-2 ${colors.border}`
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // We're now disabling event clicks for completion
                                  // but keeping the onClick handler for future use
                                }}
                              >
                                {event.title}
                              </Badge>
                            );
                          })}
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
                  selectedDateEvents.map((event) => {
                    const colors = getEventColors(event);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "p-3 rounded-md",
                          colors.bg,
                          `border-l-2 ${colors.border}`,
                          colors.text,
                          event.isCompleted ? 'line-through opacity-70' : ''
                        )}
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
                    );
                  })
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
    </ScrollArea>
  );
};

export default CalendarView;
