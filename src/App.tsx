
import React from 'react';
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
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const { isAuthenticated } = useAuth();

  const handleCreateHabit = (values: any) => {
    toast({
      title: `${values.isOneTime ? "Task" : "Habit"} created successfully!`,
      description: `Your ${values.isOneTime ? "task" : "habit"} has been added to your schedule.`,
    });
    setIsFormOpen(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

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
      <Navbar />
      <main className="flex-1 overflow-y-auto pb-16 pt-2">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
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
        onSubmit={handleCreateHabit}
        defaultValues={{
          isOneTime: false,
          date: selectedDate
        }}
      />
    </>
  );
};

const App: React.FC = () => {
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
