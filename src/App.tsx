
import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import HabitForm from "./components/HabitForm";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { ItemType } from "./components/HabitForm";

// Create a new query client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [formType, setFormType] = React.useState<ItemType>('habit');
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleCreateItem = (values: any) => {
    if (!user) return;
    
    const userData = localStorage.getItem(`userData_${user.id}`);
    const parsedData = userData ? JSON.parse(userData) : { habits: [], tasks: [], events: [] };
    
    const itemId = Math.random().toString(36).substring(2, 9); // Generate a random ID
    
    // Create new item with proper ID and dates
    const newItem = {
      ...values,
      id: itemId,
      date: values.startDate.toISOString(),
      startDate: values.startDate.toISOString(), // Store start date separately for recurrence checks
      streak: 0,
      completionDates: []
    };
    
    // Add to the appropriate array based on item type
    switch(values.itemType) {
      case 'habit':
        parsedData.habits = [...(parsedData.habits || []), newItem];
        break;
      case 'event':
        parsedData.events = [...(parsedData.events || []), newItem];
        break;
      case 'task':
        parsedData.tasks = [...(parsedData.tasks || []), newItem];
        break;
    }
    
    // Save back to localStorage
    localStorage.setItem(`userData_${user.id}`, JSON.stringify(parsedData));
    
    let message = '';
    switch(values.itemType) {
      case 'habit':
        message = 'Habit created successfully!';
        break;
      case 'event':
        message = 'Event added to your calendar!';
        break;
      case 'task':
        message = 'Task created successfully!';
        break;
    }
    
    toast({
      title: message,
      description: `${values.title} has been added to your schedule.`,
    });
    
    setIsFormOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const openHabitForm = (type: ItemType = 'habit') => {
    setFormType(type);
    setIsFormOpen(true);
  };

  // If loading, show loading screen 
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not authenticated, don't render the Navbar or HabitForm
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar onCreateHabit={() => openHabitForm('habit')} onCreateOneTime={() => openHabitForm('task')} onCreateEvent={() => openHabitForm('event')} />
      <main className="flex-1 overflow-y-auto pb-16 pt-2">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard 
                onAddHabit={() => openHabitForm('habit')}
                onAddTask={() => openHabitForm('task')}
                onAddEvent={() => openHabitForm('event')}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
              />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onCreateHabit={() => openHabitForm('habit')}
                onCreateOneTime={() => openHabitForm('task')}
                onCreateEvent={() => openHabitForm('event')}
              />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <HabitForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreateItem}
        defaultValues={{
          itemType: formType,
          date: selectedDate
        }}
      />
    </>
  );
};

const App: React.FC = () => {
  // Add CSS to hide the Lovable popup
  useEffect(() => {
    // Create a style element to hide the popup
    const style = document.createElement('style');
    style.textContent = `
      /* Hide the "Edit with Lovable" popup */
      #lovable-edit-button, 
      .lovable-button, 
      [id*="lovable-"], 
      [class*="lovable-"],
      .lovable-badge { 
        display: none !important; 
        visibility: hidden !important; 
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex h-screen overflow-hidden">
                <AppContent />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
