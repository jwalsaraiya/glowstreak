
import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WeeklyDateBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  firstDayOfWeek?: "sunday" | "monday";
}

const WeeklyDateBar: React.FC<WeeklyDateBarProps> = ({ 
  selectedDate, 
  onDateSelect,
  firstDayOfWeek = "sunday"
}) => {
  const weekStartsOn = firstDayOfWeek === "monday" ? 1 : 0;
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(selectedDate, { weekStartsOn })
  );
  
  useEffect(() => {
    // Update week if selected date changes to a different week
    const selectedWeekStart = startOfWeek(selectedDate, { weekStartsOn });
    if (!isSameDay(selectedWeekStart, currentWeekStart)) {
      setCurrentWeekStart(selectedWeekStart);
    }
  }, [selectedDate, currentWeekStart, weekStartsOn]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = direction === 'next' 
      ? addWeeks(currentWeekStart, 1) 
      : subWeeks(currentWeekStart, 1);
    
    setCurrentWeekStart(newWeekStart);
    
    // Select the same day of week in the new week
    const dayOfWeek = selectedDate.getDay();
    const newDate = new Date(newWeekStart);
    newDate.setDate(newWeekStart.getDate() + (dayOfWeek - weekStartsOn + 7) % 7);
    onDateSelect(newDate);
  };
  
  // Generate all days in the current week
  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart, { weekStartsOn })
  });

  return (
    <div className="bg-card rounded-lg border p-2">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateWeek('prev')}
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm font-medium">
          {format(currentWeekStart, 'MMM d')} - {format(endOfWeek(currentWeekStart, { weekStartsOn }), 'MMM d, yyyy')}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigateWeek('next')}
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, index) => {
          const isCurrentDay = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const isInFuture = isBefore(new Date(), day);
          
          return (
            <div 
              key={index}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex flex-col items-center py-2 rounded-md cursor-pointer transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : 
                isCurrentDay ? "bg-muted" : "hover:bg-accent/50"
              )}
            >
              <span className="text-xs font-medium">
                {format(day, 'E')}
              </span>
              <span className={cn(
                "text-lg rounded-full h-8 w-8 flex items-center justify-center mt-1",
                isInFuture ? "opacity-60" : ""
              )}>
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyDateBar;
