import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};
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
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import InitializeAdmins from "./pages/InitializeAdmins";
import Security from "./pages/Security";
import EditProfile from "./pages/EditProfile";
import Statistics from "./pages/Statistics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnalyticsWrapper>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/articles" element={<ArticlesGoogleDrive />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/forum/topic/:topicId" element={<TopicDetail />} />
          <Route path="/webinars" element={<Webinars />} />
          <Route path="/events" element={<Events />} />
          <Route path="/chat-import" element={<ChatImport />} />
          <Route path="/memories" element={<MemoriesGoogleDrive />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/initialize-admins" element={<InitializeAdmins />} />
          <Route path="/security" element={<Security />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/statistics" element={<Statistics />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </AnalyticsWrapper>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
