import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import DashboardHome from "./pages/DashboardHome";
import MemberArticles from "./pages/MemberArticles";
import ArticlesGoogleDrive from "./pages/ArticlesGoogleDrive";
import ArticleDetail from "./pages/ArticleDetail";
import TopicDetail from "./pages/TopicDetail";
import Webinars from "./pages/Webinars";
import Events from "./pages/Events";
import ChatImport from "./pages/ChatImport";
import Memories from "./pages/Memories";
import MemoriesGoogleDrive from "./pages/MemoriesGoogleDrive";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
