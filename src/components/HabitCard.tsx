
import React from 'react';
import { Trash2, CheckCircle2, Circle, Flame, Calendar, Clock, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HabitCardProps {
  title: string;
  description?: string;
  category?: string;
  streak?: number;
  priority?: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  isOneTime?: boolean;
  disabled?: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({
  title,
  description,
  category,
  streak = 0,
  priority = 'medium',
  isCompleted,
  isOneTime = false,
  disabled = false,
  onClick,
  onDelete
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-destructive';
      case 'medium':
        return 'border-l-4 border-yellow-400';
      case 'low':
        return 'border-l-4 border-green-400';
      default:
        return 'border-l-4 border-yellow-400';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'high':
        return <Flag className="h-3 w-3 text-destructive" />;
      case 'medium':
        return <Flag className="h-3 w-3 text-yellow-400" />;
      case 'low':
        return <Flag className="h-3 w-3 text-green-400" />;
      default:
        return <Flag className="h-3 w-3 text-yellow-400" />;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className={cn(
        'bg-card relative rounded-lg p-4 shadow-sm transition-all hover:shadow-md',
        isCompleted ? 'opacity-70' : 'opacity-100',
        getPriorityColor()
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-2 mb-2 mt-2">
        <div 
          className={cn(
            "mt-0.5 flex-shrink-0 cursor-pointer",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={disabled ? undefined : (e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 pr-6">
          <h3 className={cn(
            "font-medium leading-tight",
            isCompleted && "line-through"
          )}>
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {category && (
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        )}
        
        {isOneTime ? (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            One time
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            {streak > 0 ? (
              <>
                <Flame className="h-3 w-3" />
                Streak: {streak}
              </>
            ) : (
              <>
                {getPriorityIcon()}
                {priority}
              </>
            )}
          </Badge>
        )}
        
        {disabled && (
          <Badge variant="outline" className="text-xs flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            Future
          </Badge>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
