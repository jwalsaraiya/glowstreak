
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import HabitForm from "./components/HabitForm";

const queryClient = new QueryClient();

const App = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex h-screen overflow-hidden">
            <Navbar onCreateHabit={() => setIsFormOpen(true)} />
            <main className="flex-1 overflow-y-auto pb-16">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <HabitForm
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            onSubmit={() => {}}
          />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
