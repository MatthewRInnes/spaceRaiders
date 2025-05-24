// Import UI components and utilities
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Initialise the query client for data fetching
const queryClient = new QueryClient();

// Main application component
const App = () => (
  // Wrap the application with necessary providers
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Toast notifications for user feedback */}
      <Toaster />
      <Sonner />
      {/* Set up routing for the application */}
      <BrowserRouter>
        <Routes>
          {/* Main page route */}
          <Route path="/" element={<Index />} />
          {/* Add all custom routes above the catch-all "*" route */}
          {/* 404 page for undefined routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
