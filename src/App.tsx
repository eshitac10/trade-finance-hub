import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Forum from "./pages/Forum";
import TopicDetail from "./pages/TopicDetail";
import Events from "./pages/Events";
import Webinars from "./pages/Webinars";
import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import NotFound from "./pages/NotFound";
import ArticlesGoogleDrive from "./pages/ArticlesGoogleDrive";
import MemberArticles from "./pages/MemberArticles";
import ArticleView from "./pages/ArticleView";
import ArticleDetail from "./pages/ArticleDetail";
import ChatImport from "./pages/ChatImport";
import Memories from "./pages/Memories";
import MemoriesGoogleDrive from "./pages/MemoriesGoogleDrive";
import Statistics from "./pages/Statistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:topicId" element={<TopicDetail />} />
          <Route path="/events" element={<Events />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/members" element={<Members />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/home" element={<DashboardHome />} />
          <Route path="/articles" element={<ArticlesGoogleDrive />} />
          <Route path="/articles/member" element={<MemberArticles />} />
          <Route path="/articles/view/:id" element={<ArticleView />} />
          <Route path="/articles/:slug" element={<ArticleDetail />} />
          <Route path="/chat-import" element={<ChatImport />} />
          <Route path="/memories" element={<Memories />} />
          <Route path="/memories/google-drive" element={<MemoriesGoogleDrive />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
