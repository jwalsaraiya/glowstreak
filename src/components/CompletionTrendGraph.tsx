
import React, { useState, useRef, useEffect } from 'react';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

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
  onYearChange: (year: number) => void;
  selectedYear: number;
}

export const CompletionTrendGraph: React.FC<CompletionTrendGraphProps> = ({
  data,
  range,
  isDarkTheme,
  onYearChange,
  selectedYear
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  
  // Set up constants for bar sizes and spacing
  const barWidth = range === 'weekly' ? 20 : 40;
  const barGap = range === 'weekly' ? 10 : 20;
  const computedChartWidth = (range === 'weekly' ? 53 : 12) * (barWidth + barGap);
  
  // Calculate average completion percentage
  const validItems = data.filter(item => !item.isFuture);
  const averageCompletion = validItems.length > 0
    ? Math.round(validItems.reduce((sum, item) => sum + item.value, 0) / validItems.length)
    : 0;

  // Generate year options dynamically
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(currentYear - 10, 2020); // Set a reasonable lower bound
  const yearOptions = Array.from(
    { length: currentYear - startYear + 3 }, 
    (_, i) => currentYear - i + 1
  ).filter(year => year >= startYear);

  useEffect(() => {
    if (scrollRef.current) {
      const containerRect = scrollRef.current.getBoundingClientRect();
      setContainerWidth(containerRect.width);
      setChartWidth(computedChartWidth);
      
      // Scroll to current time period on initial render
      const currentIndex = data.findIndex(item => item.isCurrent);
      if (currentIndex > -1) {
        const scrollTo = Math.max(0, 
          (currentIndex * (barWidth + barGap)) - (containerRect.width / 2) + (barWidth / 2));
        scrollRef.current.scrollLeft = scrollTo;
      }
    }
  }, [data, range, barWidth, barGap, computedChartWidth]);

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
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <Select 
          value={selectedYear.toString()} 
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-sm bg-[#f97316] mr-2"></div>
          <span className="text-xs text-muted-foreground">Current {range === 'weekly' ? 'Week' : 'Month'}</span>
        </div>
      </div>
      
      <div className="border rounded-md">
        <ScrollArea 
          ref={scrollRef} 
          className="h-[250px] overflow-x-auto overflow-y-hidden"
        >
          <ScrollBar orientation="horizontal" />
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
                }
              }}
            >
              <ResponsiveContainer width="100%" height={200}>
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
                        fill={entry.isCurrent ? 'var(--color-current)' : 'var(--color-default)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </ScrollArea>
      </div>

      <div className="flex justify-end">
        <Badge variant="outline" className="font-mono">
          Average Completion: {averageCompletion}%
        </Badge>
      </div>
    </div>
  );
};
