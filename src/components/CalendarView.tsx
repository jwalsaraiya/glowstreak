
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

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      if (onDateSelect) onDateSelect(date);
    }
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    if (onEventClick) onEventClick(eventId);
  };

  // Navigate through months
  const changeMonth = (direction: 'prev' | 'next') => {
    setViewDate(prevDate => 
      direction === 'prev' ? subMonths(prevDate, 1) : addMonths(prevDate, 1)
    );
  };

  // Get days of week header based on first day setting
  const getDaysOfWeek = () => {
    const days = firstDayOfWeek === "monday" 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days;
  };

  // Get events for a specific date and filter out events that shouldn't be shown yet
  const getEventsForDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events.filter(event => {
      const eventDate = new Date(event.date);
      const startDate = event.startDate ? new Date(event.startDate) : eventDate;
      startDate.setHours(0, 0, 0, 0);
      
      // Don't show events before their start date
      if (isBefore(date, startDate)) {
        return false;
      }
      
      return isSameDay(eventDate, date);
    });
  };

  // Determine if an event should be locked (can't be completed)
  const isEventLocked = (event: CalendarEvent) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    
    // Events in the future should be locked
    return isBefore(today, eventDate);
  };

  // Organize days into weeks for grid display
  const organizeDaysIntoWeeks = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const firstDay = monthStart.getDay();
    const adjustedFirstDay = (firstDay - (weekStartsOn === 1 ? 1 : 0) + 7) % 7;
    
    const daysWithEmptySpaces = [];
    
    // Add empty spaces for days before the 1st of the month
    for (let i = 0; i < adjustedFirstDay; i++) {
      daysWithEmptySpaces.push(null);
    }
    
    // Add all days of the month
    monthDays.forEach(day => {
      daysWithEmptySpaces.push(day);
    });
    
    // Make sure we have complete weeks (rows of 7)
    while (daysWithEmptySpaces.length % 7 !== 0) {
      daysWithEmptySpaces.push(null);
    }
    
    // Split into weeks
    const weeks = [];
    for (let i = 0; i < daysWithEmptySpaces.length; i += 7) {
      weeks.push(daysWithEmptySpaces.slice(i, i + 7));
    }
    
    return weeks;
  };

  const weeks = organizeDaysIntoWeeks();
  const daysOfWeek = getDaysOfWeek();

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
                        {dateEvents.map((event, idx) => (
                          <Badge 
                            key={idx}
                            variant={event.type === 'event' ? 'secondary' : 'outline'}
                            className={cn(
                              "truncate text-xs py-0.5 cursor-pointer",
                              event.isCompleted ? "opacity-70 line-through" : "",
                              isEventLocked(event) ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"
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
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Selected date events */}
          <div className="border-t mt-4 pt-4 px-4 pb-4">
            <h3 className="text-lg font-semibold mb-3">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).length > 0 ? (
                getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-md",
                      event.type === 'event' ? "bg-secondary border-l-2 border-blue-400" : 
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
                      <Badge variant="outline">{event.type}</Badge>
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
