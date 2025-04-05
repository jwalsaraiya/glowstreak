
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import HabitForm from "./components/HabitForm";
import { ThemeProvider } from "./hooks/use-theme";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isOneTime, setIsOneTime] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const handleCreateHabit = (oneTime: boolean = false) => {
    setIsOneTime(oneTime);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    toast({
      title: `${isOneTime ? "Task" : "Habit"} created successfully!`,
      description: `Your ${isOneTime ? "task" : "habit"} has been added to your schedule.`,
    });
    setIsFormOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // You can add more functionality here later
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex h-screen overflow-hidden">
              <Navbar onCreateHabit={() => handleCreateHabit(false)} />
              <main className="flex-1 overflow-y-auto pb-16">
                <Routes>
                  <Route path="/" element={
                    <Dashboard 
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      onCreateOneTime={() => handleCreateHabit(true)}
                    />
                  } />
                  <Route path="/calendar" element={
                    <Calendar 
                      selectedDate={selectedDate}
                      onDateSelect={handleDateSelect}
                      onCreateHabit={() => handleCreateHabit(false)}
                      onCreateOneTime={() => handleCreateHabit(true)}
                    />
                  } />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            <HabitForm
              open={isFormOpen}
              onOpenChange={setIsFormOpen}
              onSubmit={handleFormSubmit}
              defaultValues={{
                isOneTime,
                date: selectedDate
              }}
            />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
