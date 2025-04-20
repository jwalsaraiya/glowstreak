
import React, { useState, useRef, useEffect } from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TrendDataItem {
  name: string;
  value: number;
  tooltip?: string;
  isCurrent?: boolean;
  isFuture?: boolean;
  totalDays?: number;
  completedDays?: number;
}

interface CompletionTrendGraphProps {
  data: TrendDataItem[];
  range: 'weekly' | 'monthly';
  isDarkTheme: boolean;
}

export const CompletionTrendGraph: React.FC<CompletionTrendGraphProps> = ({
  data,
  range,
  isDarkTheme
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  
  // Find current week/month to scroll to it on initial render
  const currentIndex = data.findIndex(item => item.isCurrent);
  
  // Calculate average completion percentage (only for valid timeframes - not future)
  const validItems = data.filter(item => !item.isFuture);
  const averageCompletion = validItems.length > 0
    ? Math.round(validItems.reduce((sum, item) => sum + item.value, 0) / validItems.length)
    : 0;
  
  // Set up constants for bar sizes and spacing
  const barWidth = range === 'weekly' ? 20 : 40; // Different bar widths for weekly vs monthly
  const barGap = range === 'weekly' ? 10 : 20;
  const computedChartWidth = data.length * (barWidth + barGap);

  useEffect(() => {
    if (scrollRef.current) {
      // Get the container dimensions
      const containerRect = scrollRef.current.getBoundingClientRect();
      setContainerWidth(containerRect.width);
      
      // Calculate the maximum scroll position
      setMaxScroll(Math.max(0, computedChartWidth - containerRect.width));
      setChartWidth(computedChartWidth);
      
      // Scroll to current week/month on initial render
      if (currentIndex > -1) {
        const scrollTo = Math.max(0, 
          (currentIndex * (barWidth + barGap)) - (containerRect.width / 2) + (barWidth / 2));
        scrollRef.current.scrollLeft = scrollTo;
        setScrollPosition(scrollTo);
      }
    }
  }, [data, range, containerWidth, currentIndex, barWidth, barGap, computedChartWidth]);

  // Handle scroll event
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollLeft);
    }
  };

  // Scroll left/right functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      const newPosition = Math.max(0, scrollPosition - containerWidth * 0.75);
      scrollRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };
  
  const scrollRight = () => {
    if (scrollRef.current) {
      const newPosition = Math.min(maxScroll, scrollPosition + containerWidth * 0.75);
      scrollRef.current.scrollLeft = newPosition;
      setScrollPosition(newPosition);
    }
  };
  
  // Get customized tooltip content
  const getTooltipContent = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <div className="grid gap-1">
            <div className="font-medium">
              {data.tooltip || data.name}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">Completion rate:</span>
              <span className="font-medium text-sm">{data.value}%</span>
            </div>
            {data.totalDays !== undefined && data.completedDays !== undefined && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground text-xs">Completed:</span>
                <span className="font-medium text-sm">{data.completedDays}/{data.totalDays} days</span>
              </div>
            )}
            {data.isFuture && (
              <div className="text-muted-foreground text-xs italic mt-1">
                Upcoming
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={scrollLeft} 
            variant="outline" 
            size="icon" 
            disabled={scrollPosition <= 0}
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            onClick={scrollRight} 
            variant="outline" 
            size="icon" 
            disabled={scrollPosition >= maxScroll}
            aria-label="Scroll right"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea 
          ref={scrollRef} 
          className="h-[300px] overflow-x-auto" 
          onScroll={handleScroll}
        >
          <div style={{ width: `${Math.max(containerWidth, chartWidth)}px`, minWidth: '100%' }}>
            <ChartContainer
              config={{
                current: { 
                  theme: { 
                    light: "#f97316", 
                    dark: "#f97316" 
                  }
                },
                default: { 
                  theme: { 
                    light: "#0d968b", 
                    dark: "#0d968b" 
                  }
                },
                future: { 
                  theme: { 
                    light: "#d1d5db", 
                    dark: "#6b7280" 
                  }
                }
              }}
            >
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={data}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 30,
                  }}
                  barSize={barWidth}
                  barGap={barGap}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkTheme ? '#e5e7eb' : '#4b5563' }}
                    height={50}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDarkTheme ? '#e5e7eb' : '#4b5563' }}
                    domain={[0, 100]}
                    tickCount={6}
                    width={30}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <ChartTooltip
                    content={getTooltipContent}
                    cursor={{ fill: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.isFuture ? 'var(--color-future)' :
                          entry.isCurrent ? 'var(--color-current)' : 
                          'var(--color-default)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#0d968b]" />
            <span className="text-xs text-muted-foreground">Standard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#f97316]" />
            <span className="text-xs text-muted-foreground">Current {range === 'weekly' ? 'Week' : 'Month'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
            <span className="text-xs text-muted-foreground">Upcoming</span>
          </div>
        </div>
        <Badge variant="outline" className="font-mono">
          Average Completion: {averageCompletion}%
        </Badge>
      </div>
    </div>
  );
};
