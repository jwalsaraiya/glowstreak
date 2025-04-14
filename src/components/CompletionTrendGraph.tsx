
import React, { useRef, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from '@/hooks/use-theme';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isSameWeek } from 'date-fns';

interface DataItem {
  name: string;
  value: number;
  tooltip?: string;
  totalDays?: number;
  completedDays?: number;
  isCurrent?: boolean;
  isFuture?: boolean;
}

interface CompletionTrendGraphProps {
  data: DataItem[];
  range: 'weekly' | 'monthly';
  isDarkTheme: boolean;
}

export const CompletionTrendGraph: React.FC<CompletionTrendGraphProps> = ({
  data,
  range,
  isDarkTheme
}) => {
  const primaryColor = '#0d968b';
  const highlightColor = '#f97316'; // Bright orange for current week
  const futureColor = '#d4d4d8'; // Light gray for future weeks/months
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const filteredData = data.filter(item => !item.isFuture);
  
  const avgCompletion = filteredData.length 
    ? Math.round(filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length) 
    : 0;

  const getChartWidth = () => {
    const barWidth = range === 'weekly' ? 55 : 75;
    const barGap = range === 'weekly' ? 50 : 60;
    return Math.max(data.length * (barWidth + barGap), 800);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    
    return (
      <div className={`px-3 py-2 rounded-md shadow-lg ${isDarkTheme ? 'bg-background border border-border' : 'bg-white'}`}>
        <p className="font-medium text-sm">
          {range === 'weekly' 
            ? item.tooltip || label 
            : `${label}: ${item.isFuture ? 'Upcoming' : `${item.completedDays || 0}/${item.totalDays || 0} days`}`}
        </p>
        {!item.isFuture && (
          <p className="font-bold text-lg mt-1 text-primary">
            {payload[0].value}% <span className="text-xs font-normal text-muted-foreground">completed</span>
          </p>
        )}
        {item.isCurrent && (
          <p className="text-xs font-medium mt-1 text-orange-500">Current {range === 'weekly' ? 'Week' : 'Month'}</p>
        )}
        {item.isFuture && (
          <p className="text-xs font-medium mt-1 text-muted-foreground">Upcoming {range === 'weekly' ? 'Week' : 'Month'}</p>
        )}
      </div>
    );
  };

  const scrollChart = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      const currentIndex = data.findIndex(item => item.isCurrent);
      if (currentIndex !== -1) {
        const barWidth = range === 'weekly' ? 55 : 75;
        const barGap = range === 'weekly' ? 50 : 60;
        const scrollPosition = (currentIndex * (barWidth + barGap)) - (scrollRef.current.clientWidth / 2) + barWidth;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [data, range]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current && e.deltaY !== 0) {
        e.preventDefault();
        scrollRef.current.scrollBy({
          left: e.deltaY,
        });
      }
    };

    const currentRef = scrollRef.current;
    
    if (currentRef) {
      currentRef.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex-grow w-full relative min-h-[240px] max-w-full">
        <div 
          ref={scrollRef}
          className="overflow-x-auto pb-4 hide-scrollbar"
          style={{ 
            width: '100%', 
            minHeight: '240px',
            scrollbarWidth: 'none',  /* Firefox */
            msOverflowStyle: 'none',  /* IE and Edge */
          }}
        >
          <div
            style={{ 
              width: `${getChartWidth()}px`, 
              minHeight: '240px' 
            }}
            className="relative"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 25, left: 25, bottom: 45 }}
                barCategoryGap={range === 'weekly' ? 50 : 60}
                barSize={range === 'weekly' ? 55 : 75}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkTheme ? '#33333a' : '#eee'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={25}
                  axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
                  tickLine={false}
                  height={45}
                  interval={0}
                />
                <YAxis 
                  unit="%" 
                  domain={[0, 100]} 
                  tickMargin={10} 
                  tick={{ fontSize: 12 }} 
                  axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
                  tickLine={false}
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  radius={[4, 4, 0, 0]} 
                  className="hover:opacity-80 transition-opacity"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isFuture 
                        ? futureColor 
                        : (entry.isCurrent 
                            ? highlightColor 
                            : (entry.value >= avgCompletion ? primaryColor : (isDarkTheme ? '#555' : '#d4d4d8')))} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <style>
          {`.hide-scrollbar::-webkit-scrollbar {
            display: none;
          }`}
        </style>
        
        <div className="absolute top-1/2 left-0 -translate-y-1/2 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full opacity-80 shadow-md"
            onClick={() => scrollChart('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full opacity-80 shadow-md"
            onClick={() => scrollChart('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mt-2 flex items-center justify-center gap-3">
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span>Average Completion: <span className="font-semibold">{avgCompletion}%</span></span>
        </Badge>
        
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: highlightColor }}
          />
          <span>Current {range === 'weekly' ? 'Week' : 'Month'}</span>
        </Badge>
        
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: futureColor }}
          />
          <span>Upcoming</span>
        </Badge>
      </div>
    </div>
  );
};
