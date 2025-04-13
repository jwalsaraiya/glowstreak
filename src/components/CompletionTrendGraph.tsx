
import React, { useRef, useEffect } from 'react';
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

interface DataItem {
  name: string;
  value: number;
  tooltip?: string;
  totalDays?: number;
  completedDays?: number;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Calculate the average completion rate
  const avgCompletion = data.length 
    ? Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length) 
    : 0;

  // Determine chart width based on data length
  const getChartWidth = () => {
    const baseWidth = range === 'weekly' ? 50 : 80; // Width per bar
    return Math.max(data.length * baseWidth, 800); // Ensure minimum width
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const item = payload[0].payload;
    
    return (
      <div className={`px-3 py-2 rounded-md shadow-lg ${isDarkTheme ? 'bg-background border border-border' : 'bg-white'}`}>
        <p className="font-medium text-sm">
          {range === 'weekly' 
            ? item.tooltip || label 
            : `${label}: ${item.completedDays || 0}/${item.totalDays || 0} days`}
        </p>
        <p className="font-bold text-lg mt-1 text-primary">
          {payload[0].value}% <span className="text-xs font-normal text-muted-foreground">completed</span>
        </p>
      </div>
    );
  };

  // Handle scroll with buttons
  const scrollChart = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust scroll amount as needed
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Enable horizontal scrolling for touch and wheel events
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current && e.deltaY !== 0) {
        // If the user is holding shift, scroll horizontally
        if (e.shiftKey) {
          e.preventDefault();
          scrollRef.current.scrollBy({
            left: e.deltaY,
          });
        }
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
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                barCategoryGap={range === 'weekly' ? 12 : 16}
                barSize={range === 'weekly' ? 32 : 50}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkTheme ? '#33333a' : '#eee'} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }} 
                  tickMargin={10}
                  axisLine={{ stroke: isDarkTheme ? '#33333a' : '#eee' }}
                  tickLine={false}
                  height={30}
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
                      fill={entry.value >= avgCompletion ? primaryColor : (isDarkTheme ? '#555' : '#d4d4d8')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Add CSS to hide scrollbar but allow scrolling */}
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {/* Scroll buttons */}
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
      
      {/* Average display below the graph */}
      <div className="mt-2 flex items-center justify-center">
        <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 text-sm">
          <div 
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span>Average Completion: <span className="font-semibold">{avgCompletion}%</span></span>
        </Badge>
      </div>
    </div>
  );
};
