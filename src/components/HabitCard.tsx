
import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface HabitCardProps {
  title: string;
  description?: string;
  category: string;
  streak: number;
  priority: 'low' | 'medium' | 'high';
  isCompleted?: boolean;
  className?: string;
  onClick?: () => void;
}

const priorityClasses = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  high: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
};

const HabitCard: React.FC<HabitCardProps> = ({
  title,
  description,
  category,
  streak,
  priority,
  isCompleted = false,
  className,
  onClick,
}) => {
  const hasLongStreak = streak >= 5;

  return (
    <Card
      className={cn(
        "streak-card hover:cursor-pointer h-full transition-all duration-300",
        isCompleted && "opacity-75 bg-secondary/50",
        className
      )}
      onClick={onClick}
    >
      {hasLongStreak && !isCompleted && <div className="streak-glow"></div>}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col space-y-1">
            <h3 className={cn("font-medium text-lg", isCompleted && "line-through opacity-70")}>
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            )}
          </div>
          {isCompleted ? (
            <CheckCircle className="h-6 w-6 text-primary" />
          ) : (
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-muted-foreground mr-1" />
              <span className="text-sm text-muted-foreground">Today</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <Badge className="rounded-full text-xs">{category}</Badge>
          <div className="flex space-x-2">
            <Badge variant="outline" className={cn("rounded-full text-xs", priorityClasses[priority])}>
              {priority}
            </Badge>
            {streak > 0 && (
              <Badge 
                className={cn(
                  "rounded-full font-semibold",
                  hasLongStreak ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                {streak} day{streak !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
