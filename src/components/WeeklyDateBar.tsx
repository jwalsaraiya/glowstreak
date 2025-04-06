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

interface MonthlyDateBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  firstDayOfWeek?: "sunday" | "monday";
}

const MonthlyDateBar: React.FC<MonthlyDateBarProps> = ({ 
  selectedDate, 
  onDateSelect,
  firstDayOfWeek = "sunday"
}) => {
  const weekStartsOn = firstDayOfWeek === "monday" ? 1 : 0;
  const [currentMonthDate, setCurrentMonthDate] = useState(startOfMonth(selectedDate));
  
  useEffect(() => {
    // Update month if selected date changes to a different month
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
    
    // When navigating months, keep the same day of month if possible
    const newDate = new Date(selectedDate);
    newDate.setFullYear(newMonthDate.getFullYear(), newMonthDate.getMonth(), selectedDate.getDate());
    
    // Handle cases where the day doesn't exist in the new month (e.g., Feb 30)
    const lastDayOfNewMonth = endOfMonth(newMonthDate).getDate();
    if (selectedDate.getDate() > lastDayOfNewMonth) {
      newDate.setDate(lastDayOfNewMonth);
    }
    
    onDateSelect(newDate);
  };
  
  // Generate all days in the current month
  const monthDays = eachDayOfInterval({
    start: currentMonthDate,
    end: endOfMonth(currentMonthDate)
  });

  // Get days of week header based on first day setting
  const getDaysOfWeek = () => {
    const days = firstDayOfWeek === "monday" 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return days;
  };

  // Organize days into weeks for grid display
  const organizeDaysIntoWeeks = () => {
    const firstDay = currentMonthDate.getDay();
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
              
              return (
                <div 
                  key={`day-${weekIdx}-${dayIdx}`}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "flex flex-col items-center p-1 rounded-md cursor-pointer transition-colors",
                    isSelected ? "bg-primary text-primary-foreground" : 
                    isCurrentDay ? "bg-muted" : "hover:bg-accent/50"
                  )}
                >
                  <span className={cn(
                    "text-lg rounded-full h-8 w-8 flex items-center justify-center",
                    isInFuture ? "opacity-60" : ""
                  )}>
                    {day.getDate()}
                  </span>
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
