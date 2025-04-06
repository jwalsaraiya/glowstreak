import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  type: 'habit' | 'event' | 'task';
  priority?: string;
  isCompleted?: boolean;
}

interface MonthlyDateBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  firstDayOfWeek?: "sunday" | "monday";
  events?: CalendarEvent[];
}

const MonthlyDateBar: React.FC<MonthlyDateBarProps> = ({ 
  selectedDate, 
  onDateSelect,
  firstDayOfWeek = "sunday",
  events = []
}) => {
  const weekStartsOn = firstDayOfWeek === "monday" ? 1 : 0;
  const [currentMonthDate, setCurrentMonthDate] = useState(startOfMonth(selectedDate));
  
  useEffect(() => {
    const selectedMonthStart = startOfMonth(selectedDate);
    if (!isSameDay(selectedMonthStart, currentMonthDate)) {
      setCurrentMonthDate(selectedMonthStart);
    }
  }, [selectedDate, currentMonthDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonthDate = direction === 'next' 
      ? addMonths(currentMonthDate, 1) 
      : subMonths(currentMonthDate, 1);
    
    setCurrentMonthDate(newMonthDate);
    
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newMonthDate.getFullYear(), newMonthDate.getMonth(), selectedDate.getDate());
    
    const lastDayOfNewMonth = endOfMonth(newMonthDate).getDate();
    if (selectedDate.getDate() > lastDayOfNewMonth) {
      newDate.setDate(lastDayOfNewMonth);
    }
    
    onDateSelect(newDate);
  };
  
  const monthDays = eachDayOfInterval({
    start: currentMonthDate,
    end: endOfMonth(currentMonthDate)
  });

  const getDaysOfWeek = () => {
    const days = firstDayOfWeek === "monday" 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days;
  };

  const organizeDaysIntoWeeks = () => {
    const firstDay = currentMonthDate.getDay();
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

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    }).sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      if (a.type === 'event' && b.type !== 'event') return -1;
      if (a.type !== 'event' && b.type === 'event') return 1;
      return 0;
    });
  };

  const weeks = organizeDaysIntoWeeks();
  const daysOfWeek = getDaysOfWeek();

  return (
    <div className="bg-card rounded-lg border p-2">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateMonth('prev')}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium">
          {format(currentMonthDate, 'MMMM yyyy')}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateMonth('next')}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-xs font-medium py-1">
            {day}
          </div>
        ))}

        {weeks.map((week, weekIdx) => (
          <React.Fragment key={weekIdx}>
            {week.map((day, dayIdx) => {
              if (!day) {
                return <div key={`empty-${weekIdx}-${dayIdx}`} className="p-2"></div>;
              }
              
              const isCurrentDay = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const isInFuture = isBefore(new Date(), day);
              const dayEvents = getEventsForDay(day);
              
              return (
                <div 
                  key={`day-${weekIdx}-${dayIdx}`}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "flex flex-col items-center p-1 rounded-md cursor-pointer transition-colors min-h-[90px]",
                    isSelected ? "bg-primary text-primary-foreground" : 
                    isCurrentDay ? "bg-muted" : "hover:bg-accent/50"
                  )}
                >
                  <span className={cn(
                    "text-sm rounded-full h-6 w-6 flex items-center justify-center",
                    isInFuture ? "opacity-60" : ""
                  )}>
                    {day.getDate()}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex flex-col w-full mt-1 gap-1 text-left">
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "text-xs truncate px-1 py-1 rounded",
                            isSelected ? "text-primary-foreground/90" : "text-foreground",
                            event.type === 'event' ? "bg-blue-400/10 border-l border-blue-400" : 
                            event.type === 'task' && event.priority === 'high' ? "bg-destructive/10 border-l border-destructive" :
                            event.type === 'task' ? "bg-yellow-400/10 border-l border-yellow-400" :
                            "bg-primary/10 border-l border-primary",
                            event.isCompleted && "line-through opacity-70"
                          )}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-muted-foreground text-center">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MonthlyDateBar;
